import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Intro from './pages/Intro'
import Login from './pages/Login'
import Register from './pages/Register'
import RideSearch from './pages/RideSearch'
import ProvideRide from './pages/ProvideRide'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import RideHistory from './pages/RideHistory'
import MyRides from './pages/MyRides'
import MyBookings from './pages/MyBookings'
import Dashboard from './pages/Dashboard'
import PublicProfile from './pages/PublicProfile'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'
import NotificationToast from './components/NotificationToast'
import ConfirmDialog from './components/ConfirmDialog'
import './styles/theme.css'
import './styles/animations.css'
import './styles/page-transitions.css'

export default function App(){
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const location = useLocation()

  // Check if user has seen the loading animation in this session
  useEffect(() => {
    const hasSeenLoader = sessionStorage.getItem('hasSeenLoader')
    
    if (hasSeenLoader) {
      // Skip loading screen for subsequent page navigations
      setIsLoading(false)
      setShowContent(true)
    }
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    sessionStorage.setItem('hasSeenLoader', 'true')
    
    // Small delay before showing content for smooth transition
    setTimeout(() => {
      setShowContent(true)
    }, 100)
  }

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <NotificationToast />
      <ConfirmDialog />
      
      <div 
        className="min-h-screen page-transition" 
        style={{ 
          backgroundColor: 'var(--bg-primary)', 
          color: 'var(--text-primary)',
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        {location.pathname !== '/' && <Navbar />}
        <main className={location.pathname !== '/' ? 'p-4' : ''} style={location.pathname !== '/' ? { paddingTop: '90px' } : {}}>
        <Routes>
          <Route path="/intro" element={<Intro/>} />
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/search" element={<RideSearch/>} />
          <Route path="/provide" element={<ProtectedRoute><ProvideRide/></ProtectedRoute>} />
          <Route path="/my-rides" element={<ProtectedRoute><MyRides/></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<PublicProfile/>} />
          <Route path="/history" element={<ProtectedRoute><RideHistory/></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel/></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat/></ProtectedRoute>} />
          <Route path="/chat/:rideId" element={<ProtectedRoute><Chat/></ProtectedRoute>} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </main>
    </div>
    </>
  )
}
