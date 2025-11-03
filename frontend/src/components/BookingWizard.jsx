import React, { useState } from 'react'
import './BookingWizard.css'

const BookingWizard = ({ ride, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    seats: 1,
    pickupPoint: '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'online'
  })
  const [errors, setErrors] = useState({})

  const totalSteps = 4

  const steps = [
    { id: 1, title: 'Select Seats', icon: '💺' },
    { id: 2, title: 'Pickup Details', icon: '📍' },
    { id: 3, title: 'Contact Info', icon: '📱' },
    { id: 4, title: 'Payment', icon: '💳' }
  ]

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.seats || formData.seats < 1) {
          newErrors.seats = 'Please select at least 1 seat'
        }
        if (formData.seats > ride.seatsAvailable) {
          newErrors.seats = `Only ${ride.seatsAvailable} seats available`
        }
        break
      case 2:
        if (!formData.pickupPoint.trim()) {
          newErrors.pickupPoint = 'Please enter pickup location'
        }
        break
      case 3:
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required'
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          newErrors.phone = 'Please enter a valid 10-digit phone number'
        }
        break
      case 4:
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        handleComplete()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleComplete = () => {
    onComplete(formData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="booking-wizard-overlay" role="dialog" aria-labelledby="wizard-title" aria-modal="true">
      <div className="booking-wizard">
        {/* Header */}
        <div className="wizard-header">
          <h2 id="wizard-title" className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Book Your Ride
          </h2>
          <button 
            onClick={onCancel} 
            className="btn btn-ghost btn-sm"
            aria-label="Close booking wizard"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="wizard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          <div className="wizard-steps">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`wizard-step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              >
                <div className="step-icon">
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          {/* Step 1: Select Seats */}
          {currentStep === 1 && (
            <div className="wizard-step-content fade-in">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                How many seats do you need?
              </h3>
              <div className="form-group">
                <label htmlFor="seats" className="form-label">Number of Seats</label>
                <div className="seat-selector">
                  {[...Array(Math.min(ride.seatsAvailable, 4))].map((_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      className={`seat-option ${formData.seats === i + 1 ? 'selected' : ''}`}
                      onClick={() => handleInputChange('seats', i + 1)}
                    >
                      <span className="seat-icon">💺</span>
                      <span className="seat-number">{i + 1}</span>
                    </button>
                  ))}
                </div>
                {errors.seats && <div className="form-error">{errors.seats}</div>}
                <div className="form-hint">
                  Price: ₹{ride.price} × {formData.seats} = ₹{ride.price * formData.seats}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pickup Details */}
          {currentStep === 2 && (
            <div className="wizard-step-content fade-in">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Where should we pick you up?
              </h3>
              <div className="form-group">
                <label htmlFor="pickupPoint" className="form-label">Pickup Location</label>
                <input
                  type="text"
                  id="pickupPoint"
                  className={`form-input ${errors.pickupPoint ? 'error' : ''}`}
                  placeholder="Enter specific pickup point along the route"
                  value={formData.pickupPoint}
                  onChange={(e) => handleInputChange('pickupPoint', e.target.value)}
                />
                {errors.pickupPoint && <div className="form-error">{errors.pickupPoint}</div>}
                <div className="form-hint">
                  📍 Route: {ride.from} → {ride.to}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="specialRequests" className="form-label">Special Requests (Optional)</label>
                <textarea
                  id="specialRequests"
                  className="form-input"
                  rows="3"
                  placeholder="Any special requirements or notes for the driver"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 3 && (
            <div className="wizard-step-content fade-in">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                How can we reach you?
              </h3>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Enter your 10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
                <div className="form-hint">
                  📱 We'll send booking confirmation via SMS
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="wizard-step-content fade-in">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Choose payment method
              </h3>
              <div className="payment-options">
                <label className={`payment-option ${formData.paymentMethod === 'online' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  />
                  <div className="payment-content">
                    <div className="payment-icon">💳</div>
                    <div>
                      <div className="payment-title">Online Payment</div>
                      <div className="payment-desc">Pay securely via UPI, Cards, or Net Banking</div>
                    </div>
                  </div>
                </label>
                <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  />
                  <div className="payment-content">
                    <div className="payment-icon">💵</div>
                    <div>
                      <div className="payment-title">Cash Payment</div>
                      <div className="payment-desc">Pay directly to the driver</div>
                    </div>
                  </div>
                </label>
              </div>
              {errors.paymentMethod && <div className="form-error">{errors.paymentMethod}</div>}
              
              {/* Booking Summary */}
              <div className="booking-summary">
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Booking Summary</h4>
                <div className="summary-row">
                  <span>Route:</span>
                  <span className="font-medium">{ride.from} → {ride.to}</span>
                </div>
                <div className="summary-row">
                  <span>Seats:</span>
                  <span className="font-medium">{formData.seats}</span>
                </div>
                <div className="summary-row">
                  <span>Pickup:</span>
                  <span className="font-medium">{formData.pickupPoint}</span>
                </div>
                <div className="summary-row">
                  <span>Phone:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row summary-total">
                  <span>Total Amount:</span>
                  <span className="font-bold">₹{ride.price * formData.seats}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer">
          <button
            onClick={handleBack}
            className="btn btn-outline"
            disabled={currentStep === 1}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className="step-indicator">
            Step {currentStep} of {totalSteps}
          </div>
          <button
            onClick={handleNext}
            className="btn btn-primary"
          >
            {currentStep === totalSteps ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Confirm Booking
              </>
            ) : (
              <>
                Next
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingWizard
