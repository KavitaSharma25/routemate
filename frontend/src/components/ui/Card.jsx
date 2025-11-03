import React from 'react'

/**
 * Card Component - Reusable card container with variants
 * Supports: default, elevated, bordered, interactive variants
 * Accessibility: Semantic HTML, hover states, optional click handling
 */
export default function Card({ 
  children, 
  variant = 'default',
  padding = 'md',
  clickable = false,
  onClick,
  className = '',
  ...props 
}) {
  const baseStyles = 'rounded-xl transition-all duration-200'
  
  const variants = {
    default: 'bg-[var(--bg-card)] border border-[var(--border-color)]',
    elevated: 'bg-[var(--bg-card)] shadow-lg hover:shadow-xl',
    bordered: 'bg-[var(--bg-card)] border-2 border-[var(--mahogany)]',
    interactive: 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.98]'
  }
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const Component = clickable || onClick ? 'button' : 'div'
  
  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...(clickable && { role: 'button', tabIndex: 0 })}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-bold ${className}`} style={{ color: 'var(--text-primary)' }}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t ${className}`} style={{ borderColor: 'var(--border-color)' }}>
      {children}
    </div>
  )
}
