import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function RideHistory(){
  const { user, token } = useAuth() || {}
  const [history, setHistory] = useState({ asProvider: [], asPassenger: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('passenger')
  const [ratingModal, setRatingModal] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(()=>{
    fetchRideHistory()
  },[])

  const fetchRideHistory = async () => {
    try{
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(res.data)
    }catch(err){
      console.error('Failed to fetch ride history', err)
    }finally{
      setLoading(false)
    }
  }

  const submitRating = async () => {
    if (!ratingModal) return
    
    try{
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings/rides/${ratingModal.rideId}`, {
        ratedUserId: ratingModal.userId,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      alert('Rating submitted successfully!')
      setRatingModal(null)
      setRating(5)
      setComment('')
    }catch(err){
      alert(err.response?.data?.message || 'Failed to submit rating')
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading ride history...</div>

  const currentRides = activeTab === 'passenger' ? history.asPassenger : history.asProvider

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Ride History</h2>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('passenger')}
          className={`px-4 py-2 font-medium ${activeTab === 'passenger' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          As Passenger ({history.asPassenger.length})
        </button>
        <button
          onClick={() => setActiveTab('provider')}
          className={`px-4 py-2 font-medium ${activeTab === 'provider' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          As Provider ({history.asProvider.length})
        </button>
      </div>

      {/* Ride List */}
      {currentRides.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No ride history found for this category.
        </div>
      ) : (
        <div className="space-y-4">
          {currentRides.map(ride => (
            <div key={ride._id} className="rounded shadow p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{ride.from} → {ride.to}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                      ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ride.status}
                    </span>
                  </div>
                  
                  <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    <div>Date: {new Date(ride.date).toLocaleDateString()}</div>
                    <div>Price: ₹{ride.price}</div>
                    {activeTab === 'passenger' && ride.provider && (
                      <div>Driver: {ride.provider.name}</div>
                    )}
                    {activeTab === 'provider' && (
                      <div>Passengers: {ride.passengers.length}/{ride.seatsAvailable + ride.passengers.length}</div>
                    )}
                  </div>
                </div>

                {/* Rating Actions */}
                {ride.status === 'completed' && (
                  <div className="ml-4">
                    {activeTab === 'passenger' && ride.provider && (
                      <button
                        onClick={() => setRatingModal({ 
                          rideId: ride._id, 
                          userId: ride.provider._id, 
                          userName: ride.provider.name 
                        })}
                        className="px-3 py-1 rounded text-sm btn-secondary"
                      >
                        Rate Driver
                      </button>
                    )}
                    {activeTab === 'provider' && ride.passengers.length > 0 && (
                      <div className="space-y-1">
                        {ride.passengers.map(passenger => (
                          <button
                            key={passenger._id}
                            onClick={() => setRatingModal({ 
                              rideId: ride._id, 
                              userId: passenger._id, 
                              userName: passenger.name 
                            })}
                            className="block px-3 py-1 rounded text-sm btn-secondary w-full"
                          >
                            Rate {passenger.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded shadow-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Rate {ratingModal.userName}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Rating (1-5 stars)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 rounded"
                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                rows="3"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={submitRating}
                className="flex-1 py-2 rounded btn-primary"
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setRatingModal(null)
                  setRating(5)
                  setComment('')
                }}
                className="flex-1 py-2 rounded border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}