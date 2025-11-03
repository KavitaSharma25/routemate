import React, { useState, useEffect } from 'react'
import Logo from './Logo'
import './LoadingScreen.css'

export default function LoadingScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Start fade out animation after 3.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 3500)

    // Complete the loading and call onComplete after fade animation
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 4500) // Extra 1 second for fade-out animation

    return () => {
      clearInterval(progressInterval)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div 
      className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}
      role="progressbar"
      aria-label="Loading RouteMate"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-live="polite"
    >
      <div className="loading-content">
        {/* Logo with animations */}
        <div className="logo-container">
          <Logo size="xl" />
        </div>

        {/* Animated text */}
        <h1 className="loading-title">
          <span className="letter">R</span>
          <span className="letter">o</span>
          <span className="letter">u</span>
          <span className="letter">t</span>
          <span className="letter">e</span>
          <span className="letter">M</span>
          <span className="letter">a</span>
          <span className="letter">t</span>
          <span className="letter">e</span>
        </h1>

        {/* Tagline */}
        <p className="loading-tagline">College Carpooling Made Elegant</p>

        {/* Animated progress bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Loading percentage (optional - hidden by default) */}
        <div className="loading-percentage" aria-live="polite">
          <span className="sr-only">Loading: {progress}%</span>
        </div>

        {/* Animated dots */}
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* Background animated elements */}
      <div className="bg-decoration decoration-1" aria-hidden="true"></div>
      <div className="bg-decoration decoration-2" aria-hidden="true"></div>
      <div className="bg-decoration decoration-3" aria-hidden="true"></div>
    </div>
  )
}
