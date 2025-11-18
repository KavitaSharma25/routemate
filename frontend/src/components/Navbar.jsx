import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DarkModeToggle from './DarkModeToggle'
import Logo from './Logo'
import './Navbar.css'

export default function Navbar(){
  const { user, token, logout } = useAuth() || {}
  const nav = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleLogout = () => {
    logout && logout()
    nav('/login')
  }

  return (
    <nav className="nav-bg" role="navigation" aria-label="Main navigation">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>
      
      <div className="nav-container">
        <div className="nav-wrapper">
          {/* Logo */}
          <Link to="/" className="nav-logo" aria-label="RouteMate home">
            <Logo size="sm" showText={false} />
            <span className="nav-logo-text">RouteMate</span>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            {/* Main Navigation Links */}
            <div className="nav-links">
              {token && <Link to="/dashboard" className="nav-item">Dashboard</Link>}
              <Link to="/search" className="nav-item">Find Rides</Link>
              <Link to="/provide" className="nav-item nav-item-primary">Provide Ride</Link>
            </div>

            {/* User Section */}
            <div className="nav-divider"></div>
            {token ? (
              <div className="nav-user">
                <div className="nav-dropdown" ref={dropdownRef}>
                  <button 
                    className="nav-dropdown-trigger"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="nav-user-avatar">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    <span className="nav-user-name">{user?.name?.split(' ')[0] || 'User'}</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="currentColor"
                      style={{ transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M4 6l4 4 4-4z"/>
                    </svg>
                  </button>

                  {userDropdownOpen && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-header">
                        <div className="nav-dropdown-user-info">
                          <div className="nav-dropdown-avatar-large">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="nav-dropdown-user-name">{user?.name || 'User'}</div>
                            <div className="nav-dropdown-user-email">{user?.email || ''}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="nav-dropdown-divider"></div>
                      
                      <Link 
                        to="/profile" 
                        className="nav-dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>My Profile</span>
                      </Link>
                      
                      <Link 
                        to="/my-rides" 
                        className="nav-dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>My Rides</span>
                      </Link>
                      
                      <Link 
                        to="/my-bookings" 
                        className="nav-dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>My Bookings</span>
                      </Link>
                      
                      <div className="nav-dropdown-divider"></div>
                      
                      <button 
                        onClick={() => {
                          handleLogout()
                          setUserDropdownOpen(false)
                        }} 
                        className="nav-dropdown-item nav-dropdown-logout"
                      >
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
                <DarkModeToggle />
              </div>
            ) : (
              <div className="nav-user">
                <Link to="/login" className="nav-item">Login</Link>
                <Link to="/register" className="nav-item nav-item-register">Register</Link>
                <DarkModeToggle />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="nav-mobile">
            {token && <Link to="/dashboard" className="nav-mobile-item" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>}
            <Link to="/search" className="nav-mobile-item" onClick={() => setMobileMenuOpen(false)}>Find Rides</Link>
            <Link to="/provide" className="nav-mobile-item nav-mobile-primary" onClick={() => setMobileMenuOpen(false)}>Provide Ride</Link>
            {token && <Link to="/my-rides" className="nav-mobile-item" onClick={() => setMobileMenuOpen(false)}>My Rides</Link>}
            {token && <Link to="/my-bookings" className="nav-mobile-item" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>}
            
            <div className="nav-mobile-divider"></div>
            
            {token ? (
              <>
                <div className="nav-mobile-user">{user?.name || 'User'}</div>
                <Link to="/profile" className="nav-mobile-item" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="nav-mobile-item">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-mobile-item" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="nav-mobile-item nav-mobile-register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
            
            <div className="nav-mobile-toggle">
              <DarkModeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
