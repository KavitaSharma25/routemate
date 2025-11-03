import React, { useState } from 'react'
import { useNotifications } from '../context/NotificationContext'
import RazorpayCheckout from './RazorpayCheckout'

export default function Notifications(){
  const { notifications, markRead } = useNotifications()
  const [payingNote, setPayingNote] = useState(null)

  if (!notifications) return null

  return (
    <div className="relative">
      <button className="px-2 py-1 rounded" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
        🔔 {notifications.filter(n=>!n.read).length}
      </button>
      <div className="absolute right-0 mt-2 w-80 shadow p-3 rounded-lg z-50" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {notifications.length===0 && <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications</div>}
        {notifications.map(n=> (
          <div key={n._id} className={`p-2 mb-2 rounded`} style={{ backgroundColor: n.read ? 'var(--bg-secondary)' : 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</div>
            {n.metadata && n.metadata.order && n.metadata.keyId && (
              <div className="mt-2">
                <RazorpayCheckout order={n.metadata.order} keyId={n.metadata.keyId} prefill={{}} onSuccess={(resp)=>{
                  // include bookingId in body if present
                  const body = { ...resp }
                  if (n.metadata.bookingId) body.bookingId = n.metadata.bookingId
                  // POST to verify endpoint
                  fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(body) })
                    .then(r=>r.json()).then(()=>{ markRead(n._id) }).catch(e=>console.error(e))
                }} onError={(e)=>console.error(e)} />
              </div>
            )}
            <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
