"use strict"

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { toNodeHandler } from 'better-auth/node'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }

  return {
    server: { strictPort: true },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server',
        async configureServer(server) {
          // ── Better Auth ────────────────────────────────────
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/auth')) {
              try {
                const { auth } = await server.ssrLoadModule('/src/api/auth-server.ts')
                const handler = toNodeHandler(auth)
                await handler(req, res)
              } catch (e) {
                console.error('Better Auth Error:', e)
                res.statusCode = 500
                res.end(e?.toString() || 'Internal Server Error')
              }
            } else {
              next()
            }
          })

          // ── Custom API routes (Groq, GMaps) ───────────────
          const { registerApiHandlers } = await server.ssrLoadModule('/src/api/vite-handlers.ts')
          registerApiHandlers(server)
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
