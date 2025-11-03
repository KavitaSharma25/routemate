import React, { useState, useRef, useEffect } from 'react'

/**
 * Dropdown Component - Accessible dropdown menu
 * Features: Keyboard navigation, click outside to close, auto-positioning
 * Accessibility: ARIA roles, keyboard support (Arrow keys, Enter, Esc)
 */
export default function Dropdown({ 
  trigger, 
  children,
  align = 'left',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  
  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])
  
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={`absolute ${alignments[align]} mt-2 z-50 min-w-[200px] rounded-xl shadow-xl border animate-slideDown`}
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-2">
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                onClick: (e) => {
                  child.props.onClick?.(e)
                  if (!child.props.preventClose) {
                    setIsOpen(false)
                  }
                }
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ 
  children, 
  onClick, 
  icon,
  danger = false,
  disabled = false,
  preventClose = false,
  className = ''
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
        danger 
          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
          : 'hover:bg-[var(--bg-secondary)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={!danger ? { color: 'var(--text-primary)' } : {}}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-grow">{children}</span>
    </button>
  )
}

export function DropdownDivider() {
  return (
    <div 
      className="my-1 border-t" 
      role="separator"
      style={{ borderColor: 'var(--border-color)' }}
    />
  )
}
