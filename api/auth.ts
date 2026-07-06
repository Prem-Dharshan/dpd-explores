/**
 * Vercel Serverless — Better Auth handler
 *
 * Vercel's plain /api directory does not support multi-segment catch-all
 * filenames ([...all].ts matches exactly one segment), so vercel.json
 * rewrites /api/auth/:path* to this single function. We adapt the Node
 * req/res to a Web Request for auth.handler directly instead of using
 * toNodeHandler, because Vercel's Node helpers consume the body stream.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { auth } from "../src/api/auth-server.js"

function resolveUrl(req: VercelRequest): URL {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https"
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost"
  const url = new URL(req.url || "/", `${proto}://${host}`)

  // If the rewrite collapsed the path to /api/auth, recover the original
  // sub-path from the :path* query param Vercel appends
  if (url.pathname === "/api/auth" || url.pathname === "/api/auth/") {
    const sub = url.searchParams.get("path")
    if (sub) {
      url.pathname = `/api/auth/${sub}`
      url.searchParams.delete("path")
    }
  }
  return url
}

async function toWebRequest(req: VercelRequest): Promise<Request> {
  const url = resolveUrl(req)
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value)
    else if (Array.isArray(value)) value.forEach((v) => headers.append(key, v))
  }

  let body: string | undefined
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (typeof req.body === "string") body = req.body
    else if (Buffer.isBuffer(req.body)) body = req.body.toString("utf8")
    else if (req.body !== undefined && req.body !== null) body = JSON.stringify(req.body)
  }

  return new Request(url, { method: req.method, headers, body })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await auth.handler(await toWebRequest(req))

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value)
    })
    const cookies = response.headers.getSetCookie()
    if (cookies.length > 0) res.setHeader("set-cookie", cookies)

    const text = await response.text()
    res.end(text)
  } catch (e) {
    console.error("[/api/auth]", e)
    res.statusCode = 500
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({ error: "Internal auth error" }))
  }
}
