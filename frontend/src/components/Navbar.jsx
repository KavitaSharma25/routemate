import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DarkModeToggle from './DarkModeToggle'
import Logo from './Logo'
import './Navbar.css'

export default function Navbar(){
  const { user, token, logout } = useAuth() || {}
  const nav = useNavigate()
  
  const handleLogout = () => {
    logout && logout()
    nav('/login')
  }

  return (
    <nav className="nav-bg" role="navigation" aria-label="Main navigation">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>
      
      <div className="container">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="logo-link" aria-label="RouteMate home" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(27, 60, 83, 0.1), rgba(69, 104, 130, 0.05))',
            border: '1px solid rgba(201, 169, 97, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(27, 60, 83, 0.15), rgba(69, 104, 130, 0.1))'
            e.currentTarget.style.borderColor = 'rgba(201, 169, 97, 0.4)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(27, 60, 83, 0.1), rgba(69, 104, 130, 0.05))'
            e.currentTarget.style.borderColor = 'rgba(201, 169, 97, 0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            <Logo size="sm" showText={false} />
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: '700',
              fontSize: '1.25rem',
              background: 'linear-gradient(135deg, #C9DBEF 0%, #FFE55C 50%, #FFDF3E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>
              RouteMate
            </span>
          </Link>

          {/* Navigation */}
          <div className="desktop-nav">
            {token && <Link to="/dashboard" className="nav-link dashboard touch-target">Dashboard</Link>}
            <Link to="/search" className="btn btn-secondary touch-target">Find Rides</Link>
            <Link to="/provide" className="btn btn-primary touch-target">Provide Ride</Link>
            {token && <Link to="/my-rides" className="nav-link my-rides touch-target">My Rides</Link>}
            {token ? (
              <div className="nav-user-section">
                <span className="nav-username">{user?.name || 'You'}</span>
                <Link to="/profile" className="nav-link profile touch-target">Profile</Link>
                <button onClick={handleLogout} className="nav-link logout touch-target">Logout</button>
                <DarkModeToggle />
              </div>
            ) : (
              <div className="nav-user-section">
                <Link to="/login" className="nav-link login touch-target">Login</Link>
                <Link to="/register" className="btn btn-secondary touch-target">Register</Link>
                <DarkModeToggle />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
