import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating'

export default function RideCard({ride, onBook, showBookingButton = true}){
  const nav = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="card card-hover card-elevated animate-fadeIn" 
      style={{ 
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Ride from ${ride.from} to ${ride.to}`}
    >
      <div className="card-header">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Route with animated arrow */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg" role="img" aria-label="From">📍</span>
                <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                  {ride.from}
                </h3>
              </div>
              <svg 
                className="text-2xl" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                style={{ 
                  color: 'var(--brown-500)',
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path 
                  d="M5 12h14m-6-6l6 6-6 6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex items-center gap-2">
                <span className="text-lg" role="img" aria-label="To">🎯</span>
                <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                  {ride.to}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Status badge */}
          {ride.status && (
            <span className={`badge ${ride.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
              {ride.status === 'open' ? '🟢 Available' : '🟡 ' + ride.status}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Date & Time */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2 flex-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--brown-600)' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {new Date(ride.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--brown-600)' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {new Date(ride.date).toLocaleTimeString('en-US', { 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        
        {/* Driver Info */}
        {ride.provider && (
          <div className="flex items-center gap-3 mb-4">
            <div className="avatar">
              <div className="w-full h-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: 'var(--brown-600)' }}>
                {ride.provider.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {ride.provider.name}
              </div>
              {ride.provider.driverVerified && (
                <span className="badge badge-success mt-1">
                  ✓ Verified Driver
                </span>
              )}
              {/* Rating */}
              {ride.provider?.averageRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={ride.provider.averageRating} size="sm" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    ({ride.provider.totalRatings || 0} {ride.provider.totalRatings === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Information */}
        {ride.provider && (ride.provider.carDetails?.make || ride.provider.vehicleInfo) && (
          <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" role="img" aria-label="Vehicle">🚗</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Vehicle Details
              </span>
            </div>
            
            {ride.provider.carDetails?.make ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {ride.provider.carDetails.make} {ride.provider.carDetails.model}
                    {ride.provider.carDetails.year && ` (${ride.provider.carDetails.year})`}
                  </span>
                  {ride.provider.carDetails.color && (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                      {ride.provider.carDetails.color}
                    </span>
                  )}
                </div>
                
                {ride.provider.carDetails.licensePlate && (
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    📋 {ride.provider.carDetails.licensePlate}
                  </div>
                )}
                
                <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {ride.provider.carDetails.seats && (
                    <span>👥 {ride.provider.carDetails.seats} seats</span>
                  )}
                  {ride.provider.carDetails.fuelType && (
                    <span>⛽ {ride.provider.carDetails.fuelType}</span>
                  )}
                  {ride.provider.carDetails.transmission && (
                    <span>⚙️ {ride.provider.carDetails.transmission}</span>
                  )}
                  {ride.provider.carDetails.ac && (
                    <span>❄️ AC</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {ride.provider.vehicleInfo}
              </div>
            )}
          </div>
        )}
        
        {/* Seats & Price */}
        <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--brown-600)' }}>
              <path d="M4 19v-2a1 1 0 011-1h1a1 1 0 001-1v-3h10v3a1 1 0 001 1h1a1 1 0 011 1v2M10 5.5V7m4-1.5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {ride.seatsAvailable} {ride.seatsAvailable === 1 ? 'seat' : 'seats'} available
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'var(--brown-700)' }}>
              ₹{ride.price || 0}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>per seat</div>
          </div>
        </div>
      </div>
      
      {/* Card Footer - Actions */}
      <div className="card-footer">
        {showBookingButton && onBook && ride.seatsAvailable > 0 && (
          <button 
            onClick={() => onBook(ride)} 
            className="btn btn-primary flex-1"
            aria-label={`Book ride from ${ride.from} to ${ride.to}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Book Now
          </button>
        )}
        {ride.seatsAvailable === 0 && (
          <div className="badge badge-error flex-1 justify-center py-2">
            Fully Booked
          </div>
        )}
        <button 
          onClick={() => nav(`/chat/${ride._id}`)} 
          className="btn btn-outline"
          aria-label="Chat with driver"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Chat
        </button>
      </div>
    </div>
  )
}
