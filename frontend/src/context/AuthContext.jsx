import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function useAuth(){
  return useContext(AuthContext)
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearAuth = () => {
    setToken(null)
    setUser(null)
    try{ localStorage.removeItem('rm_auth') }catch(e){}
    try{ localStorage.removeItem('token') }catch(e){}
    try{ localStorage.removeItem('user') }catch(e){}
  }

  useEffect(()=>{
    const validateAndLoadAuth = async () => {
      try{
        // Clear auth to prevent auto-login
        clearAuth()
        setLoading(false)
        return
        
        /* Commented out auto-login - uncomment when you want to persist sessions
        const raw = localStorage.getItem('rm_auth')
        let storedToken = null
        let storedUser = null

        if (raw){
          const parsed = JSON.parse(raw)
          storedToken = parsed.token || null
          storedUser = parsed.user || null
        } else {
          // fallback to existing keys
          storedToken = localStorage.getItem('token')
          const u = localStorage.getItem('user')
          if (u) {
            try { storedUser = JSON.parse(u) } catch(e){ storedUser = null }
          }
        }
        */

        // Only restore auth if we have BOTH valid token AND user
        if (storedToken && storedUser && storedUser.email) {
          setToken(storedToken)
          setUser(storedUser)
        } else {
          // Clear any partial/invalid data
          clearAuth()
        }
      }catch(err){
        console.warn('Failed to load auth from storage', err)
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    validateAndLoadAuth()
  },[])

  const save = (t, u) => {
    setToken(t)
    setUser(u)
    try{ localStorage.setItem('rm_auth', JSON.stringify({ token: t, user: u })) }catch(e){}
    try{ if (t) localStorage.setItem('token', t) }catch(e){}
    try{ if (u) localStorage.setItem('user', JSON.stringify(u)) }catch(e){}
  }

  const login = ({ token: t, user: u }) => {
    if (!t || !u) {
      console.warn('Invalid login attempt - missing token or user')
      return
    }
    save(t, u)
  }
  
  const logout = () => {
    clearAuth()
  }

  // Show loading state while checking auth
  if (loading) {
    return null // or a loading spinner
  }

  const value = { user, token, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
