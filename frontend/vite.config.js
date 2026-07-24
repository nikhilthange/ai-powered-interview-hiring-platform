import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            if (id.includes('docx') || id.includes('file-saver') || id.includes('react-to-print')) {
              return 'vendor-documents'
            }
            if (id.includes('emoji-mart') || id.includes('@emoji-mart')) {
              return 'vendor-emoji'
            }
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd'
            }
            if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('micromark') || id.includes('unist') || id.includes('hast') || id.includes('mdast')) {
              return 'vendor-markdown'
            }
            if (id.includes('date-fns')) {
              return 'vendor-date'
            }
            if (id.includes('socket.io') || id.includes('engine.io')) {
              return 'vendor-socket'
            }
            if (id.includes('axios')) {
              return 'vendor-axios'
            }
            return 'vendor-utils'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    target: 'es2020',
    modulePreload: {
      polyfill: false,
    },
    reportCompressedSize: false,
  },
})
 
 
 
 
 
 
