import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-9xl font-bold" style={{ background: 'linear-gradient(to right, var(--mahogany), var(--tobacco))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            404
          </div>
          <div className="text-6xl my-4">🚗💨</div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Oops! Wrong Turn</h1>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Looks like this page took a detour and got lost. Let's get you back on track!
        </p>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <Link 
            to="/" 
            className="block w-full px-6 py-3 rounded-lg transition-colors font-medium btn-primary"
          >
            🏠 Go Home
          </Link>
          <Link 
            to="/search" 
            className="block w-full px-6 py-3 rounded-lg transition-colors font-medium"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            🔍 Find Rides
          </Link>
        </div>

        {/* Additional Links */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Need help finding something?
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link to="/provide" className="text-blue-600 hover:underline">
              Provide Ride
            </Link>
            <Link to="/history" className="text-blue-600 hover:underline">
              History
            </Link>
            <Link to="/chat" className="text-blue-600 hover:underline">
              Chat
            </Link>
            <Link to="/profile" className="text-blue-600 hover:underline">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
