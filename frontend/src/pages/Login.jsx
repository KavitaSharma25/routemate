import React from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Login(){
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm()
  const nav = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (data) => {
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, data)
      const token = res.data.token || res.data.accessToken
      const user = res.data.user || { id: res.data.userId || res.data._id || null, email: data.email }
      if (token) login({ token, user })
      nav('/dashboard')
    }catch(err){
      setError('root', { message: err.response?.data?.message || 'Login failed' })
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
      <div style={{ maxWidth: '450px', width: '100%' }}>
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
            }}>Welcome Back</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Login to continue your journey</p>
          </div>
      
      {errors.root && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#991b1b'
        }}>
          ⚠️ {errors.root.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
            College Email
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
              padding: '12px 16px',
              borderRadius: '10px',
              border: errors.email ? '2px solid #ef4444' : '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          />
          {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
            Password
          </label>
          <input 
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            placeholder="Enter your password" 
            style={{ 
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: errors.password ? '2px solid #ef4444' : '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          />
          {errors.password && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.password.message}</p>}
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
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
          Don't have an account?
        </p>
        <Link 
          to="/register" 
          style={{ 
            display: 'inline-block',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, var(--accent-gold), #b8935e)',
            color: 'white',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: '8px',
            border: '1px solid var(--accent-gold)',
            boxShadow: '0 2px 8px rgba(201, 169, 97, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #b8935e, var(--accent-gold))';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(201, 169, 97, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, var(--accent-gold), #b8935e)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(201, 169, 97, 0.25)';
          }}
        >
          Register Now
        </Link>
      </div>
        </div>
      </div>
    </div>
  )
}
