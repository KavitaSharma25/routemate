import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useNotification } from '../components/NotificationToast'
import { useConfirmDialog } from '../components/ConfirmDialog'

export default function MyBookings() {
  const { token, user } = useAuth() || {}
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const nav = useNavigate()
  const { showNotification } = useNotification()
  const { showDialog } = useConfirmDialog()

  useEffect(() => {
    if (!token) {
      showNotification('You must be logged in to view this page', 'error')
      nav('/login')
      return
    }
    fetchMyBookings()
  }, [token])

  const fetchMyBookings = async () => {
    if (!token) {
      console.error('No token available')
      return
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data)
    } catch (err) {
      console.error('Fetch bookings error:', err)
      setMsg('Failed to load your bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#28a745'
      case 'pending': return '#ffc107'
      case 'declined': return '#dc3545'
      case 'cancelled': return '#6c757d'
      default: return '#6c757d'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return '✅'
      case 'pending': return '⏳'
      case 'declined': return '❌'
      case 'cancelled': return '🚫'
      default: return '•'
    }
  }

  const openRatingModal = (booking) => {
    console.log('Opening rating modal for booking:', booking)
    console.log('Provider ID:', booking.providerId || booking.provider?._id)
    setSelectedBooking(booking)
    setShowRatingModal(true)
    setRating(0)
    setRatingComment('')
  }

  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      showNotification('Please select a rating between 1 and 5 stars', 'warning')
      return
    }

    const providerId = selectedBooking.providerId || selectedBooking.provider?._id
    console.log('Selected booking:', selectedBooking)
    console.log('Submitting rating:', { providerId, rating, comment: ratingComment })

    if (!providerId) {
      console.error('Provider ID not found in booking:', selectedBooking)
      showNotification('Unable to identify provider. Please try again.', 'error')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/rate-user`,
        {
          userId: providerId,
          score: rating,
          comment: ratingComment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log('Rating response:', response.data)
      showNotification('Rating submitted successfully!', 'success')
      setMsg('✅ Rating submitted successfully!')
      setShowRatingModal(false)
      setSelectedBooking(null)
      setRating(0)
      setRatingComment('')
      // Refresh bookings to show updated rating
      fetchMyBookings()
    } catch (err) {
      console.error('Rating error:', err)
      console.error('Error response:', err.response?.data)
      showNotification(err.response?.data?.message || 'Failed to submit rating', 'error')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-6 px-4">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="mb-6 p-6 rounded-xl border" 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          🎫 My Bookings
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
          Rides you've booked as a passenger
        </p>
      </div>

      {msg && (
        <div 
          className="mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: msg.includes('✅') ? '#d4edda' : '#f8d7da',
            color: msg.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${msg.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {msg}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="text-6xl md:text-7xl mb-6">🎫</div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            No bookings yet
          </h2>
          <p className="mb-8 text-sm md:text-base max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Search for available rides and book your first trip!
          </p>
          <button
            onClick={() => nav('/search')}
            className="px-6 py-3 rounded-lg transition-all hover:transform hover:scale-105"
            style={{
              backgroundColor: 'var(--navy-deep)',
              color: 'white',
              fontWeight: '600'
            }}
          >
            Find Rides
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div 
              key={booking._id} 
              className="rounded-xl shadow-lg p-6 transition-all hover:shadow-xl" 
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-color)' 
              }}
            >
              <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {booking.from} → {booking.to}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>📅 {new Date(booking.date).toLocaleString()}</span>
                    <span>💰 ₹{booking.price}</span>
                    <span>� {booking.booking?.seats || 1} seat(s)</span>
                    <span>�👤 Provider: {booking.provider?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                <div 
                  className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                  style={{ 
                    backgroundColor: `${getStatusColor(booking.booking?.status)}20`,
                    color: getStatusColor(booking.booking?.status),
                    border: `2px solid ${getStatusColor(booking.booking?.status)}`
                  }}
                >
                  <span>{getStatusIcon(booking.booking?.status)}</span>
                  <span>{(booking.booking?.status || 'unknown').toUpperCase()}</span>
                </div>
              </div>

              {booking.booking?.status === 'confirmed' && (
                <div 
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <span className="font-bold text-lg" style={{ color: '#155724' }}>
                      Booking Confirmed!
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#155724' }}>
                    Your ride has been confirmed by the provider. Contact them for more details.
                  </p>
                  {booking.provider?.email && (
                    <p className="text-sm mt-2" style={{ color: '#155724' }}>
                      📧 {booking.provider.email}
                    </p>
                  )}
                </div>
              )}

              {booking.booking?.status === 'pending' && (
                <div 
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏳</span>
                    <span className="font-medium" style={{ color: '#856404' }}>
                      Waiting for provider confirmation...
                    </span>
                  </div>
                </div>
              )}

              {booking.booking?.status === 'declined' && (
                <div 
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    <span className="font-medium" style={{ color: '#721c24' }}>
                      Booking was declined by provider
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => nav(`/chat/${booking._id}`)}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--accent-gold)',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => nav(`/profile/${booking.providerId || booking.provider?._id}`)}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  👤 View Provider Profile
                </button>
                {booking.booking?.status === 'confirmed' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (selectedBooking?._id === booking._id && showRatingModal) {
                          setShowRatingModal(false)
                          setSelectedBooking(null)
                        } else {
                          openRatingModal(booking)
                        }
                      }}
                      className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                      style={{
                        backgroundColor: selectedBooking?._id === booking._id && showRatingModal ? '#28a745' : '#ffc107',
                        color: selectedBooking?._id === booking._id && showRatingModal ? 'white' : '#000',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedBooking?._id === booking._id && showRatingModal ? '✓ Close Rating' : '⭐ Rate Provider'}
                    </button>
                    
                    <button
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        
                        const confirmed = await showDialog({
                          title: 'Mark Ride as Complete',
                          message: 'Are you sure you want to mark this ride as complete? This requires confirmation from both the provider and passenger.',
                          confirmText: 'OK',
                          cancelText: 'Cancel',
                          type: 'info'
                        })
                        
                        if (!confirmed) return
                        
                        try {
                          const res = await axios.post(
                            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${booking._id}/bookings/${booking.booking._id}/complete`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          )
                          showNotification(res.data.message || 'Ride marked as complete', 'success')
                          setMsg('✅ ' + (res.data.message || 'Ride marked as complete'))
                          fetchMyBookings()
                        } catch (err) {
                          console.error('Mark complete error:', err)
                          showNotification(err.response?.data?.message || 'Failed to mark ride as complete', 'error')
                        }
                      }}
                      className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                      style={{
                        backgroundColor: booking.booking?.completedByUser 
                          ? '#3b82f6'
                          : '#8b5cf6',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{booking.booking?.completedByUser ? '✅' : '🏁'}</span>
                      {booking.booking?.completedByUser ? 'Completed by You' : 'Mark as Complete'}
                    </button>
                  </>
                )}
              </div>
              
              {/* Inline Rating Section */}
              {selectedBooking?._id === booking._id && showRatingModal && (
                <div className="mt-6 p-6 rounded-xl animate-slideDown" style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--accent-gold)'
                }}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span>⭐</span> Rate {booking.provider?.name}
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>How was your ride?</p>
                    <div className="flex gap-2 justify-start">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-125"
                          style={{
                            fontSize: '36px',
                            color: star <= rating ? '#ffc107' : '#ddd',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            filter: star <= rating ? 'drop-shadow(0 2px 4px rgba(255,193,7,0.4))' : 'none'
                          }}
                        >
                          {star <= rating ? '⭐' : '☆'}
                        </button>
                      ))}
                      {rating > 0 && (
                        <span className="ml-2 font-semibold self-center" style={{ color: 'var(--accent-gold)' }}>
                          {rating === 5 ? '🎉 Excellent!' : rating === 4 ? '😊 Great!' : rating === 3 ? '👍 Good' : rating === 2 ? '😐 Fair' : '😞 Poor'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience (optional)..."
                      className="w-full p-3 rounded-lg border resize-none"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '14px'
                      }}
                      rows="2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={submitRating}
                      disabled={rating === 0}
                      className="px-5 py-2 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                      style={{
                        backgroundColor: rating > 0 ? 'var(--accent-gold)' : '#ccc',
                        color: 'white',
                        cursor: rating > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Submit Rating
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRatingModal(false)
                        setSelectedBooking(null)
                        setRating(0)
                        setRatingComment('')
                      }}
                      className="px-5 py-2 rounded-lg font-semibold transition-all hover:opacity-80"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Completion Status */}
              {booking.booking?.status === 'confirmed' && (booking.booking?.completedByUser || booking.booking?.completedByProvider) && (
                <div className="mt-4 p-3 rounded-lg" style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {booking.booking?.completedByUser && booking.booking?.completedByProvider ? (
                      <span style={{ color: '#10b981', fontWeight: '600' }}>✅ Ride completed by both parties!</span>
                    ) : booking.booking?.completedByUser ? (
                      <span>⏳ You marked as complete. Waiting for provider confirmation.</span>
                    ) : (
                      <span>⏳ Provider marked as complete. Please confirm when ride is done.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Old Modal - Removed */}
    </div>
  )
}
