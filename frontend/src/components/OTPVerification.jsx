import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useNotification } from './NotificationToast'
import './OTPVerification.css'

const OTPVerification = ({ ride, booking, onClose, onVerified }) => {
  const [otp, setOTP] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { auth } = useAuth()
  const { showNotification } = useNotification()

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const token = auth?.token || localStorage.getItem('token')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rides/${ride._id}/bookings/${booking._id}/verify-otp`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      showNotification('OTP verified successfully! Passenger confirmed.', 'success')
      if (onVerified) onVerified(res.data.booking)
      onClose()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'OTP verification failed'
      setError(errorMsg)
      showNotification(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOTP(value)
    if (error) setError('')
  }

  return (
    <div className="otp-verification-overlay" role="dialog" aria-labelledby="otp-title" aria-modal="true">
      <div className="otp-verification-modal">
        {/* Header */}
        <div className="otp-verification-header">
          <h2 id="otp-title">Verify Passenger OTP</h2>
          <button
            onClick={onClose}
            className="close-btn"
            aria-label="Close"
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Passenger Info */}
        <div className="passenger-info">
          <div className="info-row">
            <span className="label">Passenger:</span>
            <span className="value">{booking.user?.name || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Seats:</span>
            <span className="value">{booking.seats}</span>
          </div>
          <div className="info-row">
            <span className="label">Route:</span>
            <span className="value">{ride.from} → {ride.to}</span>
          </div>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerifyOTP} className="otp-form">
          <div className="form-group">
            <label htmlFor="otp-input" className="form-label">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              id="otp-input"
              className={`otp-input ${error ? 'error' : ''} ${otp.length === 6 ? 'complete' : ''}`}
              placeholder="000000"
              value={otp}
              onChange={handleInputChange}
              maxLength="6"
              disabled={loading}
              autoComplete="off"
              aria-describedby={error ? 'otp-error' : undefined}
            />
            {error && (
              <div id="otp-error" className="form-error">
                ⚠️ {error}
              </div>
            )}
            <div className="form-hint">
              Ask the passenger for their 6-digit OTP
            </div>
          </div>

          {/* Features */}
          <div className="verification-features">
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <span className="feature-text">Confirms passenger identity</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span className="feature-text">Prevents unauthorized boarding</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verify OTP
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="info-box">
          <p>
            <strong>Note:</strong> The OTP expires in 15 minutes from booking confirmation. 
            Make sure the passenger shares it with you before boarding.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
