import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RideCard from '../components/RideCard'
import Logo from '../components/Logo'
import axios from 'axios'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [stats, setStats] = useState({ totalRides: 0, totalUsers: 0, avgRating: 4.7 })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/rides/search')
        if (!mounted) return
        const ridesData = res.data || []
        setFeatured(ridesData.slice(0, 3))
        setStats(prev => ({ ...prev, totalRides: ridesData.length }))
      } catch (e) {}
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', margin: '-1rem', marginBottom: 0 }}>
      <main>
        {/* Hero Section with Background Image */}
        <section 
          style={{ 
            background: '#7fa8b8',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          {/* Background Image with Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/images/bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
            filter: 'brightness(0.85)'
          }}></div>
          
          {/* Enhanced Overlay for better text readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.5) 0%, rgba(52, 73, 94, 0.4) 50%, rgba(44, 62, 80, 0.5) 100%)',
            pointerEvents: 'none'
          }}></div>
          
          {/* Subtle vignette effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none'
          }}></div>

          {/* Navigation Bar Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: '20px clamp(20px, 5vw, 60px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)'
          }}>
            {/* Logo */}
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none'
            }}>
              <Logo size="sm" showText={false} />
              <span style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                color: 'white',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>RouteMate</span>
            </Link>

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
              <Link to="/search" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.625rem 1rem',
                minHeight: '40px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: 'white',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'transparent'
                e.target.style.transform = 'translateY(0)'
              }}>
                Find Rides
              </Link>
              <Link to="/provide" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.625rem 1rem',
                minHeight: '40px',
                fontSize: '0.875rem',
                fontWeight: '600',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                color: '#1a1a1a',
                borderColor: 'var(--accent-gold)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(201, 169, 97, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #b8935e, var(--accent-gold))'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(201, 169, 97, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, var(--accent-gold), #b8935e)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(201, 169, 97, 0.25)'
              }}>
                Provide Ride
              </Link>
              <Link to="/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.625rem 1rem',
                minHeight: '40px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: 'white',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'transparent'
                e.target.style.transform = 'translateY(0)'
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.625rem 1rem',
                minHeight: '40px',
                fontSize: '0.875rem',
                fontWeight: '600',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                color: 'white',
                borderColor: 'var(--accent-gold)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(201, 169, 97, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #b8935e, var(--accent-gold))'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(201, 169, 97, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, var(--accent-gold), #b8935e)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(201, 169, 97, 0.25)'
              }}>
                Register
              </Link>
            </div>
          </div>

          <div className="container max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
            {/* Enhanced Glassmorphic Container */}
            <div style={{
              background: 'transparent',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              borderRadius: '28px',
              padding: 'clamp(24px, 4vw, 40px)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.5), 0 15px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              maxWidth: '1100px',
              margin: '0 auto',
              transform: 'translateY(0)',
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 6vw, 60px)', alignItems: 'center' }}>
                {/* Left Content */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ 
                    marginBottom: '-10px', 
                    display: 'inline-block',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <Logo size="lg" showText={false} />
                  </div>
                  
                  <h1 style={{ 
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: '800',
                    color: 'white',
                    fontFamily: 'var(--font-family-heading)',
                    marginBottom: '16px',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                    textShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    Your Journey,<br />
                    <span style={{ 
                      background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffc107)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3))'
                    }}>
                      Perfected
                    </span>
                  </h1>
                  
                  <p style={{ 
                    fontSize: '1.05rem',
                    color: 'rgba(255, 255, 255, 0.95)',
                    marginBottom: '28px',
                    lineHeight: '1.65',
                    maxWidth: '480px',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    Experience premium carpooling at Chitkara University. Connect, share rides, and travel together.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to="/search" style={{
                      padding: '14px 32px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                      color: '#1a1a1a',
                      fontWeight: '700',
                      fontSize: '1rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px rgba(201, 169, 97, 0.4)',
                      transition: 'all 0.3s ease',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px)'
                      e.target.style.boxShadow = '0 12px 32px rgba(201, 169, 97, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 8px 24px rgba(201, 169, 97, 0.4)'
                    }}>
                      Find Rides
                    </Link>
                    <Link to="/provide" style={{
                      padding: '14px 32px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                      e.target.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.transform = 'translateY(0)'
                    }}>
                      Offer Ride
                    </Link>
                  </div>

                  {/* Stats */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    marginTop: '24px',
                    paddingTop: '18px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>{stats.avgRating}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>Rating</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>{stats.totalRides}+</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>Rides</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>100+</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>Users</div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Feature Card */}
                <div style={{
                  background: 'rgba(30, 39, 46, 0.4)',
                  backdropFilter: 'blur(20px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                  borderRadius: '20px',
                  padding: 'clamp(20px, 3vw, 28px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                  transform: 'translateZ(0)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}>
                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ 
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-family-heading)',
                      letterSpacing: '-0.01em',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                      Campus Carpooling
                    </h3>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: '1.5',
                      marginBottom: '18px',
                      fontSize: '0.9rem'
                    }}>
                      Share rides with fellow students. Save money and travel together.
                    </p>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px'
                  }}>
                    {[
                      { text: 'Verified Chitkara Users' },
                      { text: 'Save Up to 70% on Travel' },
                      { text: 'Safe & Secure Rides' },
                      { text: 'Instant Booking' }
                    ].map((feature, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        position: 'relative',
                        paddingLeft: '38px'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '12px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1a1a1a',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>✓</div>
                        <span style={{ color: 'white', fontWeight: '500', fontSize: '0.85rem' }}>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Rides Section */}
        {featured.length > 0 && (
          <section style={{ 
            padding: '80px 20px',
            backgroundColor: 'var(--bg-primary)',
            position: 'relative'
          }}>
            <div className="container max-w-7xl mx-auto">
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ 
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-heading)',
                  marginBottom: '16px'
                }}>
                  Popular Rides Right Now
                </h2>
                <p style={{ 
                  fontSize: '1.125rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Check out these trending rides and book your seat instantly
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {featured.map(ride => <RideCard key={ride._id} ride={ride} showBookingButton={false} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Link to="/search" style={{
                  padding: '14px 32px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(201, 169, 97, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 20px rgba(201, 169, 97, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 16px rgba(201, 169, 97, 0.3)'
                }}>
                  View All Rides →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section style={{
          padding: '80px 20px',
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)'
        }}>
          <div className="container max-w-6xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '800',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family-heading)',
                marginBottom: '16px'
              }}>
                How RouteMate Works
              </h2>
              <p style={{ 
                fontSize: '1.125rem',
                color: 'var(--text-secondary)'
              }}>
                Get started in three simple steps
              </p>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px'
            }}>
              {[
                { 
                  icon: '🔍',
                  title: 'Find Your Ride',
                  desc: 'Search for rides based on your route, date, and preferences'
                },
                {
                  icon: '💬',
                  title: 'Connect & Book',
                  desc: 'Chat with the driver, confirm details, and book your seat'
                },
                {
                  icon: '✨',
                  title: 'Enjoy the Journey',
                  desc: 'Travel safely, split costs, and make new friends'
                }
              ].map((step, idx) => (
                <div key={idx} style={{
                  background: 'var(--bg-card)',
                  borderRadius: '20px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-luxury)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.25rem',
                    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.4)'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ 
                    fontSize: '4rem',
                    marginBottom: '20px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                    fontFamily: 'var(--font-family-heading)'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6'
                  }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ 
          padding: '100px 20px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 50%, #34495e 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(201, 169, 97, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}></div>
          
          <div className="container max-w-4xl mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '24px',
              fontFamily: 'var(--font-family-heading)'
            }}>
              Ready to Start Your Journey?
            </h2>
            <p style={{ 
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px'
            }}>
              Join hundreds of students already saving money and making connections through RouteMate
            </p>
            <Link to="/register" style={{
              padding: '18px 48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
              color: '#1a1a1a',
              fontWeight: '700',
              fontSize: '1.25rem',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 8px 32px rgba(201, 169, 97, 0.5)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05)'
              e.target.style.boxShadow = '0 12px 40px rgba(201, 169, 97, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 8px 32px rgba(201, 169, 97, 0.5)'
            }}>
              Get Started Free →
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
