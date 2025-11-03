import React from 'react'

/**
 * LoadingSkeleton Component - Placeholder for loading content
 * Usage: Show while data is being fetched
 */
export default function LoadingSkeleton({ 
  variant = 'text', 
  count = 1,
  className = '' 
}) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded w-3/4',
    card: 'h-48 rounded-xl',
    circle: 'h-12 w-12 rounded-full',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24 rounded-lg'
  }

  const skeletons = Array.from({ length: count }, (_, i) => i)

  return (
    <>
      {skeletons.map(i => (
        <div
          key={i}
          className={`animate-shimmer ${variants[variant]} ${className}`}
          style={{ backgroundColor: 'var(--bg-secondary)' }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

export function CardSkeleton({ count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i)
  
  return (
    <>
      {skeletons.map(i => (
        <div 
          key={i} 
          className="p-6 rounded-xl border animate-shimmer"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <LoadingSkeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="title" />
              <LoadingSkeleton variant="text" className="w-1/2" />
            </div>
          </div>
          <LoadingSkeleton variant="text" count={3} className="mb-2" />
          <div className="flex gap-2 mt-4">
            <LoadingSkeleton variant="button" />
            <LoadingSkeleton variant="button" />
          </div>
        </div>
      ))}
    </>
  )
}
