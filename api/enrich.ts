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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const apiKey = process.env.GMAPS_API_KEY
  if (!apiKey) return res.status(500).json({ error: "GMAPS_API_KEY not configured" })

  const { placeId, name } = req.body || {}

  try {
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
          "X-Goog-FieldMask": FIELDS,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textQuery: name, regionCode: "IN" }),
      })
      if (r.ok) {
        const d = await r.json() as { places?: unknown[] }
        placeData = d.places?.[0] || null
      }
    }

    return res.status(200).json(placeData || {})
  } catch (e) {
    console.error("[/api/enrich]", e)
    return res.status(500).json({ error: String(e) })
  }
}
