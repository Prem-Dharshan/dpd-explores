/**
 * Vercel Serverless — Google Maps Place enrichment
 * POST /api/enrich
 */

import type { VercelRequest, VercelResponse } from "@vercel/node"

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

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol !== "http:" && url.protocol !== "https:") return false

    const hostname = url.hostname
    if (
      hostname === "maps.app.goo.gl" ||
      hostname === "google.com" ||
      hostname.endsWith(".google.com") ||
      /^((www|maps|consent)\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(hostname)
    ) {
      return true
    }
    return false
  } catch {
    return false
  }
}

/** Follow redirects (maps.app.goo.gl short links) to the full Maps URL */
async function expandUrl(url: string): Promise<string> {
  let current = url
  for (let i = 0; i < 5; i++) {
    if (!isAllowedUrl(current)) throw new Error("Invalid redirect URL")
    const r = await fetch(current, { method: "GET", redirect: "manual" })
    const loc = r.headers.get("location")
    if (!loc) break
    current = new URL(loc, current).toString()
  }
  if (!isAllowedUrl(current)) throw new Error("Invalid redirect URL")
  return current
}

/** Extract place name, coordinates, and place id from a Google Maps URL */
function parseGmapsUrl(url: string) {
  const nameMatch = url.match(/\/maps\/place\/([^/@?]+)/)
  const name = nameMatch
    ? decodeURIComponent(nameMatch[1].replace(/\+/g, " "))
    : null
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  const coords = coordMatch
    ? { latitude: +coordMatch[1], longitude: +coordMatch[2] }
    : null
  const pidMatch =
    url.match(/query_place_id=([^&]+)/) ||
    url.match(/!19s(ChIJ[^!?&/]+)/) ||
    url.match(/\bplace_id:([^&!?/]+)/)
  const placeId = pidMatch ? pidMatch[1] : null
  return { name, coords, placeId }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const apiKey = process.env.GMAPS_API_KEY
  if (!apiKey) return res.status(500).json({ error: "GMAPS_API_KEY not configured" })

  let { placeId, name } = req.body || {}
  const { url } = req.body || {}
  let coords: { latitude: number; longitude: number } | null = null

  try {
    // A pasted Google Maps link: expand + parse it for the best lookup keys
    if (url && typeof url === "string") {
      const expanded = await expandUrl(url.trim())
      const parsed = parseGmapsUrl(expanded)
      placeId = placeId || parsed.placeId
      name = name || parsed.name
      coords = parsed.coords
      if (!placeId && !name) {
        return res.status(400).json({ error: "Couldn't read a place from that link" })
      }
    }

    let placeData: unknown = null

    if (placeId) {
      const r = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": FIELDS,
          },
        }
      )
      if (r.ok) placeData = await r.json()
    }

    if (!placeData && name) {
      const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "X-Goog-Api-Key": apiKey,
          // searchText requires fields prefixed with "places."
          "X-Goog-FieldMask": FIELDS.split(",").map((f) => `places.${f}`).join(","),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textQuery: name,
          regionCode: "IN",
          ...(coords && {
            locationBias: { circle: { center: coords, radius: 5000 } },
          }),
        }),
      })
      if (r.ok) {
        const d = await r.json() as { places?: unknown[] }
        placeData = d.places?.[0] || null
      }
    }

    return res.status(200).json(placeData || {})
  } catch (e) {
    console.error("[/api/enrich]", e)
    return res.status(500).json({ error: "An error occurred" })
  }
}
