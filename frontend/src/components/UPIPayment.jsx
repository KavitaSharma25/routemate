import React, { useState } from 'react'
import './UPIPayment.css'

function UPIPayment({ amount, providerUPI, onSuccess, onCancel, rideDetails }) {
  const [paymentProof, setPaymentProof] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  // Generate UPI payment string
  const generateUPIString = () => {
    const upiId = providerUPI || 'routemate@upi'
    const name = 'RouteMate'
    const note = `Ride to ${rideDetails?.to || 'destination'}`
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB')
        return
      }
      setPaymentProof(file)
    }
  }

  const handleSubmit = async () => {
    if (!transactionId) {
      alert('Please enter transaction ID')
      return
    }
    if (!paymentProof) {
      alert('Please upload payment screenshot')
      return
    }

    setUploading(true)
    try {
      // Create FormData with proof
      const formData = new FormData()
      formData.append('screenshot', paymentProof)
      formData.append('transactionId', transactionId)
      formData.append('amount', amount)

      // Call parent success handler with transaction details
      onSuccess({
        method: 'upi',
        transactionId,
        screenshot: paymentProof,
        amount
      })
    } catch (error) {
      console.error('Error submitting UPI payment:', error)
      alert('Failed to submit payment proof')
    } finally {
      setUploading(false)
    }
  }

  const openUPIApp = () => {
    const upiString = generateUPIString()
    window.location.href = upiString
  }

  return (
    <div className="upi-payment-overlay">
      <div className="upi-payment-modal">
        <div className="upi-header">
          <h2>💳 UPI Payment</h2>
          <button onClick={onCancel} className="close-btn" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="upi-content">
          <div className="payment-amount">
            <div className="amount-label">Amount to Pay</div>
            <div className="amount-value">₹{amount}</div>
          </div>

          {providerUPI && (
            <div className="upi-id-section">
              <div className="section-title">📱 Provider UPI ID</div>
              <div className="upi-id-box">
                <code>{providerUPI}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(providerUPI)
                    alert('UPI ID copied!')
                  }}
                  className="copy-btn"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}

          <div className="qr-section">
            <div className="section-title">🔲 Scan QR Code</div>
            <div className="qr-code-container">
              <div className="qr-code-placeholder">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <rect width="200" height="200" fill="#f5f5f5" stroke="#333" strokeWidth="2"/>
                  <text x="100" y="100" textAnchor="middle" fontSize="14" fill="#666">
                    QR Code
                  </text>
                  <text x="100" y="120" textAnchor="middle" fontSize="12" fill="#999">
                    Scan with any UPI app
                  </text>
                </svg>
              </div>
              <button onClick={openUPIApp} className="btn btn-primary mt-3">
                Open UPI App
              </button>
            </div>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="proof-section">
            <div className="section-title">📸 Upload Payment Proof</div>
            <p className="section-desc">After completing payment, upload screenshot and transaction ID</p>

            <div className="form-group">
              <label>Transaction ID / UTR Number *</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter 12-digit transaction ID"
                className="form-input"
                maxLength="20"
              />
            </div>

            <div className="form-group">
              <label>Payment Screenshot *</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="payment-proof"
                />
                <label htmlFor="payment-proof" className="file-input-label">
                  📷 {paymentProof ? paymentProof.name : 'Choose Screenshot'}
                </label>
              </div>
              {paymentProof && (
                <div className="file-preview">
                  <img 
                    src={URL.createObjectURL(paymentProof)} 
                    alt="Payment proof" 
                    style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="upi-footer">
          <button onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={!transactionId || !paymentProof || uploading}
          >
            {uploading ? 'Submitting...' : 'Submit Payment Proof'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UPIPayment
