import React from 'react'

const Logo = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: { width: 50, height: 50, fontSize: '0.875rem', viewBox: '0 0 140 90' },
    md: { width: 80, height: 80, fontSize: '1.125rem', viewBox: '0 0 140 90' },
    lg: { width: 150, height: 150, fontSize: '1.75rem', viewBox: '0 0 140 90' },
    xl: { width: 220, height: 220, fontSize: '2.5rem', viewBox: '0 0 140 90' }
  }

  const { width, height, viewBox } = sizes[size] || sizes.md

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'sm' ? '12px' : '16px' }}>
      <svg 
        width={width} 
        height={height} 
        viewBox={viewBox}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="RouteMate Logo"
      >
        <defs>
          {/* Premium Gradients */}
          <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F8F9FA" />
            <stop offset="100%" stopColor="#F0F1F3" />
          </linearGradient>
          
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0F1F3" />
            <stop offset="100%" stopColor="#E8E9EB" />
          </linearGradient>
          
          <linearGradient id="redPinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="50%" stopColor="#EE5A52" />
            <stop offset="100%" stopColor="#DC4C47" />
          </linearGradient>

          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2D3436" opacity="0.15" />
            <stop offset="50%" stopColor="#2D3436" opacity="0.35" />
            <stop offset="100%" stopColor="#2D3436" opacity="0.15" />
          </linearGradient>

          {/* Elegant Shadow */}
          <filter id="elegantShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Soft Glow */}
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Metallic Shine */}
          <linearGradient id="metalShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8E9EB" />
            <stop offset="40%" stopColor="#F8F9FA" />
            <stop offset="60%" stopColor="#F8F9FA" />
            <stop offset="100%" stopColor="#D1D3D6" />
          </linearGradient>
        </defs>

        {/* Elegant Curved Road */}
        <path
          d="M 5 68 Q 35 55, 60 62 Q 85 68, 115 58"
          stroke="url(#roadGrad)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 5 68 Q 35 55, 60 62 Q 85 68, 115 58"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4,6"
          opacity="0.4"
        />

        {/* Premium Vintage Car */}
        <g filter="url(#elegantShadow)">
          {/* Car Shadow Base */}
          <ellipse cx="52" cy="74" rx="28" ry="5" fill="#2D3436" opacity="0.15" />
          
          {/* Main Car Body */}
          <path
            d="M 24 55 L 24 45 Q 24 40, 30 39 L 40 39 Q 44 30, 52 30 Q 60 30, 64 39 L 74 39 Q 80 40, 80 45 L 80 56 Q 80 60, 75 60 L 29 60 Q 24 60, 24 55 Z"
            fill="url(#carBodyGrad)"
            stroke="#2D3436"
            strokeWidth="2.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          
          {/* Elegant Roof */}
          <path
            d="M 34 39 Q 37 33, 42 30 L 62 30 Q 67 33, 70 39 Z"
            fill="url(#roofGrad)"
            stroke="#2D3436"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Chrome Trim on Roof */}
          <path
            d="M 36 38 Q 38 34, 42 32 L 62 32 Q 66 34, 68 38"
            stroke="url(#metalShine)"
            strokeWidth="1.2"
            fill="none"
            opacity="0.8"
          />
          
          {/* Premium Tinted Windows */}
          <path
            d="M 36 37 L 40 32 L 49 32 L 50 37 Z"
            fill="#2D3436"
            opacity="0.75"
          />
          <path
            d="M 54 37 L 55 32 L 64 32 L 68 37 Z"
            fill="#2D3436"
            opacity="0.75"
          />

          {/* Window Reflections */}
          <path d="M 38 34 L 40 33 L 46 33" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
          <path d="M 57 34 L 59 33 L 62 33" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
          
          {/* Chrome Door Handle */}
          <rect x="78" y="49" width="2" height="6" rx="1" fill="url(#metalShine)" />
          
          {/* Body Accent Line */}
          <line x1="26" y1="52" x2="78" y2="52" stroke="#2D3436" strokeWidth="1.5" opacity="0.2" />
          
          {/* Premium Wheels */}
          <g>
            {/* Front Wheel */}
            <circle cx="35" cy="60" r="8" fill="#2D3436" />
            <circle cx="35" cy="60" r="6.5" fill="url(#metalShine)" />
            <circle cx="35" cy="60" r="5" fill="#3D4549" />
            <circle cx="35" cy="60" r="2.5" fill="url(#metalShine)" />
            {/* Spokes */}
            <line x1="35" y1="55" x2="35" y2="65" stroke="#2D3436" strokeWidth="0.5" />
            <line x1="30" y1="60" x2="40" y2="60" stroke="#2D3436" strokeWidth="0.5" />
            
            {/* Rear Wheel */}
            <circle cx="69" cy="60" r="8" fill="#2D3436" />
            <circle cx="69" cy="60" r="6.5" fill="url(#metalShine)" />
            <circle cx="69" cy="60" r="5" fill="#3D4549" />
            <circle cx="69" cy="60" r="2.5" fill="url(#metalShine)" />
            {/* Spokes */}
            <line x1="69" y1="55" x2="69" y2="65" stroke="#2D3436" strokeWidth="0.5" />
            <line x1="64" y1="60" x2="74" y2="60" stroke="#2D3436" strokeWidth="0.5" />
          </g>
          
          {/* Premium Headlight */}
          <circle cx="81" cy="50" r="2" fill="#FFF8DC" opacity="0.9" filter="url(#softGlow)" />
          <circle cx="81" cy="50" r="1.2" fill="#FFFACD" />
          
          {/* Elegant Exhaust Smoke */}
          <circle cx="18" cy="58" r="3" fill="#E8E9EB" opacity="0.5" />
          <circle cx="14" cy="55" r="2.5" fill="#E8E9EB" opacity="0.35" />
          <circle cx="11" cy="58" r="2" fill="#E8E9EB" opacity="0.25" />
          <circle cx="9" cy="56" r="1.5" fill="#E8E9EB" opacity="0.15" />
        </g>

        {/* Premium Location Pin */}
        <g transform="translate(105, 20)" filter="url(#elegantShadow)">
          <path
            d="M 12 0 C 5.4 0, 0 5.4, 0 12 C 0 18 6 26 12 34 C 18 26 24 18 24 12 C 24 5.4 18.6 0 12 0 Z"
            fill="url(#redPinGrad)"
            stroke="#2D3436"
            strokeWidth="2.2"
          />
          {/* Pin Inner Circle */}
          <circle cx="12" cy="12" r="5" fill="#FFFFFF" opacity="0.95" />
          <circle cx="12" cy="12" r="3" fill="#2D3436" opacity="0.1" />
          {/* Pin Highlight */}
          <ellipse cx="10" cy="10" rx="2" ry="3" fill="#FFFFFF" opacity="0.4" />
        </g>
      </svg>
      
      {showText && size !== 'sm' && (
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: '700',
          fontSize: sizes[size].fontSize,
          color: '#2D3436',
          letterSpacing: '-0.03em',
          textShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          RouteMate
        </span>
      )}
    </div>
  )
}

export default Logo
