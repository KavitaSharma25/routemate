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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg transition-all hover:opacity-80"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
      >
        ← Back
      </button>

      {/* Profile Header Card */}
      <div className="rounded-xl shadow-lg p-8 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile.profilePhoto ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.profilePhoto}`}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover"
                style={{ border: '4px solid var(--accent-gold)' }}
              />
            ) : (
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold"
                style={{ 
                  backgroundColor: 'var(--accent-gold)', 
                  color: 'white',
                  border: '4px solid var(--border-color)'
                }}
              >
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-3">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                style={{ backgroundColor: 'var(--accent-gold)', color: 'white' }}
              >
                {profile.role}
              </span>
              
              {profile.isDriver && (
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: profile.driverVerified ? '#28a745' : '#ffc107',
                    color: 'white'
                  }}
                >
                  {profile.driverVerified ? '✅ Verified Driver' : '⏳ Driver'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <StarRating rating={profile.averageRating} size="lg" />
              <span className="text-xl font-bold" style={{ color: 'var(--accent-gold)' }}>
                {profile.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ({profile.totalRatings || 0} reviews)
              </span>
            </div>

            {profile.bio && (
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>📞</span> Contact Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
              <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                {profile.email || 'Not provided'}
              </div>
            </div>
            
            {profile.phone && (
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Phone</div>
                <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                  {profile.phone}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Driver Info */}
        {profile.isDriver && (
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span>🚗</span> Driver Information
            </h3>
            
            <div className="space-y-3">
              {profile.vehicleInfo && (
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Vehicle</div>
                  <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                    {profile.vehicleInfo}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Verification Status</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  profile.driverVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.driverVerified ? '✅ Verified' : '⏳ Pending Verification'}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Member Since</div>
                <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Driver License/ID */}
        {profile.isDriver && profile.driverIdImage && (
          <div className="rounded-xl shadow-lg p-6 md:col-span-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span>🪪</span> Driver License/ID
            </h3>
            
            <div className="flex justify-center">
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.driverIdImage}`}
                alt="Driver License"
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ 
                  maxHeight: '400px',
                  border: '2px solid var(--border-color)' 
                }}
              />
            </div>
            
            {profile.driverVerified && (
              <div className="mt-4 p-3 rounded-lg text-center" style={{ backgroundColor: '#d4edda' }}>
                <span className="text-green-800 font-medium">
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
