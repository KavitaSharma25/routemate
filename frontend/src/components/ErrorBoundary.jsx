import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-2xl w-full p-8 rounded-xl border-2 border-red-500" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="text-center mb-6">
              <svg className="w-20 h-20 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Something went wrong
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                The application encountered an error
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="font-mono text-sm text-red-800 dark:text-red-400 break-all">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            
            <details className="mb-4">
              <summary className="cursor-pointer font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Error Details
              </summary>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs" style={{ color: 'var(--text-primary)' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[var(--mahogany)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
