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
        headers: { Authorization: `Bearer ${token}` }
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
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
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
          Authorization: `Bearer ${token}`,
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
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/upload-id', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          👤 My Profile
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account and preferences</p>
      </div>

      {/* Message Alert */}
      {msg && (
        <div 
          className="mb-6 p-4 rounded-lg animate-slideDown"
          style={{
            backgroundColor: msg.includes('✅') ? '#d4edda' : '#f8d7da',
            color: msg.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${msg.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="text-3xl mb-2">🚗</div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-gold)' }}>{stats.totalRides}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Rides Offered</div>
        </div>
        
        <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="text-3xl mb-2">🎫</div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-gold)' }}>{stats.totalBookings}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Rides Booked</div>
        </div>
        
        <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="text-3xl mb-2">⭐</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>
              {userInfo.averageRating?.toFixed(1) || '0.0'}
            </span>
            <StarRating rating={userInfo.averageRating} size="sm" />
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ({userInfo.totalRatings || 0} reviews)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Photo Card */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              📸 Profile Photo
            </h3>
            
            <div className="flex flex-col items-center gap-4">
              {/* Photo Display */}
              {userInfo.profilePhoto ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${userInfo.profilePhoto}`}
                  alt="Profile"
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
                  {userInfo.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Upload Button */}
              <label 
                className="px-4 py-2 rounded-lg cursor-pointer transition-all hover:opacity-80 text-center"
                style={{ backgroundColor: 'var(--accent-gold)', color: 'white', fontWeight: '600' }}
              >
                {uploading ? 'Uploading...' : userInfo.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                JPG, PNG or GIF (max 5MB)
              </p>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
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
        <div className="space-y-6">
          {/* Driver Verification */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
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
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
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