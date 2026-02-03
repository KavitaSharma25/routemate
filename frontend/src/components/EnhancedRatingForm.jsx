import React, { useState } from 'react'
import axios from 'axios'
import './EnhancedRatingForm.css'

const EnhancedRatingForm = ({ rideId, ratedUserId, userName, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1) // 1: Overall rating, 2: Category ratings, 3: Comment & photos
  const [rating, setRating] = useState(0)
  const [categories, setCategories] = useState({
    safety: 0,
    cleanliness: 0,
    driving: 0,
    communication: 0,
    value: 0
  })
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categoryLabels = {
    safety: '🛡️ Safety',
    cleanliness: '✨ Cleanliness',
    driving: '🚗 Driving',
    communication: '💬 Communication',
    value: '💰 Value for Money'
  }

  const handleCategoryRating = (category, value) => {
    setCategories(prev => ({ ...prev, [category]: value }))
  }

  const handlePhotoUpload = async (e) => {
    const files = e.target.files
    if (!files) return

    // For now, store file names. In production, upload to cloud storage
    const newPhotos = Array.from(files).map((file, idx) => ({
      url: URL.createObjectURL(file),
      caption: '',
      file
    }))
    setPhotos([...photos, ...newPhotos])
  }

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx))
  }

  const getOverallRating = () => {
    const values = Object.values(categories).filter(v => v > 0)
    if (values.length === 0) return rating
    return Math.round((rating + values.reduce((a, b) => a + b) / values.length) / 2)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const finalRating = getOverallRating()
      if (finalRating === 0) {
        setError('Please provide a rating')
        return
      }

      const token = localStorage.getItem('token')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings/rides/${rideId}`,
        {
          ratedUserId,
          rating: finalRating,
          categories,
          comment,
          photos: photos.map(p => ({ url: p.url, caption: p.caption }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      onSuccess && onSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="enhanced-rating-form">
      <div className="form-header">
        <h3>Rate {userName}</h3>
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
      </div>

      {/* Step 1: Overall Rating */}
      {step === 1 && (
        <div className="form-step">
          <div className="step-title">How would you rate your experience?</div>
          
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`star-button ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="rating-feedback">
              {rating === 5 && '🎉 Excellent!'}
              {rating === 4 && '😊 Great!'}
              {rating === 3 && '👍 Good'}
              {rating === 2 && '😐 Fair'}
              {rating === 1 && '😞 Poor'}
            </div>
          )}

          <div className="quick-labels">
            <span className={`label ${rating >= 4 ? 'active' : ''}`}>Excellent</span>
            <span className={`label ${rating >= 3 && rating < 4 ? 'active' : ''}`}>Good</span>
            <span className={`label ${rating >= 2 && rating < 3 ? 'active' : ''}`}>Fair</span>
            <span className={`label ${rating >= 1 && rating < 2 ? 'active' : ''}`}>Poor</span>
          </div>
        </div>
      )}

      {/* Step 2: Category Ratings */}
      {step === 2 && (
        <div className="form-step">
          <div className="step-title">Rate specific aspects</div>
          
          <div className="categories-grid">
            {Object.entries(categories).map(([key, value]) => (
              <div key={key} className="category-rating-item">
                <div className="category-label">{categoryLabels[key]}</div>
                <div className="category-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={`${key}-${star}`}
                      className={`star ${star <= value ? 'filled' : ''}`}
                      onClick={() => handleCategoryRating(key, value === star ? 0 : star)}
                    >
                      {star <= value ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Comment & Photos */}
      {step === 3 && (
        <div className="form-step">
          <div className="step-title">Share your experience</div>

          <div className="form-group">
            <label>Your Review (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this driver/passenger..."
              maxLength={1000}
              className="comment-textarea"
            />
            <div className="char-count">{comment.length}/1000</div>
          </div>

          <div className="form-group">
            <label>Add Photos (Optional)</label>
            <div className="photo-upload">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="photo-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="upload-label">
                📸 Add Photos
              </label>
              <p className="upload-hint">Max 3 photos, up to 5MB each</p>
            </div>

            {photos.length > 0 && (
              <div className="photos-preview">
                {photos.map((photo, idx) => (
                  <div key={idx} className="photo-preview-item">
                    <img src={photo.url} alt="preview" />
                    <input
                      type="text"
                      placeholder="Caption (optional)"
                      value={photo.caption}
                      onChange={(e) => {
                        const newPhotos = [...photos]
                        newPhotos[idx].caption = e.target.value
                        setPhotos(newPhotos)
                      }}
                      className="photo-caption"
                    />
                    <button 
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="remove-photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form Actions */}
      <div className="form-actions">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="btn btn-secondary"
            disabled={loading}
          >
            ← Back
          </button>
        )}
        
        {step < 3 ? (
          <button 
            onClick={() => setStep(step + 1)}
            className="btn btn-primary"
            disabled={step === 1 && rating === 0 || loading}
          >
            Next →
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '✓ Submit Rating'}
          </button>
        )}

        <button 
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default EnhancedRatingForm
