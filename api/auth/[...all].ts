/**
 * Vercel Serverless — Better Auth catch-all handler
 * Handles all /api/auth/* routes
 *
 * Uses manual Node→Web conversion instead of toNodeHandler to avoid
 * Vercel's body parser interference and method-matching issues.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { auth } from "../../src/api/auth-server"

// Disable Vercel's automatic body parsing — Better Auth handles this itself
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Reconstruct full URL from the incoming request
    const proto = (req.headers["x-forwarded-proto"] as string) || "https"
    const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost:5173"
    const url = `${proto}://${host}${req.url}`

    // Buffer the request body
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
      req.on("end", resolve)
      req.on("error", reject)
    })
    const body = Buffer.concat(chunks)

    // Build headers (filter undefined values)
    const headers: Record<string, string> = {}
    for (const [k, v] of Object.entries(req.headers)) {
      if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(", ") : v
    }

    // Create a Web-standard Request for Better Auth
    const webRequest = new Request(url, {
      method: req.method ?? "GET",
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" && body.length > 0 ? body : undefined,
    })

    // Call Better Auth's handler
    const webResponse = await auth.handler(webRequest)

    // Forward response back to Vercel
    res.statusCode = webResponse.status
    webResponse.headers.forEach((value: string, key: string) => res.setHeader(key, value))
    res.end(Buffer.from(await webResponse.arrayBuffer()))
  } catch (e) {
    console.error("[auth/[...all]]", e)
    res.status(500).json({ error: "Internal server error" })
  }
}
