import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function MyRides() {
  const { token, user } = useAuth() || {}
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  // Check if user is logged in
  useEffect(() => {
    if (!token) {
      alert('You must be logged in to view this page')
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
    if (!window.confirm('Are you sure you want to cancel this ride?')) return
    
    try {
      console.log('Cancelling ride:', rideId)
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMsg('✅ Ride cancelled successfully')
      alert('✅ Ride cancelled successfully')
      fetchMyRides()
    } catch (err) {
      console.error('Cancel error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to cancel ride'
      setMsg('❌ ' + errorMsg)
      alert('❌ ' + errorMsg)
    }
  }

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to delete this ride? This cannot be undone.')) return
    
    try {
      console.log('Deleting ride:', rideId)
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMsg('✅ Ride deleted successfully')
      alert('✅ Ride deleted successfully')
      fetchMyRides()
    } catch (err) {
      console.error('Delete error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to delete ride'
      setMsg('❌ ' + errorMsg)
      alert('❌ ' + errorMsg)
    }
  }

  const handleConfirmBooking = async (rideId, bookingId) => {
    if (!token) {
      alert('❌ You must be logged in to perform this action')
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
      alert('✅ ' + (res.data.message || 'Booking confirmed'))
      fetchMyRides()
    } catch (err) {
      console.error('Confirm error:', err)
      console.error('Error response:', err.response)
      let errorMsg = err.response?.data?.message || 'Failed to confirm booking'
      if (err.response?.status === 403) {
        errorMsg = 'Only the ride provider can confirm bookings. Please log in as the user who created this ride.'
      }
      setMsg('❌ ' + errorMsg)
      alert('❌ ' + errorMsg)
    }
  }

  const handleDeclineBooking = async (rideId, bookingId) => {
    if (!token) {
      alert('❌ You must be logged in to perform this action')
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
      alert('✅ Booking declined')
      fetchMyRides()
    } catch (err) {
      console.error('Decline error:', err)
      console.error('Error response:', err.response)
      let errorMsg = err.response?.data?.message || 'Failed to decline booking'
      if (err.response?.status === 403) {
        errorMsg = 'Only the ride provider can decline bookings. Please log in as the user who created this ride.'
      }
      setMsg('❌ ' + errorMsg)
      alert('❌ ' + errorMsg)
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

  return (
    <div className="container max-w-6xl py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>🚗 My Rides</h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>Manage your created rides and bookings</p>
      </div>

      {msg && (
        <div 
          className={`mb-6 p-4 rounded-lg animate-slideDown ${
            msg.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
          }`}
          role="alert"
        >
          {msg}
        </div>
      )}

      {rides.length === 0 ? (
        <div className="text-center py-16 px-4 animate-fadeIn">
          <div className="text-6xl md:text-7xl mb-6" aria-hidden="true">🚗</div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>No rides created yet</h2>
          <p className="mb-8 text-sm md:text-base max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Start by creating your first ride and help others get around campus!
          </p>
          <button
            onClick={() => nav('/provide')}
            className="px-6 py-3 rounded-lg transition-all hover:transform hover:scale-105 btn-primary touch-target"
            aria-label="Create your first ride"
          >
            Create Your First Ride
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {rides.map(ride => (
            <div key={ride._id} className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {ride.from} → {ride.to}
                  </h3>
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>📅 {new Date(ride.date).toLocaleString()}</span>
                    <span>💺 {ride.seatsAvailable} seats</span>
                    <span>💰 ₹{ride.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ride.status === 'open' ? 'bg-green-100 text-green-800' :
                      ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ride.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {ride.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleCancelRide(ride._id)}
                        className="px-4 py-2 rounded-lg transition-all font-medium hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: '#eab308', color: 'white', cursor: 'pointer' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#ca8a04'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#eab308'}
                      >
                        🔄 Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteRide(ride._id)}
                        className="px-4 py-2 rounded-lg transition-all font-medium hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: '#ef4444', color: 'white', cursor: 'pointer' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => nav(`/chat/${ride._id}`)}
                    className="px-4 py-2 rounded-lg transition-all font-medium hover:bg-[var(--mahogany)] hover:text-white active:scale-95"
                    style={{ border: '2px solid var(--mahogany)', color: 'var(--mahogany)', cursor: 'pointer' }}
                  >
                    💬 Chat
                  </button>
                </div>
              </div>

              {ride.bookings && ride.bookings.length > 0 && (
                <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📋 Bookings ({ride.bookings.length})</h4>
                  <div className="space-y-3">
                    {ride.bookings.map(booking => (
                      <div key={booking._id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'var(--mahogany)', color: 'var(--vanilla)' }}>
                            {booking.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{booking.user?.name || 'Unknown User'}</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{booking.user?.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmBooking(ride._id, booking._id)}
                              className="px-4 py-2 rounded transition-all text-sm font-medium hover:opacity-90 active:scale-95"
                              style={{ backgroundColor: '#22c55e', color: 'white', cursor: 'pointer' }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#16a34a'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#22c55e'}
                            >
                              ✅ Confirm
                            </button>
                            <button
                              onClick={() => handleDeclineBooking(ride._id, booking._id)}
                              className="px-4 py-2 rounded transition-all text-sm font-medium hover:opacity-90 active:scale-95"
                              style={{ backgroundColor: '#ef4444', color: 'white', cursor: 'pointer' }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                            >
                              ❌ Decline
                            </button>
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
  )
}
