/**
 * Vercel Serverless — Better Auth catch-all handler
 * Handles all /api/auth/* routes
 *
 * IMPORTANT: bodyParser must be disabled so Better Auth can parse the body itself
 */

import { toNodeHandler } from "better-auth/node"
import { auth } from "../../src/api/auth-server"

// Disable Vercel's automatic body parsing — Better Auth handles this itself
export const config = {
  api: {
    bodyParser: false,
  },
}

export default toNodeHandler(auth.handler)
