import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/NotificationToast'
import Logo from '../components/Logo'

export default function Register(){
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, watch } = useForm({
    defaultValues: {
      role: 'student',
      isDriver: false
    }
  })
  const nav = useNavigate()
  const { login } = useAuth()
  const { showNotification } = useNotification()
  
  // OTP verification state
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [tempOTPData, setTempOTPData] = useState(null)
  
  const phoneValue = watch('phone')
  
  // Send OTP to phone number
  const handleSendOTP = async () => {
    const phone = phoneValue
    
    if (!phone || !/^\d{10}$/.test(phone)) {
      showNotification('Please enter a valid 10-digit phone number', 'error')
      return
    }
    
    setOtpLoading(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/send-otp`, {
        phone
      })
      
      setOtpSent(true)
      setTempOTPData(res.data.tempData)
      showNotification(res.data.message || 'OTP sent successfully', 'success')
      
      // Show OTP in development mode with clear instructions
      if (res.data.otp && res.data.devMode) {
        // Show prominent notification with OTP
        showNotification(
          `🔐 DEV MODE - Your OTP is: ${res.data.otp}`, 
          'info', 
          15000 // 15 seconds
        )
        console.log('═══════════════════════════════════════')
        console.log('🔐 DEVELOPMENT MODE - OTP GENERATED')
        console.log(`📱 Phone: ${phone}`)
        console.log(`🔑 OTP: ${res.data.otp}`)
        console.log('⏰ Valid for: 10 minutes')
        console.log('═══════════════════════════════════════')
      }
      
      // Start countdown for resend
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to send OTP', 'error')
    } finally {
      setOtpLoading(false)
    }
  }
  
  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6) {
      showNotification('Please enter a valid 6-digit OTP', 'error')
      return
    }
    
    setOtpLoading(true)
    try {
      // Verify against temporary stored OTP
      if (tempOTPData && tempOTPData.otp === otpValue) {
        const expiryTime = new Date(tempOTPData.otpExpiry)
        if (new Date() > expiryTime) {
          showNotification('OTP has expired. Please request a new one.', 'error')
          setOtpSent(false)
          setOtpValue('')
          setOtpLoading(false)
          return
        }
        
        setOtpVerified(true)
        showNotification('Phone number verified successfully!', 'success')
      } else {
        showNotification('Invalid OTP. Please try again.', 'error')
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to verify OTP', 'error')
    } finally {
      setOtpLoading(false)
    }
  }

  const onSubmit = async (data) => {
    // Check if phone is verified
    if (!otpVerified) {
      showNotification('Please verify your phone number first', 'error')
      return
    }
    
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        ...data,
        phoneVerified: otpVerified
      })
      const token = res.data.token || res.data.accessToken
      const user = res.data.user || { id: res.data.userId || res.data._id || null, email: data.email }
      if (token) login({ token, user })
      showNotification('Registration successful!', 'success')
      nav('/')
    }catch(err){
      setError('root', { message: err.response?.data?.message || 'Registration failed' })
      showNotification(err.response?.data?.message || 'Registration failed', 'error')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: 'var(--shadow-luxury)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
              <Logo size="lg" showText={false} />
            </div>
            <h2 style={{ 
              margin: '0 0 8px', 
              fontSize: '32px', 
              fontWeight: 'bold',
              fontFamily: 'var(--font-family-heading)',
              color: 'var(--text-primary)'
            }}>Create Account</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Join the RouteMate community</p>
          </div>

        {errors.root && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#c00'
          }}>
            ⚠️ {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Full Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              {...register('name', { 
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: errors.name ? '2px solid red' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
            {errors.name && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.name.message}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-primary)' }}>
              College Email <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@chitkara\.edu\.in$/i,
                  message: 'Please use your Chitkara college email (@chitkara.edu.in)'
                }
              })}
              type="email"
              placeholder="your.name@chitkara.edu.in"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: errors.email ? '2px solid red' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
            {errors.email && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>}
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Use your official Chitkara email</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Password <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              type="password"
              placeholder="Create a strong password"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: errors.password ? '2px solid red' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
            {errors.password && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>}
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Minimum 6 characters</p>
          </div>

          {/* Phone Number Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Phone Number <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                type="tel"
                placeholder="Enter 10-digit mobile number"
                disabled={otpVerified}
                maxLength={10}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: errors.phone ? '2px solid red' : otpVerified ? '2px solid #28a745' : '1px solid var(--border-color)',
                  backgroundColor: otpVerified ? '#d1fae5' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
              {!otpVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading || countdown > 0 || !phoneValue || !/^\d{10}$/.test(phoneValue)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: countdown > 0 ? '#6c757d' : 'var(--navy-600)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {otpLoading ? '...' : countdown > 0 ? `${countdown}s` : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              )}
              {otpVerified && (
                <div style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ✓ Verified
                </div>
              )}
            </div>
            {errors.phone && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.phone.message}</p>}
            {otpVerified && <p style={{ color: '#28a745', fontSize: '12px', marginTop: '4px' }}>✓ Phone number verified</p>}
          </div>

          {/* OTP Verification Field */}
          {otpSent && !otpVerified && (
            <div style={{ 
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '2px dashed var(--border-color)'
            }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Enter OTP <span style={{ color: 'red' }}>*</span>
              </label>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                We've sent a 6-digit OTP to your phone number
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    letterSpacing: '4px',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otpValue.length !== 6}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#28a745',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: otpValue.length !== 6 ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {otpLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Role <span style={{ color: 'red' }}>*</span>
            </label>
            <select 
              {...register('role', { required: 'Role is required' })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: errors.role ? '2px solid red' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            {errors.role && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.role.message}</p>}
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'start', gap: '10px' }}>
            <input 
              type="checkbox" 
              {...register('isDriver')}
              id="isDriver" 
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--mahogany)' }}
            />
            <label htmlFor="isDriver" style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
              <span style={{ fontWeight: '500' }}>I want to provide rides</span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Register as a driver to offer rides to others</p>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !otpVerified}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px',
              opacity: !otpVerified ? 0.6 : 1,
              cursor: !otpVerified ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
          
          {!otpVerified && (
            <p style={{ 
              textAlign: 'center', 
              fontSize: '12px', 
              color: '#f59e0b', 
              marginTop: '12px',
              fontWeight: '500'
            }}>
              ⚠️ Please verify your phone number to continue
            </p>
          )}
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ color: 'var(--navy-600)', fontWeight: '600', textDecoration: 'none' }}
            >
              Login here
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
