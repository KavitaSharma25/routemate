import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export function useChat(){
  return useContext(ChatContext)
}

export function ChatProvider({ children }){
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [online, setOnline] = useState({}) // map room -> Set of users {userId: name}
  const [liveLocations, setLiveLocations] = useState({}) // map rideId -> { lat, lng, ts }
  const socketRef = useRef(null)

  const { token: authToken, user: authUser } = useAuth() || {}

  useEffect(()=>{
    const token = authToken || localStorage.getItem('token')
    const backend = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    // include user in socket auth so server can label presence without extra DB lookup
    const socket = io(backend, { auth: { token, user: { id: authUser?.id || authUser?._id || localStorage.getItem('userId'), name: authUser?.name || authUser?.email } } })
    socketRef.current = socket

    socket.on('connect', ()=>{ setConnected(true) })
    socket.on('disconnect', ()=>{ setConnected(false) })

    socket.on('chatMessage', (msg)=>{
      console.log('Received chat message:', msg)
      setMessages(prev=>[...prev, msg])
    })
      socket.on('location_update', (data)=>{
        if (!data || !data.rideId) return
        setLiveLocations(prev => ({ ...prev, [data.rideId]: { lat: data.lat, lng: data.lng, ts: data.ts } }))
      })
    socket.on('user_joined', (payload) => {
      const { room, userId, name } = payload || {}
      const r = room || null
      if (!r) return
      setOnline(prev => {
        const next = { ...prev }
        if (!next[r]) next[r] = {}
        next[r][userId] = name
        return next
      })
    })
    socket.on('user_left', (payload) => {
      const { room, userId } = payload || {}
      if (!room) return
      setOnline(prev => {
        const next = { ...prev }
        if (!next[room]) return next
        const copy = { ...next[room] }
        delete copy[userId]
        next[room] = copy
        return next
      })
    })

    return ()=>{
      socket.disconnect()
    }
  },[])

  // load historical messages for a ride (via REST endpoint)
  const loadMessages = async (rideId) => {
    try {
      const token = authToken || localStorage.getItem('token')
      const backend = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      // accept room name like 'ride_<id>' or plain id
      const rid = typeof rideId === 'string' && rideId.startsWith('ride_') ? rideId.split('ride_')[1] : rideId
      const res = await axios.get(`${backend}/api/chat/ride/${rid}`, { headers: { Authorization: `Bearer ${token}` } })
      // normalize messages to the socket shape: { room, message, from, createdAt }
      const normalized = res.data.map(m => ({ room: rideId, message: m.content || m.message, from: (m.from && (m.from._id || m.from)) || m.from, createdAt: m.createdAt, _id: m._id }))
      setMessages(prev => {
        // merge de-duplicating by createdAt+from
        const existingKeys = new Set(prev.map(p => `${p.createdAt}_${p.from}`))
        const combined = [...prev]
        for (const nm of normalized) {
          const key = `${nm.createdAt}_${nm.from}`
          if (!existingKeys.has(key)) {
            combined.push(nm)
            existingKeys.add(key)
          }
        }
        // sort by createdAt
        combined.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt))
        return combined
      })
    } catch (err) {
      console.error('Failed to load messages', err)
    }
  }

  const joinRoom = (room) => {
    if (!socketRef.current) return
    const uid = authUser?.id || authUser?._id || localStorage.getItem('userId')
    const name = authUser?.name || authUser?.email || 'User'
    socketRef.current.emit('joinRoom',{ room, userId: uid, name })
  }
  const leaveRoom = (room) => {
    if (!socketRef.current) return
    const uid = authUser?.id || authUser?._id || localStorage.getItem('userId')
    socketRef.current.emit('leaveRoom',{ room, userId: uid })
  }
  const sendMessage = (msg) => { if (socketRef.current) socketRef.current.emit('chatMessage', msg) }
  const sendLocation = (rideId, lat, lng) => { if (socketRef.current) socketRef.current.emit('location_update', { rideId, lat, lng, ts: Date.now() }) }

  const value = { connected, messages, online, liveLocations, joinRoom, leaveRoom, sendMessage, sendLocation, loadMessages }
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
