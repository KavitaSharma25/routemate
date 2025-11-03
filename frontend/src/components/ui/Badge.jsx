import React from 'react'

/**
 * Badge Component - Status indicators and labels
 * Variants: default, success, warning, danger, info
 * Sizes: sm, md, lg
 */
export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full'
  
  const variants = {
    default: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    primary: 'bg-[var(--mahogany)] text-[var(--vanilla)]'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }
  
  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    primary: 'bg-[var(--vanilla)]'
  }
  
  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span 
          className={`w-2 h-2 rounded-full ${dotColors[variant]} animate-pulse`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
