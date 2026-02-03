import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './RatingDisplay.css'

const RatingDisplay = ({ userId, showBreakdown = false }) => {
  const [ratings, setRatings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('recent')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRatings()
  }, [userId, page, sortBy])

  const fetchRatings = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings/users/${userId}`,
        { params: { page, limit: 5, sortBy } }
      )
      setRatings(res.data.ratings)
      setStats({
        averageRating: res.data.averageRating,
        categoryAverages: res.data.categoryAverages,
        ratingBreakdown: res.data.ratingBreakdown,
        totalRatings: res.data.totalRatings,
        totalPages: res.data.totalPages
      })
    } catch (err) {
      setError('Failed to load ratings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkHelpful = async (ratingId, currentlyHelpful) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings/${ratingId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchRatings()
    } catch (err) {
      console.error('Error marking helpful:', err)
    }
  }

  if (loading && !stats) {
    return <div className="rating-display loading">Loading ratings...</div>
  }

  if (error) {
    return <div className="rating-display error">{error}</div>
  }

  return (
    <div className="rating-display">
      {/* Summary Section */}
      {stats && (
        <div className="rating-summary">
          <div className="overall-rating">
            <div className="big-rating">{stats.averageRating.toFixed(1)}</div>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(stats.averageRating) ? 'star filled' : 'star'}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="rating-count">{stats.totalRatings} ratings</div>
          </div>

          {/* Category Breakdown */}
          {stats.categoryAverages && showBreakdown && (
            <div className="category-breakdown">
              {Object.entries(stats.categoryAverages).map(([category, avg]) => (
                avg > 0 && (
                  <div key={category} className="category-item">
                    <span className="category-name">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                    <div className="category-bar">
                      <div 
                        className="category-fill"
                        style={{ width: `${(avg / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="category-value">{avg.toFixed(1)}</span>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Rating Distribution */}
          {stats.ratingBreakdown && (
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="distribution-row">
                  <span className="stars-label">{stars}⭐</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill"
                      style={{ 
                        width: `${stats.totalRatings > 0 ? (stats.ratingBreakdown[stars] / stats.totalRatings) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="distribution-count">{stats.ratingBreakdown[stars]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        <div className="reviews-header">
          <h3>Reviews</h3>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {ratings.length === 0 ? (
          <div className="no-reviews">No reviews yet</div>
        ) : (
          <>
            {ratings.map(rating => (
              <div key={rating._id} className="review-card">
                {/* Reviewer Info */}
                <div className="review-header">
                  <div className="reviewer-info">
                    {rating.ratedBy?.profilePhoto && (
                      <img 
                        src={rating.ratedBy.profilePhoto} 
                        alt={rating.ratedBy.name}
                        className="reviewer-avatar"
                      />
                    )}
                    <div>
                      <div className="reviewer-name">{rating.ratedBy?.name || 'Anonymous'}</div>
                      <div className="review-date">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rating.rating ? 'star filled' : 'star'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Content */}
                {rating.comment && (
                  <div className="review-comment">{rating.comment}</div>
                )}

                {/* Category Ratings */}
                {rating.categories && Object.keys(rating.categories).some(k => rating.categories[k]) && (
                  <div className="review-categories">
                    {Object.entries(rating.categories).map(([key, value]) => (
                      value && (
                        <span key={key} className="category-tag">
                          {key}: {value}⭐
                        </span>
                      )
                    ))}
                  </div>
                )}

                {/* Review Photos */}
                {rating.photos && rating.photos.length > 0 && (
                  <div className="review-photos">
                    {rating.photos.map((photo, idx) => (
                      <div key={idx} className="photo-container">
                        <img src={photo.url} alt="Review" />
                        {photo.caption && <p>{photo.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Provider Response */}
                {rating.response && rating.response.text && (
                  <div className="provider-response">
                    <div className="response-header">
                      <strong>Provider Response</strong>
                      <span className="response-date">
                        {new Date(rating.response.respondedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{rating.response.text}</p>
                  </div>
                )}

                {/* Review Actions */}
                <div className="review-actions">
                  <button 
                    className={`helpful-btn ${rating.helpfulBy?.includes(localStorage.getItem('userId')) ? 'active' : ''}`}
                    onClick={() => handleMarkHelpful(rating._id)}
                  >
                    👍 Helpful ({rating.helpfulCount || 0})
                  </button>
                  <button className="report-btn">
                    🚩 Report
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {stats && stats.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </button>
                <span>{page} of {stats.totalPages}</span>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === stats.totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RatingDisplay
