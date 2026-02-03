import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './LiveTracking.css'

const LiveTracking = ({ rideId, ride, onClose }) => {
  const [driverLocation, setDriverLocation] = useState(null)
  const [rideInfo, setRideInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eta, setEta] = useState(null)
  const [distance, setDistance] = useState(null)
  const { auth } = useAuth()
  const mapRef = useRef(null)
  const socketRef = useRef(null)

  // Haversine formula to calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get initial ride location
  useEffect(() => {
    const fetchRideLocation = async () => {
      try {
        const token = auth?.token || localStorage.getItem('token')
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/location`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        setRideInfo(res.data)
        setDriverLocation(res.data.currentLocation)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching ride location:', err)
        setError('Unable to load driver location')
        setLoading(false)
      }
    }

    fetchRideLocation()
  }, [rideId, auth])

  // Setup real-time location updates via Socket.IO
  useEffect(() => {
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client')
        const socket = io(
          import.meta.env.VITE_API_URL || 'http://localhost:5000',
          {
            auth: {
              token: auth?.token || localStorage.getItem('token')
            }
          }
        )

        socket.on('location-update', (data) => {
          if (data.rideId === rideId) {
            setDriverLocation(data.currentLocation)
            
            // Calculate distance and ETA if we have passenger location
            if (ride?.to && data.currentLocation.latitude && data.currentLocation.longitude) {
              // Note: This is approximate. In production, use Google Maps Distance Matrix API
              const approxDist = calculateDistance(
                data.currentLocation.latitude,
                data.currentLocation.longitude,
                ride.pickupLat || 0,
                ride.pickupLon || 0
              )
              setDistance(approxDist)
              
              // Estimate ETA: assuming average speed of 40 km/h in city
              const estimatedMinutes = Math.ceil((approxDist / 40) * 60)
              setEta(estimatedMinutes)
            }
          }
        })

        socket.on('tracking-stopped', (data) => {
          if (data.rideId === rideId) {
            setError('Driver stopped sharing location')
          }
        })

        socketRef.current = socket

        return () => {
          socket.disconnect()
        }
      } catch (err) {
        console.error('Socket connection error:', err)
      }
    }

    initSocket()
  }, [rideId, auth, ride])

  if (loading) {
    return (
      <div className="live-tracking-container">
        <div className="tracking-header">
          <h3>Live Ride Tracking</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="tracking-content">
          <div className="loading">Loading driver location...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="live-tracking-container">
        <div className="tracking-header">
          <h3>Live Ride Tracking</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="tracking-content">
          <div className="error">⚠️ {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="live-tracking-container">
      {/* Header */}
      <div className="tracking-header">
        <h3>🗺️ Live Ride Tracking</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {/* Map Container */}
      <div className="tracking-map" ref={mapRef}>
        {driverLocation ? (
          <div className="map-placeholder">
            <div className="location-info">
              <div className="location-marker">📍</div>
              <div className="location-details">
                <p>Latitude: {driverLocation.latitude?.toFixed(6)}</p>
                <p>Longitude: {driverLocation.longitude?.toFixed(6)}</p>
                {driverLocation.accuracy && (
                  <p>Accuracy: {Math.round(driverLocation.accuracy)}m</p>
                )}
                {driverLocation.timestamp && (
                  <p>Last Update: {new Date(driverLocation.timestamp).toLocaleTimeString()}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="map-placeholder">
            <p>Waiting for driver location...</p>
          </div>
        )}
      </div>

      {/* Driver Info Card */}
      {rideInfo && (
        <div className="driver-info-card">
          <div className="driver-header">
            <div className="driver-avatar">👤</div>
            <div className="driver-details">
              <h4>{rideInfo.provider.name}</h4>
              <div className="rating">
                ⭐ {rideInfo.provider.rating || 'New'} • 📱 {rideInfo.provider.phone}
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="route-info">
            <div className="route-item">
              <span className="icon">📍</span>
              <div className="route-text">
                <p className="label">Pickup</p>
                <p className="location">{rideInfo.route.from}</p>
              </div>
            </div>
            <div className="route-divider"></div>
            <div className="route-item">
              <span className="icon">🎯</span>
              <div className="route-text">
                <p className="label">Destination</p>
                <p className="location">{rideInfo.route.to}</p>
              </div>
            </div>
          </div>

          {/* ETA and Distance */}
          {eta !== null && (
            <div className="eta-distance">
              <div className="eta-box">
                <p className="eta-value">{eta}</p>
                <p className="eta-label">Minutes Away</p>
              </div>
              {distance && (
                <div className="distance-box">
                  <p className="distance-value">{distance.toFixed(1)} km</p>
                  <p className="distance-label">Distance</p>
                </div>
              )}
            </div>
          )}

          {/* Tracking Status */}
          <div className="tracking-status">
            {rideInfo.trackingEnabled ? (
              <>
                <div className="status-indicator active"></div>
                <span>🟢 Driver is sharing location</span>
              </>
            ) : (
              <>
                <div className="status-indicator inactive"></div>
                <span>⚪ Location sharing inactive</span>
              </>
            )}
          </div>

          {/* Safety Tips */}
          <div className="safety-tips">
            <p className="tip-title">🔒 Safety Tips:</p>
            <ul>
              <li>Verify driver details before boarding</li>
              <li>Share your trip with trusted contacts</li>
              <li>Keep your phone charged</li>
              <li>Trust your instincts</li>
            </ul>
          </div>
        </div>
      )}

      {/* Close Button */}
      <button className="close-full-btn" onClick={onClose}>
        Close Tracking
      </button>
    </div>
  )
}

export default LiveTracking
