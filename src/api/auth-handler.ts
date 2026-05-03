/**
 * API Route: Auth Handler
 * Better Auth HTTP handler for Vercel Functions / Node.js backend
 * 
 * Deploy to: /api/auth/[...all].ts (for Vercel)
 * or use with a separate backend server
 */

import { auth } from "./auth-server"

/**
 * This handler should be deployed as a Vercel Function or similar
 * Example for Vercel (pages/api/auth/[...auth].ts):
 * 
 * import { auth } from "@/api/auth-server"
 * import type { NextRequest } from "next/server"
 * 
 * export async function GET(request: NextRequest) {
 *   return auth.toJSON()(request)
 * }
 * 
 * export async function POST(request: NextRequest) {
 *   return auth.toJSON()(request)
 * }
 */

export { auth }
