import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useNotification } from '../components/NotificationToast'
import { useConfirmDialog } from '../components/ConfirmDialog'

export default function MyRides() {
  const { token, user } = useAuth() || {}
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const nav = useNavigate()
  const { showNotification } = useNotification()
  const { showDialog } = useConfirmDialog()

  // Check if user is logged in
  useEffect(() => {
    if (!token) {
      showNotification('You must be logged in to view this page', 'error')
      nav('/login')
      return
    }
    fetchMyRides()
  }, [token])

  const fetchMyRides = async () => {
    if (!token) {
      console.error('No token available')
      return
    }
    try {
      console.log('Fetching rides with token:', token ? 'exists' : 'missing')
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/my-rides`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Fetched rides:', res.data)
      setRides(res.data)
    } catch (err) {
      console.error('Fetch rides error:', err)
      setMsg('Failed to load your rides')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRide = async (rideId) => {
    const confirmed = await showDialog({
      title: 'Cancel Ride',
      message: 'Are you sure you want to cancel this ride?',
      confirmText: 'Yes, Cancel',
      cancelText: 'No',
      type: 'warning'
    })
    
    if (!confirmed) return
    
    try {
      console.log('Cancelling ride:', rideId)
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMsg('✅ Ride cancelled successfully')
      showNotification('Ride cancelled successfully', 'success')
      fetchMyRides()
    } catch (err) {
      console.error('Cancel error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to cancel ride'
      setMsg('❌ ' + errorMsg)
      showNotification(errorMsg, 'error')
    }
  }

  const handleDeleteRide = async (rideId) => {
    const confirmed = await showDialog({
      title: 'Delete Ride',
      message: 'Are you sure you want to delete this ride? This cannot be undone.',
      confirmText: 'Yes, Delete',
      cancelText: 'No',
      type: 'error'
    })
    
    if (!confirmed) return
    
    try {
      console.log('Deleting ride:', rideId)
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMsg('✅ Ride deleted successfully')
      showNotification('Ride deleted successfully', 'success')
      fetchMyRides()
    } catch (err) {
      console.error('Delete error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to delete ride'
      setMsg('❌ ' + errorMsg)
      showNotification(errorMsg, 'error')
    }
  }

  const handleConfirmBooking = async (rideId, bookingId) => {
    if (!token) {
      showNotification('You must be logged in to perform this action', 'error')
      nav('/login')
      return
    }
    try {
      console.log('Confirming booking:', { rideId, bookingId, token: token ? 'exists' : 'missing' })
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/bookings/${bookingId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('Confirm response:', res.data)
      setMsg('✅ ' + (res.data.message || 'Booking confirmed'))
      showNotification(res.data.message || 'Booking confirmed', 'success')
      fetchMyRides()
    } catch (err) {
      console.error('Confirm error:', err)
      console.error('Error response:', err.response)
      let errorMsg = err.response?.data?.message || 'Failed to confirm booking'
      if (err.response?.status === 403) {
        errorMsg = 'Only the ride provider can confirm bookings. Please log in as the user who created this ride.'
      }
      setMsg('❌ ' + errorMsg)
      showNotification(errorMsg, 'error')
    }
  }

  const handleDeclineBooking = async (rideId, bookingId) => {
    if (!token) {
      showNotification('You must be logged in to perform this action', 'error')
      nav('/login')
      return
    }
    try {
      console.log('Declining booking:', { rideId, bookingId, token: token ? 'exists' : 'missing' })
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/bookings/${bookingId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('Decline successful')
      setMsg('✅ Booking declined')
      showNotification('Booking declined', 'success')
      fetchMyRides()
    } catch (err) {
      console.error('Decline error:', err)
      console.error('Error response:', err.response)
      let errorMsg = err.response?.data?.message || 'Failed to decline booking'
      if (err.response?.status === 403) {
        errorMsg = 'Only the ride provider can decline bookings. Please log in as the user who created this ride.'
      }
      setMsg('❌ ' + errorMsg)
      showNotification(errorMsg, 'error')
    }
  }

  const handleMarkComplete = async (rideId, bookingId) => {
    if (!token) {
      showNotification('You must be logged in to perform this action', 'error')
      nav('/login')
      return
    }
    
    const confirmed = await showDialog({
      title: 'Mark Ride as Complete',
      message: 'Are you sure you want to mark this ride as complete? This requires confirmation from both the provider and passenger.',
      confirmText: 'Yes, Complete',
      cancelText: 'Cancel',
      type: 'info'
    })
    
    if (!confirmed) return
    
    try {
      console.log('Marking ride as complete:', { rideId, bookingId })
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/bookings/${bookingId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('Complete response:', res.data)
      setMsg('✅ ' + (res.data.message || 'Ride marked as complete'))
      showNotification(res.data.message || 'Ride marked as complete', 'success')
      fetchMyRides()
    } catch (err) {
      console.error('Mark complete error:', err)
      console.error('Error response:', err.response)
      let errorMsg = err.response?.data?.message || 'Failed to mark ride as complete'
      setMsg('❌ ' + errorMsg)
      showNotification(errorMsg, 'error')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-6 px-4">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-shimmer"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
        </div>
        
        {/* Loading skeletons */}
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="mb-6 p-6 rounded-xl border animate-fadeIn" 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              animationDelay: `${i * 0.1}s`
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-shimmer"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24 animate-shimmer"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-shimmer"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const activeRides = rides.filter(r => r.status === 'open')
  const cancelledRides = rides.filter(r => r.status === 'cancelled')
  const completedRides = rides.filter(r => r.status === 'completed')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy-600), var(--navy-700))',
        padding: 'clamp(32px, 6vw, 60px) clamp(16px, 3vw, 24px)',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 42px)',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                fontFamily: 'var(--font-family-heading)'
              }}>
                🚗 My Rides
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                Manage your created rides and bookings
              </p>
            </div>
            
            <button
              onClick={() => nav('/provide')}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = 'var(--navy-600)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.color = 'white'
              }}
            >
              ➕ Create New Ride
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(16px, 3vw, 24px)' }}>
        {/* Stats Overview */}
        {rides.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              borderTop: '3px solid #10b981'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {activeRides.length}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active Rides</div>
            </div>
            
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              borderTop: '3px solid #eab308'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {rides.reduce((sum, r) => sum + (r.bookings?.length || 0), 0)}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Bookings</div>
            </div>
            
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              borderTop: '3px solid #8b5cf6'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {completedRides.length}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Completed</div>
            </div>
            
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              borderTop: '3px solid #ef4444'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {cancelledRides.length}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Cancelled</div>
            </div>
          </div>
        )}

        {msg && (
          <div 
            style={{
              marginBottom: '24px',
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: msg.includes('✅') ? '#d4edda' : '#f8d7da',
              color: msg.includes('✅') ? '#155724' : '#721c24',
              border: `1px solid ${msg.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              animation: 'slideDown 0.3s ease'
            }}
          >
            {msg}
          </div>
        )}

        {rides.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(40px, 8vw, 80px) 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '2px dashed var(--border-color)'
          }}>
            <div style={{ fontSize: 'clamp(60px, 12vw, 80px)', marginBottom: '24px' }}>🚗</div>
            <h2 style={{
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}>
              No rides created yet
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              maxWidth: '500px',
              margin: '0 auto 32px'
            }}>
              Start by creating your first ride and help others get around campus!
            </p>
            <button
              onClick={() => nav('/provide')}
              style={{
                padding: '14px 32px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--navy-600), var(--navy-700))',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              ➕ Create Your First Ride
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {rides.map(ride => (
              <div 
                key={ride._id} 
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  padding: 'clamp(20px, 4vw, 28px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Ride Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <h3 style={{
                      fontSize: 'clamp(20px, 4vw, 24px)',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      marginBottom: '12px',
                      fontFamily: 'var(--font-family-heading)'
                    }}>
                      {ride.from} → {ride.to}
                    </h3>
                    
                    {/* Ride Details */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📅</span>
                        <span>{new Date(ride.date).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🕐</span>
                        <span>{ride.time || new Date(ride.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💺</span>
                        <span>{ride.seatsAvailable} seats</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💰</span>
                        <span>₹{ride.price}</span>
                      </div>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: ride.status === 'open' ? '#d1fae520' :
                                       ride.status === 'cancelled' ? '#fee2e220' :
                                       ride.status === 'completed' ? '#dbeafe20' : '#f3f4f620',
                        color: ride.status === 'open' ? '#10b981' :
                               ride.status === 'cancelled' ? '#ef4444' :
                               ride.status === 'completed' ? '#3b82f6' : '#6b7280'
                      }}>
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {ride.status === 'open' && (
                      <>
                        <button
                          onClick={() => handleCancelRide(ride._id)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.3)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <span>🔄</span> Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteRide(ride._id)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <span>🗑️</span> Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => nav(`/chat/${ride._id}`)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '2px solid var(--navy-600)',
                        background: 'transparent',
                        color: 'var(--navy-600)',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--navy-600)'
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--navy-600)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <span>💬</span> Chat
                    </button>
                  </div>
                </div>

                {/* Bookings Section */}
                {ride.bookings && ride.bookings.length > 0 && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>📋</span> Bookings ({ride.bookings.length})
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {ride.bookings.map(booking => (
                        <div 
                          key={booking._id} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            backgroundColor: 'var(--bg-primary)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          {/* User Info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '200px' }}>
                            {booking.user?.profilePhoto ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${booking.user.profilePhoto}`}
                                alt={booking.user.name}
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid var(--border-color)'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--gold-accent), #b8935f)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                {booking.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            
                            <div style={{ flex: 1 }}>
                              <p style={{
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                marginBottom: '2px',
                                fontSize: '15px'
                              }}>
                                {booking.user?.name || 'Unknown User'}
                              </p>
                              <p style={{
                                fontSize: '13px',
                                color: 'var(--text-secondary)'
                              }}>
                                {booking.user?.email || 'No email'}
                              </p>
                              <p style={{
                                fontSize: '13px',
                                color: 'var(--text-secondary)',
                                marginTop: '4px',
                                fontWeight: '500'
                              }}>
                                💺 {booking.seats || 1} seat(s)
                              </p>
                            </div>
                            
                            <div style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: booking.status === 'confirmed' ? '#d1fae520' :
                                             booking.status === 'pending' ? '#fef3c720' :
                                             '#fee2e220',
                              color: booking.status === 'confirmed' ? '#10b981' :
                                     booking.status === 'pending' ? '#eab308' :
                                     '#ef4444'
                            }}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </div>
                          </div>
                          
                          {/* Action Buttons for Pending Bookings */}
                          {booking.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleConfirmBooking(ride._id, booking._id)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  color: 'white',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)'
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              >
                                <span>✅</span> Confirm
                              </button>
                              <button
                                onClick={() => handleDeclineBooking(ride._id, booking._id)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                  color: 'white',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)'
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              >
                                <span>❌</span> Decline
                              </button>
                            </div>
                          )}
                          
                          {/* Mark as Complete Button for Confirmed Bookings */}
                          {booking.status === 'confirmed' && ride.status !== 'completed' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                              <button
                                onClick={() => handleMarkComplete(ride._id, booking._id)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: booking.completedByProvider 
                                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                  color: 'white',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)'
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              >
                                <span>{booking.completedByProvider ? '✅' : '🏁'}</span>
                                {booking.completedByProvider ? 'Completed by You' : 'Mark as Complete'}
                              </button>
                              {booking.completedByProvider && !booking.completedByUser && (
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  Waiting for passenger confirmation
                                </span>
                              )}
                              {booking.completedByUser && !booking.completedByProvider && (
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  ⏳ Passenger has confirmed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
