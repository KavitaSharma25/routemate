import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import axios from 'axios'
import './Profile.css'

export default function Profile(){
  const { user, token, updateUser } = useAuth() || {}
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [msg, setMsg] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [stats, setStats] = useState({ totalRides: 0, totalBookings: 0, completedRides: 0 })

  useEffect(()=>{
    fetchProfile()
    fetchStats()
  },[])

  const fetchProfile = async () => {
    try{
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        headers: { Authorization: 'Bearer ' + token }
      })
      setProfile(res.data)
      setEditData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        vehicleInfo: res.data.vehicleInfo || ''
      })
    }catch(err){
      console.error('Failed to fetch profile', err)
      setProfile(user) // fallback to auth context user
    }finally{
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [ridesRes, bookingsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/my-rides`, {
          headers: { Authorization: 'Bearer ' + token }
        }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/my-bookings`, {
          headers: { Authorization: 'Bearer ' + token }
        })
      ])
      
      const rides = ridesRes.data || []
      const bookings = bookingsRes.data || []
      const completed = rides.filter(r => r.status === 'completed').length
      
      setStats({
        totalRides: rides.length,
        totalBookings: bookings.length,
        completedRides: completed
      })
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    setMsg('')
    
    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/upload-profile-photo`, formData, {
        headers: { 
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setMsg('✅ Profile photo uploaded successfully!')
      fetchProfile()
      setTimeout(() => setMsg(''), 3000)
    } catch(err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const handleDriverIdUpload = async (e) => {
    e.preventDefault()
    const file = e.target.driverId.files[0]
    if (!file) return setMsg('Please select a file')
    
    setUploading(true)
    setMsg('')
    
    try{
      const formData = new FormData()
      formData.append('driverId', file)
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/upload-id`, formData, {
        headers: { 
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setMsg('✅ Driver ID uploaded successfully! Admin will review it soon.')
      fetchProfile() // refresh profile data
      e.target.reset()
    }catch(err){
      setMsg('❌ ' + (err.response?.data?.message || 'Upload failed'))
    }finally{
      setUploading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        editData,
        { headers: { Authorization: 'Bearer ' + token } }
      )
      
      setProfile(res.data)
      if (updateUser) updateUser(res.data)
      setEditing(false)
      setMsg('✅ Profile updated successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Update failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMsg('❌ Passwords do not match')
    }
    
    if (passwordData.newPassword.length < 6) {
      return setMsg('❌ Password must be at least 6 characters')
    }
    
    setMsg('')
    setLoading(true)
    
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: 'Bearer ' + token } }
      )
      
      setMsg('✅ Password changed successfully!')
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed to change password'))
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const userInfo = profile || user || {}

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Profile Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy-600), var(--navy-700))',
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 3vw, 24px) clamp(60px, 10vw, 100px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(201, 169, 97, 0.2), transparent)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(20px, 4vw, 32px)', flexWrap: 'wrap' }}>
            {/* Profile Photo */}
            <div style={{ position: 'relative' }}>
              {userInfo.profilePhoto ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${userInfo.profilePhoto}`}
                  alt="Profile"
                  style={{
                    width: 'clamp(100px, 20vw, 140px)',
                    height: 'clamp(100px, 20vw, 140px)',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '5px solid white',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                />
              ) : (
                <div style={{
                  width: 'clamp(100px, 20vw, 140px)',
                  height: 'clamp(100px, 20vw, 140px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold-accent), #b8935f)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(48px, 10vw, 64px)',
                  fontWeight: 'bold',
                  color: 'white',
                  border: '5px solid white',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  {userInfo.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Camera Icon Overlay */}
              <label style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--gold-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.background = '#b8935f'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = 'var(--gold-accent)'
              }}>
                <span style={{ fontSize: '20px' }}>📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
            {/* Profile Info */}
            <div style={{ flex: 1, minWidth: '200px', paddingBottom: '8px' }}>
              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 42px)',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                fontFamily: 'var(--font-family-heading)'
              }}>
                {userInfo.name || 'User'}
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: '12px' }}>
                ✉️ {userInfo.email || 'No email'}
              </p>
              
              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>👤</span> {userInfo.role || 'User'}
                </div>
                {userInfo.driverVerified && (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.9)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>✅</span> Verified Driver
                  </div>
                )}
                {userInfo.createdAt && (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>📅</span> Member since {new Date(userInfo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(16px, 3vw, 24px)', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
      
      {/* Message Alert */}
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

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Rides Offered */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid var(--navy-600)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--navy-600), var(--navy-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>🚗</div>
              <div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)',
                  lineHeight: 1
                }}>{stats.totalRides}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Rides Offered</div>
              </div>
            </div>
          </div>
          
          {/* Rides Booked */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid #8b5cf6',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>🎫</div>
              <div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)',
                  lineHeight: 1
                }}>{stats.totalBookings}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Rides Booked</div>
              </div>
            </div>
          </div>
          
          {/* Completed */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid #10b981',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>✅</div>
              <div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)',
                  lineHeight: 1
                }}>{stats.completedRides}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Completed</div>
              </div>
            </div>
          </div>
          
          {/* Rating */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid var(--gold-accent)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--gold-accent), #b8935f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>⭐</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family-heading)',
                    lineHeight: 1
                  }}>{userInfo.averageRating?.toFixed(1) || '0.0'}</div>
                  <StarRating rating={userInfo.averageRating} size="sm" />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                  {userInfo.totalRatings || 0} reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
          gap: '24px'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Basic Info Card */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid var(--border-color)'
            }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                📋 Profile Information
              </h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: 'var(--accent-gold)', color: 'white' }}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
            
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full p-2 rounded"
                    style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full p-2 rounded"
                    style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    placeholder="+91 1234567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea
                    value={editData.bio || ''}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full p-2 rounded"
                    style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    rows="3"
                    placeholder="Tell others about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Vehicle Info (if driver)
                  </label>
                  <input
                    type="text"
                    value={editData.vehicleInfo || ''}
                    onChange={(e) => setEditData({ ...editData, vehicleInfo: e.target.value })}
                    className="w-full p-2 rounded"
                    style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    placeholder="e.g., Honda City, White, DL-1234"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: '#28a745', color: 'white' }}
                  >
                    {loading ? 'Saving...' : '✅ Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setEditData({
                        name: userInfo.name || '',
                        phone: userInfo.phone || '',
                        bio: userInfo.bio || '',
                        vehicleInfo: userInfo.vehicleInfo || ''
                      })
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: '#6c757d', color: 'white' }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Name</div>
                  <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                    {userInfo.name || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
                  <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                    {userInfo.email || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Phone</div>
                  <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                    {userInfo.phone || 'Not set'}
                  </div>
                </div>
                
                {userInfo.bio && (
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Bio</div>
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {userInfo.bio}
                    </div>
                  </div>
                )}
                
                {userInfo.vehicleInfo && (
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Vehicle</div>
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {userInfo.vehicleInfo}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Role</div>
                  <div className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                    {userInfo.role || 'user'}
                  </div>
                </div>
                </div>
            )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Driver Verification */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid var(--border-color)'
            }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🚗 Driver Verification
            </h3>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Verification Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              userInfo.driverVerified 
                ? 'bg-green-100 text-green-800' 
                : userInfo.driverIdImage 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {userInfo.driverVerified 
                ? 'Verified' 
                : userInfo.driverIdImage 
                ? 'Pending Review' 
                : 'Not Submitted'}
            </span>
          </div>
          
          {userInfo.driverIdImage && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                🪪 Driver License/ID:
              </p>
              <div className="rounded-lg overflow-hidden" style={{ border: '2px solid var(--border-color)' }}>
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${userInfo.driverIdImage}`} 
                  alt="Driver ID" 
                  className="w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '400px' }}
                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${userInfo.driverIdImage}`, '_blank')}
                />
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                Click to view full size
              </p>
              
              {userInfo.driverVerified && (
                <div className="mt-3 p-3 rounded-lg text-center" style={{ backgroundColor: '#d4edda' }}>
                  <span className="text-green-800 font-medium">
                    ✅ Verified by administrators
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!userInfo.driverVerified && (
          <form onSubmit={handleDriverIdUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Upload College ID for Driver Verification
              </label>
              <input 
                type="file" 
                name="driverId"
                accept="image/*"
                className="w-full p-2 rounded"
                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                disabled={uploading}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Upload a clear photo of your college ID card. This will be reviewed by admins.
              </p>
            </div>
            
            <button 
              type="submit" 
              disabled={uploading}
              className="px-4 py-2 rounded btn-primary disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : userInfo.driverIdImage ? 'Replace ID' : 'Upload ID'}
            </button>
          </form>
        )}

            </div>

            {/* Account Settings */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid var(--border-color)'
            }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              ⚙️ Account Settings
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left p-3 rounded-lg transition-all hover:opacity-80 flex items-center gap-3"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <span className="text-xl">🔒</span>
                <div>
                  <div className="font-medium">Change Password</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Update your account password</div>
                </div>
              </button>
              
              <div className="p-3 rounded-lg" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Member Since</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div 
            className="rounded-xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔒 Change Password
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full p-2 rounded"
                  style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full p-2 rounded"
                  style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  required
                  minLength="6"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Minimum 6 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full p-2 rounded"
                  style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: '#28a745', color: 'white' }}
                >
                  {loading ? 'Changing...' : '✅ Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: '#6c757d', color: 'white' }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}