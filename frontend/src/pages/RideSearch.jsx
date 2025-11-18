import React, { useEffect, useState } from 'react'
import axios from 'axios'
import RideCard from '../components/RideCard'
import { useAuth } from '../context/AuthContext'
import RazorpayCheckout from '../components/RazorpayCheckout'
import { useNavigate } from 'react-router-dom'

export default function RideSearch(){
  const [rides,setRides]=useState([])
  const [filteredRides, setFilteredRides] = useState([])
  const [loading,setLoading]=useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: '',
    maxPrice: '',
    minSeats: ''
  })
  const auth = useAuth()

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try{
      const token = auth?.token || localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/search`,{ headers: { Authorization: `Bearer ${token}` } })
      const ridesData = res.data || []
      setRides(ridesData)
      setFilteredRides(ridesData)
    }catch(err){
      console.error(err)
      setError(err.response?.data?.message || 'Failed to load rides. Please try again.')
    }finally{setLoading(false)}
  }

  // Filter rides based on search criteria
  useEffect(() => {
    let filtered = rides.filter(ride => {
      const matchesFrom = !filters.from || ride.from.toLowerCase().includes(filters.from.toLowerCase())
      const matchesTo = !filters.to || ride.to.toLowerCase().includes(filters.to.toLowerCase())
      const matchesDate = !filters.date || new Date(ride.date).toDateString() === new Date(filters.date).toDateString()
      const matchesPrice = !filters.maxPrice || ride.price <= parseInt(filters.maxPrice)
      const matchesSeats = !filters.minSeats || ride.seatsAvailable >= parseInt(filters.minSeats)
      
      return matchesFrom && matchesTo && matchesDate && matchesPrice && matchesSeats
    })
    setFilteredRides(filtered)
  }, [rides, filters])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      from: '',
      to: '',
      date: '',
      maxPrice: '',
      minSeats: ''
    })
  }

  const nav = useNavigate()
  useEffect(()=>{fetch()},[])

  // state for in-page payment when backend returns order
  const [pendingPayment, setPendingPayment] = useState(null)

  const onBook = async (ride) => {
    const token = auth?.token || localStorage.getItem('token')
    if (!token) return nav('/login')
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${ride._id}/book`,{}, { headers: { Authorization: `Bearer ${token}` } })
      // if backend responds with order and keyId, open checkout
      if (res.data.order && res.data.keyId) {
        setPendingPayment({ order: res.data.order, keyId: res.data.keyId, ride, bookingId: res.data.bookingId })
        return
      }
      alert(res.data.message || 'Booking created')
    }catch(err){
      alert(err.response?.data?.message || 'Booking failed')
    }
  }

  const onPaymentSuccess = async (razorResp) => {
    try{
      const token = auth?.token || localStorage.getItem('token')
      // send to backend for verification
      const body = { ...razorResp }
      if (pendingPayment && pendingPayment.ride) body.rideId = pendingPayment.ride._id
      if (pendingPayment && pendingPayment.bookingId) body.bookingId = pendingPayment.bookingId
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/verify`, body, { headers: { Authorization: `Bearer ${token}` } })
      alert(res.data.message || 'Payment verified and booking confirmed')
      setPendingPayment(null)
      fetch()
    }catch(err){
      console.error(err)
      alert(err.response?.data?.message || 'Payment verification failed')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    transition: 'border 0.2s'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
          borderRadius: '20px',
          padding: '40px 32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(201, 169, 97, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold',
            fontFamily: 'var(--font-family-heading)',
            color: 'white',
            margin: '0 0 8px',
            position: 'relative',
            zIndex: 1
          }}>
            🔍 Find Your Perfect Ride
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.95)', margin: 0, position: 'relative', zIndex: 1 }}>
            Discover available rides and book your seat instantly
          </p>
        </div>

        {/* Filters Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-luxury)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
              fontFamily: 'var(--font-family-heading)'
            }}>
              🎯 Filter Rides
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={fetch}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(201, 169, 97, 0.3)',
                  background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.05))',
                  color: 'var(--accent-gold)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, rgba(201, 169, 97, 0.2), rgba(201, 169, 97, 0.1))'
                    e.target.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.05))'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                <span>🔄</span> {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              {(filters.from || filters.to || filters.date || filters.maxPrice || filters.minSeats) && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05))',
                    color: '#dc3545',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.2), rgba(220, 53, 69, 0.1))'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05))'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  <span>✖</span> Clear Filters
                </button>
              )}
            </div>
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontSize: '16px', marginRight: '6px' }}>📍</span>
                From Location
              </label>
              <input
                type="text"
                placeholder="e.g., Delhi, Mumbai..."
                value={filters.from}
                onChange={(e) => updateFilter('from', e.target.value)}
                style={{
                  ...inputStyle,
                  boxShadow: filters.from ? '0 0 0 2px rgba(201, 169, 97, 0.2)' : 'none'
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <span style={{ fontSize: '16px', marginRight: '6px' }}>🎯</span>
                To Destination
              </label>
              <input
                type="text"
                placeholder="e.g., Chandigarh..."
                value={filters.to}
                onChange={(e) => updateFilter('to', e.target.value)}
                style={{
                  ...inputStyle,
                  boxShadow: filters.to ? '0 0 0 2px rgba(201, 169, 97, 0.2)' : 'none'
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <span style={{ fontSize: '16px', marginRight: '6px' }}>📅</span>
                Travel Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => updateFilter('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  ...inputStyle,
                  boxShadow: filters.date ? '0 0 0 2px rgba(201, 169, 97, 0.2)' : 'none'
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <span style={{ fontSize: '16px', marginRight: '6px' }}>💰</span>
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="Enter max budget"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                style={{
                  ...inputStyle,
                  boxShadow: filters.maxPrice ? '0 0 0 2px rgba(201, 169, 97, 0.2)' : 'none'
                }}
                min="0"
              />
            </div>
            <div>
              <label style={labelStyle}>
                <span style={{ fontSize: '16px', marginRight: '6px' }}>💺</span>
                Min Seats Required
              </label>
              <input
                type="number"
                placeholder="Number of seats"
                value={filters.minSeats}
                onChange={(e) => updateFilter('minSeats', e.target.value)}
                style={{
                  ...inputStyle,
                  boxShadow: filters.minSeats ? '0 0 0 2px rgba(201, 169, 97, 0.2)' : 'none'
                }}
                min="1"
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ 
              color: 'var(--text-primary)', 
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                {filteredRides.length}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                of {rides.length} rides available
              </span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                  Error Loading Rides
                </div>
                <div style={{ color: '#991b1b', fontSize: '14px' }}>
                  {error}
                </div>
              </div>
              <button
                onClick={fetch}
                style={{
                  marginLeft: 'auto',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #991b1b',
                  backgroundColor: 'white',
                  color: '#991b1b',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}
          
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                border: '4px solid var(--border-color)',
                borderTopColor: 'var(--accent-gold)',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Finding the best rides for you...
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Please wait while we search
              </p>
            </div>
          ) : filteredRides.length > 0 ? (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)',
                  margin: 0
                }}>
                  Available Rides
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Sort by:</span>
                  <select
                    onChange={(e) => {
                      const sorted = [...filteredRides]
                      if (e.target.value === 'price-low') {
                        sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
                      } else if (e.target.value === 'price-high') {
                        sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
                      } else if (e.target.value === 'date') {
                        sorted.sort((a, b) => new Date(a.date) - new Date(b.date))
                      } else if (e.target.value === 'seats') {
                        sorted.sort((a, b) => b.seatsAvailable - a.seatsAvailable)
                      }
                      setFilteredRides(sorted)
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="date">Date: Earliest First</option>
                    <option value="seats">Most Seats Available</option>
                  </select>
                </div>
              </div>
              <div style={{ 
                display: 'grid',
                gap: '24px'
              }}>
                {filteredRides.map(ride => (
                  <RideCard key={ride._id} ride={ride} onBook={onBook} showBookingButton={true} />
                ))}
              </div>
            </>
          ) : rides.length > 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              padding: '80px 20px',
              textAlign: 'center',
              border: '2px dashed var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ 
                fontSize: '80px', 
                marginBottom: '20px',
                animation: 'pulse 2s ease-in-out infinite'
              }}>🔍</div>
              <h3 style={{ 
                fontSize: '28px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                fontFamily: 'var(--font-family-heading)'
              }}>
                No Rides Match Your Search
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '28px',
                fontSize: '16px',
                maxWidth: '500px',
                margin: '0 auto 28px'
              }}>
                We couldn't find any rides matching your criteria. Try adjusting your filters or check back later.
              </p>
              <button
                onClick={clearFilters}
                style={{
                  padding: '14px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(201, 169, 97, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(201, 169, 97, 0.3)'
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              padding: '80px 20px',
              textAlign: 'center',
              border: '2px dashed var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ 
                fontSize: '80px', 
                marginBottom: '20px',
                animation: 'bounce 2s ease-in-out infinite'
              }}>🚗</div>
              <h3 style={{ 
                fontSize: '28px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                fontFamily: 'var(--font-family-heading)'
              }}>
                No Rides Available Yet
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '28px',
                fontSize: '16px',
                maxWidth: '500px',
                margin: '0 auto 28px'
              }}>
                Be the pioneer! Create the first ride and start your journey with RouteMate.
              </p>
              <button
                onClick={() => nav('/provide')}
                style={{
                  padding: '14px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(201, 169, 97, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(201, 169, 97, 0.3)'
                }}
              >
                🚗 Create Your First Ride
              </button>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {pendingPayment && (
          <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: 'var(--shadow-luxury)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ 
                fontSize: '24px',
                fontWeight: 'bold',
                fontFamily: 'var(--font-family-heading)',
                color: 'var(--text-primary)',
                marginBottom: '20px'
              }}>
                💳 Complete Payment
              </h3>
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid var(--border-color)'
              }}>
                <p style={{ 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  Ride Details:
                </p>
                <p style={{ 
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px'
                }}>
                  {pendingPayment.ride.from} → {pendingPayment.ride.to}
                </p>
                <p style={{ 
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'var(--navy-600)',
                  fontFamily: 'var(--font-family-heading)'
                }}>
                  ₹{pendingPayment.ride.price}
                </p>
              </div>
              <RazorpayCheckout 
                order={pendingPayment.order} 
                keyId={pendingPayment.keyId} 
                prefill={{name: pendingPayment.ride.providerName}} 
                onSuccess={onPaymentSuccess} 
                onError={(e)=>{alert('Checkout failed'); console.error(e)}} 
              />
              <button 
                onClick={()=>setPendingPayment(null)}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel Payment
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
