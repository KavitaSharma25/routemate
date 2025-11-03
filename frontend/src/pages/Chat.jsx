import React from 'react'
import { useParams } from 'react-router-dom'
import { ChatProvider, useChat } from '../context/ChatContext'
import ChatBox from '../components/ChatBox'
import { useAuth } from '../context/AuthContext'
import MapComponent from '../components/MapComponent'

function ChatContent(){
  const { rideId } = useParams()
  const room = rideId ? `ride_${rideId}` : 'global'
  const { user } = useAuth() || {}
  const userId = user?.id || user?._id || localStorage.getItem('userId') || 'guest'
  const { liveLocations } = useChat() || {}
  const liveForThisRide = rideId ? liveLocations && liveLocations[rideId] : null

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>💬 Chat</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {rideId ? 'Communicate with your ride members' : 'Global community chat'}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Map Section (only for ride-specific chat) */}
        {rideId && (
          <div className="p-4 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              📍 Live Tracking
            </h3>
            <MapComponent apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} liveLocation={liveForThisRide} />
            {liveForThisRide ? (
              <div className="mt-3 p-3 rounded-lg bg-green-50">
                <p className="text-sm font-medium text-green-700">
                  🚗 Driver location is being tracked
                </p>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  ⏸️ Location tracking inactive
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chat Section */}
        <div className={rideId ? '' : 'lg:col-span-2'}>
          <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="p-4" style={{ background: 'linear-gradient(to right, var(--mahogany), var(--tobacco))' }}>
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--vanilla)' }}>
                💬 {rideId ? 'Ride Chat' : 'Global Chat'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--vanilla)', opacity: 0.9 }}>
                {rideId ? 'Private conversation with ride members' : 'Connect with the RouteMate community'}
              </p>
            </div>
            <ChatBox room={room} userId={userId} />
          </div>
        </div>
      </div>

      {/* Help Section */}
      {!rideId && (
        <div className="mt-6 rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>💡 Chat Tips</h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• Be respectful and courteous to other users</li>
            <li>• Use ride-specific chats for coordination</li>
            <li>• Report any inappropriate behavior to admins</li>
            <li>• Keep conversations relevant and helpful</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Chat(){
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  )
}
