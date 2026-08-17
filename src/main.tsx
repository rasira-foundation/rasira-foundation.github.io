import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* Hands control of the page's ground back to the app.
 *
 * index.html paints the splash's own colour on <html> before the bundle
 * loads, so the first frame is never the page background. That class has to
 * come off once React has actually committed, or it would sit on top of the
 * real background for the whole session.
 *
 * Two rAFs, not one: the first fires before the browser has painted React's
 * initial commit, so clearing there can still expose a frame of page ground
 * between the critical CSS going away and the splash being painted — which
 * is the exact flash this exists to prevent. The second runs after that
 * paint, when the splash is genuinely on screen. */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('pre-mount')
  })
})
