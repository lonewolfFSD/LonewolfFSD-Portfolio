import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      "/v0/b/lonewolffsd-15f1f": {
        target: "https://firebasestorage.googleapis.com",
        changeOrigin: true,
        secure: false,
      },
    },
  }
});
