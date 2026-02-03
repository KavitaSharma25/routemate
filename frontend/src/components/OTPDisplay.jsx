import React, { useState, useEffect } from 'react'
import './OTPDisplay.css'

const OTPDisplay = ({ otp, expiryTime, bookingId }) => {
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!expiryTime) return

    const timer = setInterval(() => {
      const now = new Date()
      const expiry = new Date(expiryTime)
      const diff = Math.floor((expiry - now) / 1000)
      setTimeLeft(Math.max(0, diff))

      if (diff <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiryTime])

  const handleCopyOTP = () => {
    navigator.clipboard.writeText(otp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isExpiring = timeLeft < 300 // Less than 5 minutes
  const isExpired = timeLeft <= 0

  return (
    <div className="otp-display-container">
      <div className="otp-card">
        <div className="otp-header">
          <h3>Your Ride OTP</h3>
          <p className="otp-subtitle">Share this with your driver</p>
        </div>

        <div className={`otp-code-section ${isExpiring ? 'expiring' : ''} ${isExpired ? 'expired' : ''}`}>
          <div className="otp-code" onClick={handleCopyOTP}>
            <span className="otp-digits">{otp}</span>
            <button className="copy-btn" title="Copy OTP">
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
        </div>

        <div className="otp-timer">
          <div className="timer-label">
            {isExpired ? (
              <span className="expired-text">⚠️ OTP Expired</span>
            ) : isExpiring ? (
              <span className="expiring-text">⏱️ Expiring Soon</span>
            ) : (
              <span className="valid-text">✓ Valid</span>
            )}
          </div>
          <div className={`timer-value ${isExpired ? 'expired' : isExpiring ? 'expiring' : 'valid'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="timer-sublabel">Time remaining</div>
        </div>

        <div className="otp-info">
          <p>
            <strong>Why OTP?</strong> The driver will ask for this OTP to confirm you're the 
            actual passenger. This ensures ride security and prevents unauthorized bookings.
          </p>
        </div>

        <div className="otp-features">
          <div className="feature">
            <span className="feature-icon">🔐</span>
            <span className="feature-text">Secure verification</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⏰</span>
            <span className="feature-text">15 minute validity</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span className="feature-text">One-time use</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OTPDisplay
