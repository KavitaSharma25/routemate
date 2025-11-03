import React from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Register(){
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    defaultValues: {
      role: 'student',
      isDriver: false
    }
  })
  const nav = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (data) => {
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, data)
      const token = res.data.token || res.data.accessToken
      const user = res.data.user || { id: res.data.userId || res.data._id || null, email: data.email }
      if (token) login({ token, user })
      nav('/')
    }catch(err){
      setError('root', { message: err.response?.data?.message || 'Registration failed' })
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
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px'
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
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
