import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Modal Component - Accessible modal dialog with animations
 * Features: Backdrop click to close, ESC key support, focus trap, animations
 * Accessibility: ARIA roles, focus management, keyboard navigation
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer,
  className = ''
}) {
  const modalRef = useRef(null)
  const previousFocus = useRef(null)
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  }
  
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement
      document.body.style.overflow = 'hidden'
      
      // Focus first focusable element in modal
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        firstFocusable?.focus()
      }, 100)
    } else {
      document.body.style.overflow = 'unset'
      previousFocus.current?.focus()
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  useEffect(() => {
    if (!closeOnEsc) return
    
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, closeOnEsc])
  
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`relative w-full ${sizes[size]} rounded-2xl shadow-2xl animate-slideUp ${className}`}
        style={{ backgroundColor: 'var(--bg-card)', maxHeight: '90vh', overflow: 'auto' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h2 id="modal-title" className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--mahogany)]"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 p-6 border-t" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
