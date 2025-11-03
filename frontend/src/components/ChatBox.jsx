import React, { useEffect, useState } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

export default function ChatBox({room, userId}){
  const { messages, sendMessage, joinRoom, leaveRoom, connected, loadMessages, online } = useChat()
  const { user } = useAuth() || {}
  userId = userId || user?.id || user?._id || localStorage.getItem('userId') || 'guest'
  const [text, setText] = useState('')

  useEffect(()=>{
    if (room) joinRoom(room)
    // load historical messages for this ride/room
    if (room && typeof loadMessages === 'function') {
      loadMessages(room)
    }
    return ()=>{ if (room) leaveRoom(room) }
  },[room])

  const submit = (e) =>{
    e.preventDefault()
    if (!text) return
    const payload = { room, message: text, from: userId, createdAt: new Date() }
    sendMessage(payload)
    setText('')
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4 rounded shadow" style={{ backgroundColor: 'var(--bg-card)' }}>
      <div className="mb-2 flex justify-between items-center">
        <div style={{ color: 'var(--text-secondary)' }}>
          Status: <span style={{ color: connected ? '#22c55e' : '#ef4444' }}>{connected ? 'Online' : 'Offline'}</span>
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Online: {(online[room] && Object.keys(online[room]).length) || 0}
        </div>
      </div>
      <div className="mb-2">
        {online[room] && Object.entries(online[room]).map(([id,name])=> (
          <span key={id} className="inline-block px-2 py-1 mr-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{name || 'User'}</span>
        ))}
      </div>
      <div className="h-64 overflow-auto p-2 mb-2 rounded" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        {messages.filter(m=>m.room === room).map((m,idx)=> (
          <div 
            key={idx} 
            className={`p-2 mb-1 rounded max-w-[80%] ${String(m.from)===String(userId)? 'ml-auto text-right':'mr-auto'}`}
            style={{ backgroundColor: String(m.from)===String(userId) ? 'var(--mahogany)' : 'var(--tobacco)', color: 'var(--vanilla)' }}
          > 
            <div className="text-sm">{m.message}</div>
            <div className="text-xs" style={{ opacity: 0.8 }}>{new Date(m.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input 
          className="flex-1 p-2 rounded" 
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          value={text} 
          onChange={e=>setText(e.target.value)} 
          placeholder="Type a message" 
        />
        <button className="px-3 py-2 rounded btn-primary">Send</button>
      </form>
    </div>
  )
}
