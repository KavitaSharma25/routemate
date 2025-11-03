import React, { forwardRef } from 'react'

/**
 * Input Component - Accessible form input with variants
 * Supports: text, email, password, number, date, textarea
 * Features: Error states, helper text, icons, full accessibility
 */
const Input = forwardRef(({ 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  inputClassName = '',
  id,
  type = 'text',
  rows = 4,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const isTextarea = type === 'textarea'
  const InputElement = isTextarea ? 'textarea' : 'input'
  
  const baseStyles = 'w-full px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const normalStyles = 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-[var(--mahogany)] focus:border-[var(--mahogany)] placeholder:text-[var(--text-muted)]'
  
  const errorStyles = 'border-2 border-red-500 bg-red-50 dark:bg-red-900/10 focus:ring-red-500 focus:border-red-500'
  
  const containerClass = fullWidth ? 'w-full' : ''
  
  return (
    <div className={`${containerClass} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
            {leftIcon}
          </div>
        )}
        
        <InputElement
          ref={ref}
          id={inputId}
          type={isTextarea ? undefined : type}
          rows={isTextarea ? rows : undefined}
          className={`${baseStyles} ${error ? errorStyles : normalStyles} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${inputClassName}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`} 
          className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <span aria-hidden="true">⚠️</span>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`} 
          className="mt-1 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
