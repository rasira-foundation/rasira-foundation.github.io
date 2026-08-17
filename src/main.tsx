import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* The `pre-mount` class set in index.html is NOT cleared here.
 *
 * It used to be, two frames after this render — but React mounting and the
 * splash finishing are different moments. The splash stays on screen for
 * its full run, so clearing on mount flipped <html> to the page colour
 * while the splash was still showing its own gradient. Anything the fixed
 * splash does not cover then shows the wrong colour: on iOS Safari that is
 * the strip behind the collapsing toolbar, which appeared as a pale band
 * under the splash.
 *
 * App.tsx now clears it when the splash actually ends, so the canvas
 * matches the splash for exactly as long as the splash is up. */
