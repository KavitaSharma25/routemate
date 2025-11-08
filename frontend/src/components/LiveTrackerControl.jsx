import React, { useEffect, useRef, useState } from 'react'
import { useChat } from '../context/ChatContext'

export default function LiveTrackerControl({ rideId }){
  const chatContext = useChat()
  const sendLocation = chatContext?.sendLocation || (() => console.log('ChatContext not available'))
  const watchIdRef = useRef(null)
  const [running, setRunning] = useState(false)

  const start = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    const id = navigator.geolocation.watchPosition(pos => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      sendLocation(rideId, lat, lng)
    }, err => { console.error('geolocation error', err) }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 })
    watchIdRef.current = id
    setRunning(true)
  }

  const stop = () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    setRunning(false)
  }

  useEffect(()=> {
    return ()=> { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current) }
  },[])

  return (
    <div className="mt-2">
      {running ? (
        <button onClick={stop} className="px-3 py-1 rounded border text-sm bg-red-500 text-white">Stop Live Tracking</button>
      ) : (
        <button onClick={start} className="px-3 py-1 rounded border text-sm btn-primary">Start Live Tracking</button>
      )}
    </div>
  )
}
