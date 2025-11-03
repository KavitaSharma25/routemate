import React from 'react'

const Logo = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: { width: 40, height: 40, fontSize: '0.875rem', viewBox: '0 0 100 100' },
    md: { width: 56, height: 56, fontSize: '1.125rem', viewBox: '0 0 100 100' },
    lg: { width: 120, height: 120, fontSize: '1.75rem', viewBox: '0 0 100 100' },
    xl: { width: 180, height: 180, fontSize: '2.5rem', viewBox: '0 0 100 100' }
  }

  const { width, height, viewBox } = sizes[size] || sizes.md

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'sm' ? '8px' : '12px' }}>
      <svg 
        width={width} 
        height={height} 
        viewBox={viewBox}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="RouteMate Logo"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(27, 60, 83, 0.15))' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="carBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8BA9C9" />
            <stop offset="50%" stopColor="#A8C5E0" />
            <stop offset="100%" stopColor="#8BA9C9" />
          </linearGradient>
          
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE55C" />
            <stop offset="50%" stopColor="#FFDF3E" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A8C5E0" opacity="0.3" />
            <stop offset="50%" stopColor="#8BA9C9" opacity="0.6" />
            <stop offset="100%" stopColor="#A8C5E0" opacity="0.3" />
          </linearGradient>

          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Shadow */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1B3C53" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Background Circle - Premium */}
        <circle cx="50" cy="50" r="48" fill="url(#roadGradient)" opacity="0.1" />
        
        {/* Road/Path - Curved */}
        <path
          d="M 15 65 Q 35 55, 50 65 Q 65 75, 85 65"
          stroke="url(#roadGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        {/* Decorative dots */}
        <circle cx="20" cy="62" r="1.5" fill="#C9A961" opacity="0.8" />
        <circle cx="80" cy="62" r="1.5" fill="#C9A961" opacity="0.8" />

        {/* Car Body - Modern Luxury */}
        <g filter="url(#shadow)">
          {/* Main body */}
          <rect x="30" y="38" width="40" height="18" rx="4" fill="url(#carBodyGradient)" />
          
          {/* Car Roof */}
          <path
            d="M 36 38 L 42 28 L 58 28 L 64 38 Z"
            fill="url(#carBodyGradient)"
            opacity="0.95"
          />
          
          {/* Windows - Elegant */}
          <rect x="38" y="31" width="10" height="6" rx="1.5" fill="#FFFFFF" opacity="0.95" />
          <rect x="52" y="31" width="10" height="6" rx="1.5" fill="#FFFFFF" opacity="0.95" />
          
          {/* Passengers - Silhouettes */}
          <circle cx="43" cy="34" r="2" fill="#5A7FA0" />
          <circle cx="57" cy="34" r="2" fill="#5A7FA0" />
          
          {/* Wheels - Premium with Gold Centers */}
          <circle cx="38" cy="56" r="6" fill="#5A7FA0" />
          <circle cx="38" cy="56" r="3" fill="url(#goldGradient)" filter="url(#glow)" />
          <circle cx="62" cy="56" r="6" fill="#5A7FA0" />
          <circle cx="62" cy="56" r="3" fill="url(#goldGradient)" filter="url(#glow)" />
          
          {/* Car Details - Headlights */}
          <rect x="68" y="43" width="2" height="4" rx="1" fill="#FFD700" opacity="0.9" />
          <rect x="68" y="49" width="2" height="4" rx="1" fill="#FFD700" opacity="0.9" />
          
          {/* Luxury accent line */}
          <line x1="32" y1="45" x2="68" y2="45" stroke="#C9A961" strokeWidth="0.5" opacity="0.6" />
        </g>

        {/* Location Pin - Premium Gold */}
        <g filter="url(#glow)">
          <path
            d="M 72 20 C 72 17 73.5 15 76 15 C 78.5 15 80 17 80 20 C 80 22 78.5 24 76 27 C 73.5 24 72 22 72 20 Z"
            fill="url(#goldGradient)"
          />
          <circle cx="76" cy="19.5" r="2" fill="#5A7FA0" />
        </g>

        {/* Premium Badge Circle */}
        <circle cx="50" cy="50" r="47" stroke="url(#goldGradient)" strokeWidth="0.5" fill="none" opacity="0.3" />
      </svg>
      
      {showText && size !== 'sm' && (
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: '700',
          fontSize: sizes[size].fontSize,
          background: 'linear-gradient(135deg, #A8C5E0 0%, #C9DBEF 50%, #A8C5E0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          RouteMate
        </span>
      )}
    </div>
  )
}

export default Logo
