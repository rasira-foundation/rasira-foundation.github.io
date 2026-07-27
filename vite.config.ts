import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed from the "rasira-foundation" repo (not the special
// "<org>.github.io" repo), so GitHub Pages serves it at a subpath:
// https://rasira-foundation.github.io/rasira-foundation/
export default defineConfig({
  base: '/rasira-foundation/',
  plugins: [react()],
})
