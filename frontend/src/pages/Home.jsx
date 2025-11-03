import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RideCard from '../components/RideCard'
import Logo from '../components/Logo'
import axios from 'axios'

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/rides/search')
        if (!mounted) return
        setFeatured((res.data || []).slice(0, 3))
      } catch (e) {}
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <main>
        <section 
          style={{ 
            background: 'linear-gradient(135deg, rgba(27, 60, 83, 0.97), rgba(69, 104, 130, 0.95))',
            position: 'relative',
            overflow: 'hidden'
          }} 
          className="py-16 md:py-24 px-4"
        >
          <div className="container max-w-5xl mx-auto text-center">
            <div style={{ marginBottom: '32px' }}>
              <Logo size="xl" showText={false} />
            </div>
            
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6" 
              style={{ 
                color: 'var(--text-inverse)',
                fontFamily: 'var(--font-family-heading)'
              }}
            >
              Premium Carpooling Experience
            </h1>
            
            <p className="text-lg md:text-xl mb-12" style={{ color: 'rgba(249, 243, 239, 0.95)' }}>
              Chitkara University's trusted ride-sharing platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search" className="btn-primary px-8 py-4 rounded-xl text-lg">
                Find Rides
              </Link>
              <Link to="/provide" className="btn-secondary px-8 py-4 rounded-xl text-lg">
                Offer Ride
              </Link>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="py-16 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="container max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
                Available Rides
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featured.map(ride => <RideCard key={ride._id} ride={ride} />)}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, var(--navy-700), #000)' }}>
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-inverse)' }}>
              Join RouteMate Today
            </h2>
            <Link to="/register" className="btn-primary px-10 py-5 rounded-xl text-lg">
              Get Started
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
