import React, { useState } from 'react'
import axios from 'axios'
import MapComponent from '../components/MapComponent'
import LiveTrackerControl from '../components/LiveTrackerControl'

export default function ProvideRide(){
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  const [routeObj,setRouteObj]=useState(null)
  const [date,setDate]=useState('')
  const [seats,setSeats]=useState(1)
  const [price,setPrice]=useState(0)
  const [msg,setMsg]=useState(null)
  const [createdRideId, setCreatedRideId] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!from || !to) {
      setMsg('❌ Please enter both From and To locations')
      return
    }
    if (!date) {
      setMsg('❌ Please select date and time')
      return
    }
    if (seats < 1 || seats > 8) {
      setMsg('❌ Please enter valid number of seats (1-8)')
      return
    }
    if (price < 0) {
      setMsg('❌ Please enter a valid price')
      return
    }
    
    try{
      const token = localStorage.getItem('token')
      const body = { from, to, date, seatsAvailable:seats, price }
      if (routeObj) body.route = routeObj.route || routeObj
      
      setMsg('⏳ Creating ride...')
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides`, body, { headers: { Authorization: `Bearer ${token}` } })
      setMsg('✅ Ride created successfully!')
      
      // if backend returned created ride id/object, keep it so provider can start live-tracking
      const created = res.data && (res.data.ride || res.data)
      if (created && (created._id || created.id)) setCreatedRideId(created._id || created.id)
      
      // Reset form
      setTimeout(() => {
        setFrom('')
        setTo('')
        setDate('')
        setSeats(1)
        setPrice(0)
        setRouteObj(null)
      }, 2000)
      
    }catch(err){
      setMsg('❌ ' + (err.response?.data?.message || 'Error creating ride'))
    }
  }

  const onRouteSelected = ({ from: f, to: t, route }) => {
    setFrom(f)
    setTo(t)
    setRouteObj({ route })
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    transition: 'all 0.2s'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold',
            fontFamily: 'var(--font-family-heading)',
            color: 'var(--text-primary)',
            margin: '0 0 8px'
          }}>
            🚗 Offer a Ride
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Share your journey and help others reach their destination
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: 'var(--shadow-luxury)',
          border: '1px solid var(--border-color)'
        }}>
          {msg && (
            <div style={{
              backgroundColor: msg.includes('✅') ? '#d4edda' : msg.includes('❌') ? '#f8d7da' : '#d1ecf1',
              color: msg.includes('✅') ? '#155724' : msg.includes('❌') ? '#721c24' : '#0c5460',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontWeight: '500',
              border: `1px solid ${msg.includes('✅') ? '#c3e6cb' : msg.includes('❌') ? '#f5c6cb' : '#bee5eb'}`
            }}>
              {msg}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Map Component */}
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <MapComponent 
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
                onRouteSelected={onRouteSelected} 
              />
            </div>
            
            {/* Manual input fields when maps not configured */}
            {(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <p style={{ 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#856404',
                  marginBottom: '12px'
                }}>
                  📍 Manual Route Entry
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>From Location</label>
                    <input 
                      value={from} 
                      onChange={e=>setFrom(e.target.value)} 
                      placeholder="e.g., Chitkara University" 
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>To Location</label>
                    <input 
                      value={to} 
                      onChange={e=>setTo(e.target.value)} 
                      placeholder="e.g., Chandigarh Railway Station" 
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Date and Time */}
            <div>
              <label style={labelStyle}>📅 Date & Time</label>
              <input 
                value={date} 
                onChange={e=>setDate(e.target.value)} 
                type="datetime-local" 
                style={inputStyle}
                required 
              />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                When are you planning to start your journey?
              </p>
            </div>
            
            {/* Seats and Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>💺 Available Seats</label>
                <input 
                  value={seats} 
                  onChange={e=>setSeats(e.target.value)} 
                  type="number" 
                  min={1} 
                  max={8} 
                  placeholder="1-8" 
                  style={inputStyle}
                  required 
                />
              </div>
              <div>
                <label style={labelStyle}>💰 Price per Seat</label>
                <input 
                  value={price} 
                  onChange={e=>setPrice(e.target.value)} 
                  type="number" 
                  min={0} 
                  placeholder="₹ Amount" 
                  style={inputStyle}
                  required 
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                marginTop: '8px'
              }}
            >
              Create Ride 🚀
            </button>
          </form>

          {/* Live Tracking Section */}
          {createdRideId && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              border: '2px solid var(--gold-accent)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}>
                📍 Live Tracking Available
              </h3>
              <p style={{ 
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '16px'
              }}>
                Start streaming your location when you're ready to begin the journey.
              </p>
              <LiveTrackerControl rideId={createdRideId} />
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div style={{
          marginTop: '24px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '16px'
          }}>
            💡 Tips for Offering Rides
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <span>✓</span>
              <span>Set a fair price that covers your fuel and toll costs</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <span>✓</span>
              <span>Be punctual and communicate any delays promptly</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <span>✓</span>
              <span>Keep your vehicle clean and well-maintained</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <span>✓</span>
              <span>Verify passenger details before confirming bookings</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
