import React from 'react'

export default function StarRating({ rating, size = 'sm', showValue = true }){
  const stars = []
  const fullStars = Math.floor(rating || 0)
  const hasHalfStar = (rating || 0) % 1 >= 0.5

  const starSize = size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-sm'

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={`full-${i}`} className={`text-yellow-400 ${starSize}`}>⭐</span>
    )
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <span key="half" className={`text-yellow-400 ${starSize}`}>⭐</span>
    )
  }

  // Add empty stars
  const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className={`text-gray-300 ${starSize}`}>⭐</span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {stars}
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  )
}