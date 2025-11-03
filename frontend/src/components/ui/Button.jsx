import React from 'react'

/**
 * Button Component - Reusable button with variants and sizes
 * Supports: primary, secondary, outline, ghost, danger variants
 * Sizes: sm, md, lg
 * Accessibility: Full keyboard support, ARIA labels, focus management
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  onClick,
  type = 'button',
  ariaLabel,
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-[var(--mahogany)] text-[var(--vanilla)] hover:opacity-90 focus:ring-[var(--mahogany)] shadow-sm hover:shadow-md active:scale-95',
    secondary: 'bg-[var(--tobacco)] text-white hover:opacity-90 focus:ring-[var(--tobacco)] shadow-sm hover:shadow-md active:scale-95',
    outline: 'border-2 border-[var(--mahogany)] text-[var(--mahogany)] hover:bg-[var(--mahogany)] hover:text-[var(--vanilla)] focus:ring-[var(--mahogany)] active:scale-95',
    ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus:ring-[var(--border-color)] active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md active:scale-95'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
