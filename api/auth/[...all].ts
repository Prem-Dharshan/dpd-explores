/**
 * Vercel Serverless — Better Auth catch-all handler
 */

import { toNodeHandler } from "better-auth/node"
import { auth } from "../../src/api/auth-server"
import type { VercelRequest, VercelResponse } from "@vercel/node"

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = toNodeHandler(auth.handler)

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    return handler(req as any, res as any)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
      error: "Auth handler failed", 
      message: String(error),
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        vercelUrl: process.env.VERCEL_URL,
        betterAuthUrl: process.env.BETTER_AUTH_URL
      }
    })
  }
}
