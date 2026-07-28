import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// rasira-foundation.github.io is an organization root page, served at "/"
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Fail loudly instead of silently drifting to 5174/5175
  },
})
