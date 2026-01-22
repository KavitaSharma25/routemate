import React from 'react'
import './ConfirmDialog.css'

let showDialogCallback = null

export const useConfirmDialog = () => {
  return {
    showDialog: (options) => {
      return new Promise((resolve) => {
        if (showDialogCallback) {
          showDialogCallback(options, resolve)
        } else {
          resolve(false)
        }
      })
    }
  }
}

const ConfirmDialog = () => {
  const [dialog, setDialog] = React.useState(null)

  React.useEffect(() => {
    showDialogCallback = (options, resolve) => {
      setDialog({ ...options, resolve })
    }
    
    return () => {
      showDialogCallback = null
    }
  }, [])

  const handleConfirm = () => {
    if (dialog?.resolve) {
      dialog.resolve(true)
    }
    setDialog(null)
  }

  const handleCancel = () => {
    if (dialog?.resolve) {
      dialog.resolve(false)
    }
    setDialog(null)
  }

  if (!dialog) return null

  const {
    title = 'Confirm Action',
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    type = 'info' // info, warning, error, success
  } = dialog

  return (
    <div className="confirm-dialog-overlay" onClick={handleCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-dialog-header ${type}`}>
          <div className="confirm-dialog-icon">
            {type === 'warning' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {type === 'error' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {type === 'success' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {type === 'info' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        
        <div className="confirm-dialog-footer">
          <button 
            className="confirm-dialog-btn cancel-btn" 
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-btn confirm-btn ${type}`}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
