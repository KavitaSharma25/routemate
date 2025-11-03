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
    try{
      const token = auth?.token || localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/search`,{ headers: { Authorization: `Bearer ${token}` } })
      setRides(res.data)
      setFilteredRides(res.data)
    }catch(err){
      console.error(err)
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
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold',
            fontFamily: 'var(--font-family-heading)',
            color: 'var(--text-primary)',
            margin: '0 0 8px'
          }}>
            🔍 Find Your Ride
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Discover available rides and book your seat instantly
          </p>
        </div>

        {/* Filters Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '20px'
          }}>
            🎯 Filter Rides
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={labelStyle}>From</label>
              <input
                type="text"
                placeholder="Starting location"
                value={filters.from}
                onChange={(e) => updateFilter('from', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>To</label>
              <input
                type="text"
                placeholder="Destination"
                value={filters.to}
                onChange={(e) => updateFilter('to', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => updateFilter('date', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Max Price (₹)</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Min Seats</label>
              <input
                type="number"
                placeholder="Min seats"
                value={filters.minSeats}
                onChange={(e) => updateFilter('minSeats', e.target.value)}
                style={inputStyle}
                min="1"
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Showing {filteredRides.length} of {rides.length} rides
            </div>
            {(filters.from || filters.to || filters.date || filters.maxPrice || filters.minSeats) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ 
                width: '48px',
                height: '48px',
                border: '4px solid var(--border-color)',
                borderTopColor: 'var(--navy-600)',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p>Loading rides...</p>
            </div>
          ) : filteredRides.length > 0 ? (
            <div style={{ 
              display: 'grid',
              gap: '20px'
            }}>
              {filteredRides.map(ride => (
                <RideCard key={ride._id} ride={ride} onBook={onBook} showBookingButton={true} />
              ))}
            </div>
          ) : rides.length > 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              border: '2px dashed var(--border-color)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ 
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                No rides match your filters
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Try adjusting your search criteria
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
                style={{ padding: '12px 28px', borderRadius: '10px' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              border: '2px dashed var(--border-color)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚗</div>
              <h3 style={{ 
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                No rides available yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Be the first to create a ride!
              </p>
              <button
                onClick={() => nav('/provide')}
                className="btn-primary"
                style={{ padding: '12px 28px', borderRadius: '10px' }}
              >
                Create a Ride
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
      `}</style>
    </div>
  )
}
