/**
 * Vercel Serverless — Better Auth catch-all handler
 * Handles all /api/auth/* routes
 */

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { toNodeHandler } from "better-auth/node"

// Lazy import to avoid cold-start issues with pg pool
let _handler: ReturnType<typeof toNodeHandler> | null = null

async function getHandler() {
  if (!_handler) {
    const { auth } = await import("../../src/api/auth-server")
    _handler = toNodeHandler(auth)
  }
  return _handler
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const h = await getHandler()
  return h(req as never, res as never)
}
