/**
 * API Route: Enrich Place
 * Fetches place details from Google Maps Places API
 *
 * Deploy to: api/enrich-place.ts (for Vercel)
 *
 * Example for Vercel:
 * ```typescript
 * import type { VercelRequest, VercelResponse } from "@vercel/node"
 * import { enrichPlace } from "@/api/enrich-place"
 *
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   if (req.method !== "POST") {
 *     return res.status(405).json({ error: "Method not allowed" })
 *   }
 *
 *   try {
 *     const result = await enrichPlace(req.body)
 *     return res.status(200).json(result)
 *   } catch (error) {
 *     return res.status(500).json({ error: error.message })
 *   }
 * }
 * ```
 */

const FIELDS = [
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

export async function enrichPlace(body: {
  placeId: string
  place?: unknown
}) {
  const { placeId } = body

  if (!placeId) {
    throw new Error("placeId is required")
  }

  const apiKey = process.env.GMAPS_API_KEY
  if (!apiKey) {
    throw new Error("GMAPS_API_KEY not configured")
  }

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=${FIELDS}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELDS,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Places API error: ${res.statusText}`)
  }

  return await res.json()
}