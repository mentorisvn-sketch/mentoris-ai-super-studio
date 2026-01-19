
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // SECURITY FIX: Removed 'define' block.
  // Never expose process.env.GEMINI_API_KEY or API_KEY to the client via Vite config.
  // Access strict environment variables using import.meta.env.VITE_* for public keys only.
})
