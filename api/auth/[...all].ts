/**
 * Vercel Serverless — Better Auth catch-all handler
 */

import { toNodeHandler } from "better-auth/node"
import { auth } from "../../src/api/auth-server.js"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default toNodeHandler(auth.handler)
