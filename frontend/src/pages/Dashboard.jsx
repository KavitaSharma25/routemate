import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import RideCard from '../components/RideCard'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Dashboard = () => {
  const [upcomingRides, setUpcomingRides] = useState([])
  const [myRides, setMyRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRides: 0,
    totalSaved: 0,
    co2Reduced: 0
  })
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch available rides
      const ridesRes = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/search`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setUpcomingRides(ridesRes.data.slice(0, 4))
      
      // Calculate mock stats (replace with real API calls)
      setStats({
        totalRides: Math.floor(Math.random() * 50) + 10,
        totalSaved: Math.floor(Math.random() * 5000) + 1000,
        co2Reduced: Math.floor(Math.random() * 100) + 20
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold',
              fontFamily: 'var(--font-family-heading)',
              color: 'var(--text-primary)',
              margin: '0 0 8px'
            }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Welcome back, {user?.name || 'User'}! Here's your carpool overview.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/search" className="btn-primary" style={{ padding: '12px 24px', borderRadius: '10px' }}>
              🔍 Find Rides
            </Link>
            <Link to="/provide" className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '10px' }}>
              🚗 Offer Ride
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Total Rides Card */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid var(--navy-600)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-luxury)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--navy-600), var(--navy-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🚗
              </div>
              <div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)'
                }}>
                  {stats.totalRides}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Rides</div>
              </div>
            </div>
          </div>

          {/* Money Saved Card */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid var(--gold-accent)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-luxury)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--gold-accent), #b8935f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                💰
              </div>
              <div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)'
                }}>
                  ₹{stats.totalSaved.toLocaleString()}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Money Saved</div>
              </div>
            </div>
          </div>

          {/* CO2 Reduced Card */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid #10b981',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-luxury)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🌱
              </div>
              <div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)'
                }}>
                  {stats.co2Reduced} kg
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>CO₂ Reduced</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '16px'
          }}>
            Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <button 
              onClick={() => navigate('/search')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🔍</span>
              Search Rides
            </button>
            <button 
              onClick={() => navigate('/my-rides')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>📋</span>
              My Rides
            </button>
            <button 
              onClick={() => navigate('/profile')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>👤</span>
              Profile
            </button>
            <button 
              onClick={() => navigate('/chat')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>💬</span>
              Messages
            </button>
          </div>
        </div>

        {/* Upcoming Rides Section */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              fontFamily: 'var(--font-family-heading)',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Available Rides
            </h2>
            <Link 
              to="/search" 
              style={{ 
                color: 'var(--navy-600)', 
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
              Loading rides...
            </div>
          ) : upcomingRides.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {upcomingRides.map(ride => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              border: '2px dashed var(--border-color)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
              <h3 style={{ 
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                No rides available yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Be the first to offer a ride or check back later!
              </p>
              <Link to="/provide" className="btn-primary" style={{ padding: '12px 28px', borderRadius: '10px' }}>
                Offer a Ride
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
