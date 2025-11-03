import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()
export function useNotifications(){ return useContext(NotificationContext) }

export function NotificationProvider({ children }){
  const { token, user } = useAuth() || {}
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)

  useEffect(()=>{
    const backend = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const t = token || localStorage.getItem('token')
    if (!t) return
    const s = io(backend, { auth: { token: t } })
    setSocket(s)
    s.on('connect', ()=>{})
    s.on('notification', (note) => {
      setNotifications(prev => [note, ...prev])
    })
    return ()=>{ s.disconnect(); setSocket(null) }
  },[token])

  const fetchNotifications = async () => {
    try{
      const t = token || localStorage.getItem('token')
      const backend = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await axios.get(`${backend}/api/notifications`, { headers: { Authorization: `Bearer ${t}` } })
      setNotifications(res.data)
    }catch(err){ console.error('Failed to fetch notifications', err) }
  }

  const markRead = async (id) => {
    try{
      const t = token || localStorage.getItem('token')
      const backend = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      await axios.post(`${backend}/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${t}` } })
      setNotifications(prev => prev.map(n => n._id === id ? {...n, read: true} : n))
    }catch(err){ console.error('Failed to mark read', err) }
  }

  useEffect(()=>{ if (token) fetchNotifications() },[token])

  return <NotificationContext.Provider value={{ notifications, fetchNotifications, markRead }}>{children}</NotificationContext.Provider>
}

export default NotificationContext
