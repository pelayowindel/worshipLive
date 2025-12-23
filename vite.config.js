import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'WorshipLive',
        short_name: 'WorshipLive',
        description: 'Display beautiful lyrics with stunning backgrounds. Manage your song library, create service playlists, and present on multiple screens.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-48x48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        navigateFallback: '/index.html'
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
