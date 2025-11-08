import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function MyBookings() {
  const { token, user } = useAuth() || {}
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    if (!token) {
      alert('You must be logged in to view this page')
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
                    <span>👤 Provider: {booking.provider?.name || 'Unknown'}</span>
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

              <div className="mt-4 flex gap-2">
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
                  onClick={() => nav(`/profile/${booking.providerId}`)}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  👤 View Provider Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
