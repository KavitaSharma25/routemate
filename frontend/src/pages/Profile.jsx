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

  useEffect(()=>{
    fetchProfile()
  },[])

  const fetchProfile = async () => {
    try{
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data)
    }catch(err){
      console.error('Failed to fetch profile', err)
      setProfile(user) // fallback to auth context user
    }finally{
      setLoading(false)
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setMsg(res.data.message || 'Driver ID uploaded successfully')
      fetchProfile() // refresh profile data
      e.target.reset()
    }catch(err){
      setMsg(err.response?.data?.message || 'Upload failed')
    }finally{
      setUploading(false)
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto p-6">Loading profile...</div>

  const userInfo = profile || user || {}

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>My Profile</h2>
      
      {/* Basic Info */}
      <div className="rounded shadow p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
            <div className="p-2 rounded" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{userInfo.name || 'Not set'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <div className="p-2 rounded" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{userInfo.email || 'Not set'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
            <div className="p-2 rounded capitalize" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{userInfo.role || 'Not set'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Driver Status</label>
            <div className="p-2 rounded" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {userInfo.isDriver ? 'Registered as Driver' : 'Not a Driver'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Rating</label>
            <div className="p-2 rounded flex items-center gap-2" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <StarRating rating={userInfo.averageRating} size="md" />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ({userInfo.totalRatings || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Verification */}
      <div className="rounded shadow p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Driver Verification</h3>
        
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
            <div className="mt-3">
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Uploaded Driver ID:</p>
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${userInfo.driverIdImage}`} 
                alt="Driver ID" 
                className="w-48 h-32 object-cover rounded"
                style={{ border: '1px solid var(--border-color)' }}
              />
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

        {msg && (
          <div className={`mt-3 p-3 rounded text-sm ${
            msg.includes('success') || msg.includes('uploaded') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {msg}
          </div>
        )}
      </div>

      {/* Additional Profile Options */}
      <div className="rounded shadow p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account Settings</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 rounded transition-colors" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>
            Update Profile Information
          </button>
          <button className="w-full text-left p-3 rounded transition-colors" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>
            Change Password
          </button>
          <button className="w-full text-left p-3 rounded transition-colors" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>
            Notification Preferences
          </button>
        </div>
      </div>
    </div>
  )
}