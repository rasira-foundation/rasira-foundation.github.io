import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// rasira-foundation.github.io is an organization root page, served at "/"
export default defineConfig({
  base: '/',
  plugins: [react()],
})
