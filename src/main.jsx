import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'

// Skip Sentry init when no DSN is configured so local dev (and any
// environment that hasn't set the var) runs without it.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 0.1,
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Something went wrong. Refresh to try again.</div>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
)
