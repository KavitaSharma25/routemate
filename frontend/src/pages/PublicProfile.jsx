import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import StarRating from '../components/StarRating'

export default function PublicProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPublicProfile()
  }, [userId])

  const fetchPublicProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/public-profile/${userId}`)
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch profile', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Profile Not Found
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            {error || 'This profile does not exist'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--accent-gold)', color: 'white' }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-5 py-2.5 rounded-lg transition-all hover:opacity-80 flex items-center gap-2 font-medium"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)', 
            color: 'var(--text-primary)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <span className="text-lg">←</span> Back
        </button>

        {/* Profile Header Card - Centered Layout */}
        <div className="rounded-2xl shadow-xl p-8 md:p-10 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-color)',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)'
        }}>
          <div className="flex flex-col items-center text-center">
            {/* Profile Photo */}
            <div className="mb-3">
              {profile.profilePhoto ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.profilePhoto}`}
                  alt={profile.name}
                  className="rounded-full object-cover shadow"
                  style={{ 
                    width: '80px',
                    height: '80px',
                    maxWidth: '80px',
                    maxHeight: '80px',
                    minWidth: '80px',
                    minHeight: '80px',
                    border: '2px solid var(--accent-gold)' 
                  }}
                />
              ) : (
                <div 
                  className="rounded-full flex items-center justify-center font-bold shadow"
                  style={{ 
                    width: '80px',
                    height: '80px',
                    fontSize: '32px',
                    backgroundColor: 'var(--accent-gold)', 
                    color: 'white',
                    border: '2px solid var(--border-color)'
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Badges */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-3 mb-5">
              <span 
                className="px-4 py-1.5 rounded-full text-sm font-semibold capitalize shadow-md"
                style={{ backgroundColor: 'var(--accent-gold)', color: 'white' }}
              >
                {profile.role}
              </span>
              
              {profile.isDriver && (
                <span 
                  className="px-4 py-1.5 rounded-full text-sm font-semibold shadow-md"
                  style={{ 
                    backgroundColor: profile.driverVerified ? '#28a745' : '#ffc107',
                    color: 'white'
                  }}
                >
                  {profile.driverVerified ? '✅ Verified Driver' : '⏳ Driver'}
                </span>
              )}
            </div>

            {/* Rating Section - Fixed duplicate issue */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <div className="flex items-center gap-2">
                <StarRating rating={profile.averageRating || 0} size="lg" />
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>
                  {profile.averageRating ? profile.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                ({profile.totalRatings || 0} {profile.totalRatings === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="max-w-2xl">
                <p className="text-base italic leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
                  "{profile.bio}"
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Contact Information */}
        <div className="rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow" style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-color)' 
        }}>
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2 pb-3" style={{ 
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--accent-gold)'
          }}>
            <span className="text-2xl">📞</span> Contact Information
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Email Address
              </div>
              <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                {profile.email || 'Not provided'}
              </div>
            </div>
            
            {profile.phone && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Phone Number
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {profile.phone}
                </div>
              </div>
            )}

            {profile.upiId && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  UPI ID
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {profile.upiId}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Driver Info or Member Info */}
        {profile.isDriver ? (
          <div className="rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow" style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)' 
          }}>
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2 pb-3" style={{ 
              color: 'var(--text-primary)',
              borderBottom: '2px solid var(--accent-gold)'
            }}>
              <span className="text-2xl">🚗</span> Driver Information
            </h3>
            
            <div className="space-y-4">
              {profile.vehicleInfo && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Vehicle Details
                  </div>
                  <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                    {profile.vehicleInfo}
                  </div>
                </div>
              )}
              
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Verification Status
                </div>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${
                    profile.driverVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.driverVerified ? '✅ Verified' : '⏳ Pending Verification'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Member Since
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow" style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)' 
          }}>
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2 pb-3" style={{ 
              color: 'var(--text-primary)',
              borderBottom: '2px solid var(--accent-gold)'
            }}>
              <span className="text-2xl">👤</span> Member Information
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Member Since
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Total Rides
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {profile.totalRatings || 0} completed
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Driver License/ID - Full Width */}
        {profile.isDriver && profile.driverIdImage && (
          <div className="rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow" style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)' 
          }}>
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2 pb-3" style={{ 
              color: 'var(--text-primary)',
              borderBottom: '2px solid var(--accent-gold)'
            }}>
              <span className="text-2xl">🪪</span> Driver License/ID Document
            </h3>
            
            <div className="flex justify-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.driverIdImage}`}
                alt="Driver License"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ 
                  maxHeight: '450px',
                  border: '3px solid var(--border-color)' 
                }}
              />
            </div>
            
            {profile.driverVerified && (
              <div className="mt-5 p-4 rounded-lg text-center" style={{ 
                backgroundColor: '#d4edda',
                border: '2px solid #28a745'
              }}>
                <span className="text-green-800 font-semibold text-base">
                  ✅ This driver's license has been verified by administrators
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
