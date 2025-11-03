import React, { useState, useEffect } from 'react'
import './NotificationToast.css'

let addNotificationCallback = null

export const useNotification = () => {
  return {
    showNotification: (message, type = 'info', duration = 5000) => {
      if (addNotificationCallback) {
        addNotificationCallback(message, type, duration)
      }
    }
  }
}

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    addNotificationCallback = (message, type, duration) => {
      const id = Date.now()
      const notification = { id, message, type, duration }
      
      setNotifications(prev => [...prev, notification])
      
      // Auto remove after duration
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return () => {
      addNotificationCallback = null
    }
  }, [])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="notification-icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'error':
        return (
          <svg className="notification-icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'warning':
        return (
          <svg className="notification-icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'info':
      default:
        return (
          <svg className="notification-icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
    }
  }

  return (
    <div className="notification-container" aria-live="polite" aria-atomic="true">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification-toast notification-${notification.type}`}
          role="alert"
        >
          <div className="notification-icon">
            {getIcon(notification.type)}
          </div>
          <div className="notification-content">
            <p className="notification-message">{notification.message}</p>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast
