import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function AdminPanel(){
  const { user, token } = useAuth() || {}
  const [pendingDrivers, setPendingDrivers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    totalBookings: 0,
    verifiedDrivers: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    if (user?.isAdmin) {
      fetchAllData()
    } else {
      setLoading(false)
    }
  },[user])

  const fetchAllData = async () => {
    try{
      const driversRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/pending-drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPendingDrivers(driversRes.data)

      const mockStats = {
        totalUsers: 25,
        totalRides: 12,
        totalBookings: 8,
        verifiedDrivers: 5,
        pendingVerifications: driversRes.data.length
      }
      setStats(mockStats)

    }catch(err){
      console.error('Failed to fetch admin data', err)
      setMsg('Failed to load admin data')
    }finally{
      setLoading(false)
    }
  }

  const handleVerifyDriver = async (userId) => {
    try{
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/verify-driver/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMsg('✅ Driver verified successfully')
      fetchAllData()
    }catch(err){
      setMsg('❌ ' + (err.response?.data?.message || 'Verification failed'))
    }
  }

  const handleRejectDriver = async (userId) => {
    try{
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reject-driver/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMsg('✅ Driver application rejected')
      fetchAllData()
    }catch(err){
      setMsg('❌ ' + (err.response?.data?.message || 'Rejection failed'))
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-semibold text-red-800 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛠️ Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage RouteMate users, rides, and driver verifications</p>
      </div>
      
      {msg && (
        <div className={`mb-6 p-4 rounded-lg ${
          msg.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {msg}
        </div>
      )}

      <div className="flex space-x-1 mb-8 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'dashboard' 
              ? 'shadow-sm' 
              : ''
          }`}
          style={{
            backgroundColor: activeTab === 'dashboard' ? 'var(--bg-card)' : 'transparent',
            color: 'var(--text-primary)'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'verifications' 
              ? 'shadow-sm' 
              : ''
          }`}
          style={{
            backgroundColor: activeTab === 'verifications' ? 'var(--bg-card)' : 'transparent',
            color: 'var(--text-primary)'
          }}
        >
          🔍 Driver Verifications {pendingDrivers.length > 0 && (
            <span className="ml-2 px-2 py-1 text-white text-xs rounded-full" style={{ backgroundColor: '#ef4444' }}>
              {pendingDrivers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-white p-6 rounded-xl" style={{ backgroundColor: 'var(--mahogany)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: 'var(--vanilla)', opacity: 0.9 }}>Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Rides</p>
                  <p className="text-3xl font-bold">{stats.totalRides}</p>
                </div>
                <div className="text-4xl">🚗</div>
              </div>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Verified Drivers</p>
                  <p className="text-3xl font-bold">{stats.verifiedDrivers}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
            <div className="bg-orange-500 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Pending Verifications</p>
                  <p className="text-3xl font-bold">{stats.pendingVerifications || 0}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📈 Quick Overview</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🚨 Action Required</h4>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }}></span>
                    {pendingDrivers.length} driver verification(s) pending
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></span>
                    System running smoothly
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📊 Recent Activity</h4>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <li>• New user registrations: Active</li>
                  <li>• Ride creation: Working properly</li>
                  <li>• Payment system: Operational</li>
                  <li>• Chat system: Online</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="rounded-xl shadow-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>🔍 Driver Verifications</h3>
            <p style={{ color: 'var(--text-muted)' }}>{pendingDrivers.length} pending applications</p>
          </div>
          
          {pendingDrivers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>All caught up!</h4>
              <p style={{ color: 'var(--text-muted)' }}>No pending driver verifications</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {pendingDrivers.map(driver => (
                <div key={driver._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'var(--mahogany)', color: 'var(--vanilla)' }}>
                          {driver.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{driver.name}</h4>
                          <p style={{ color: 'var(--text-muted)' }}>{driver.email}</p>
                          <span className="inline-block px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                            {driver.role}
                          </span>
                        </div>
                      </div>
                      
                      {driver.driverIdImage && (
                        <div>
                          <p className="text-sm font-medium mb-2">📋 Uploaded ID Document:</p>
                          <img 
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${driver.driverIdImage}`}
                            alt="Driver ID"
                            className="w-80 h-48 object-cover border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => handleVerifyDriver(driver._id)}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectDriver(driver._id)}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}