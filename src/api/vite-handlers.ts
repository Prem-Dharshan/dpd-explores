/**
 * Vite SSR API Handlers
 * Mounted in vite.config.ts configureServer
 * Handles /api/categorize, /api/recommend, /api/enrich
 */

import type { ViteDevServer } from "vite"
import type { IncomingMessage, ServerResponse } from "http"

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => (body += chunk.toString()))
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"))
      } catch {
        resolve({})
      }
    })
    req.on("error", reject)
  })
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(data))
}

const FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "internationalPhoneNumber",
  "regularOpeningHours",
  "priceLevel",
  "photos",
  "primaryTypeDisplayName",
  "addressComponents",
  "websiteUri",
].join(",")

const ALLOWED_MAPS_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "google.com",
  "maps.google.com",
])

function isValidMapsUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr)
    return ALLOWED_MAPS_HOSTS.has(u.hostname) && (u.protocol === "https:" || u.protocol === "http:")
  } catch {
    return false
  }
}

export function registerApiHandlers(server: ViteDevServer) {
  server.middlewares.use(async (req, res, next) => {
    const url = req.url?.split("?")[0]

    // ── POST /api/categorize ─────────────────────────────────
    if (url === "/api/categorize" && req.method === "POST") {
      try {
        const body = await readBody(req) as {
          name: string; address?: string; place_type?: string; notes?: string; comment?: string
        }
        const { categorizePlaceWithGroq } = await server.ssrLoadModule("/src/lib/groq.ts")
        const result = await categorizePlaceWithGroq(body)
        return json(res, 200, result)
      } catch (e) {
        console.error("[/api/categorize]", e)
        return json(res, 500, { error: String(e) })
      }
    }

    // ── POST /api/recommend ──────────────────────────────────
    if (url === "/api/recommend" && req.method === "POST") {
      try {
        const body = await readBody(req) as { moodPrompt: string; places: unknown[] }
        const { getMoodRecommendationWithGroq } = await server.ssrLoadModule("/src/lib/groq.ts")
        const placeIds = await getMoodRecommendationWithGroq(body.moodPrompt, body.places as never)
        return json(res, 200, { placeIds })
      } catch (e) {
        console.error("[/api/recommend]", e)
        return json(res, 500, { error: String(e) })
      }
    }

    // ── POST /api/enrich ─────────────────────────────────────
    if (url === "/api/enrich" && req.method === "POST") {
      try {
        const body = await readBody(req) as { placeId?: string; name?: string; url?: string }
        const apiKey = process.env.GMAPS_API_KEY
        if (!apiKey) return json(res, 500, { error: "GMAPS_API_KEY not configured" })

        let coords: { latitude: number; longitude: number } | null = null

        // A pasted Google Maps link: expand short links + parse lookup keys
        if (body.url) {
          let expanded = body.url.trim()
          for (let i = 0; i < 5; i++) {
            if (!isValidMapsUrl(expanded)) {
              throw new Error("Invalid URL hostname in redirect chain")
            }
            const r = await fetch(expanded, { method: "GET", redirect: "manual" })
            const loc = r.headers.get("location")
            if (!loc) break
            expanded = new URL(loc, expanded).toString()
          }
          const nameMatch = expanded.match(/\/maps\/place\/([^/@?]+)/)
          const coordMatch = expanded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          const pidMatch =
            expanded.match(/query_place_id=([^&]+)/) ||
            expanded.match(/!19s(ChIJ[^!?&/]+)/) ||
            expanded.match(/\bplace_id:([^&!?/]+)/)
          body.placeId = body.placeId || (pidMatch ? pidMatch[1] : undefined)
          body.name = body.name || (nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, " ")) : undefined)
          coords = coordMatch ? { latitude: +coordMatch[1], longitude: +coordMatch[2] } : null
          if (!body.placeId && !body.name) {
            return json(res, 400, { error: "Couldn't read a place from that link" })
          }
        }

        let placeData: unknown = null

        if (body.placeId) {
          // Fetch by Place ID
          const r = await fetch(
            `https://places.googleapis.com/v1/places/${body.placeId}`,
            {
              headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": FIELDS,
              },
            }
          )
          if (r.ok) placeData = await r.json()
        }

        if (!placeData && body.name) {
          // Fallback: search by name
          const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
              "X-Goog-Api-Key": apiKey,
              // searchText requires fields prefixed with "places."
              "X-Goog-FieldMask": FIELDS.split(",").map((f) => `places.${f}`).join(","),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              textQuery: body.name,
              regionCode: "IN",
              ...(coords && { locationBias: { circle: { center: coords, radius: 5000 } } }),
            }),
          })
          if (r.ok) {
            const d = await r.json() as { places?: unknown[] }
            placeData = d.places?.[0] || null
          }
        }

        return json(res, 200, placeData || {})
      } catch (e) {
        console.error("[/api/enrich]", e)
        if (e instanceof Error && e.message === "Invalid URL hostname in redirect chain") {
          return json(res, 400, { error: "Invalid Maps URL" })
        }
        return json(res, 500, { error: "An error occurred" })
      }
    }

    next()
  })
}
