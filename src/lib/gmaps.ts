/**
 * Google Maps Places API (New) helper functions
 */

const GMAPS_API_KEY = import.meta.env.VITE_GMAPS_API_KEY

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

export interface PlacesAPIResponse {
  displayName?: { text?: string }
  formattedAddress?: string
  location?: {
    latitude: number
    longitude: number
  }
  internationalPhoneNumber?: string
  regularOpeningHours?: Record<string, unknown>
  priceLevel?: string
  photos?: Array<{ name: string }>
  primaryTypeDisplayName?: { text?: string }
  addressComponents?: Array<{
    longText: string
    shortText: string
    types: string[]
  }>
  websiteUri?: string
}

/**
 * Extract Place ID from Google Maps URL
 * Format: /maps/place/Name/data=!4m2!3m1!1s0x...:0x...
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  if (!url) return null
  const match = url.match(/!1s([^:!]+:[^!]+)/)
  return match ? match[1] : null
}

/**
 * Fetch place details from Google Maps Places API (New)
 * NOTE: This must be called from a server-side API route, not from the client
 */
export async function fetchPlaceDetails(placeId: string): Promise<PlacesAPIResponse> {
  if (!GMAPS_API_KEY) {
    throw new Error("Missing VITE_GMAPS_API_KEY in .env")
  }

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=${FIELDS}`,
    {
      headers: {
        "X-Goog-Api-Key": GMAPS_API_KEY,
        "X-Goog-FieldMask": FIELDS,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Places API error: ${res.statusText}`)
  }

  return res.json()
}

/**
 * Search for a place by text + location bias
 * NOTE: This must be called from a server-side API route
 */
export async function searchPlace(
  query: string,
  locationBias?: { latitude: number; longitude: number }
): Promise<PlacesAPIResponse[]> {
  if (!GMAPS_API_KEY) {
    throw new Error("Missing VITE_GMAPS_API_KEY in .env")
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": GMAPS_API_KEY,
      "X-Goog-FieldMask": FIELDS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      textQuery: query,
      ...(locationBias && {
        locationBias: {
          circle: {
            center: locationBias,
            radius: 50000, // 50km radius
          },
        },
      }),
    }),
  })

  if (!res.ok) {
    throw new Error(`Places API error: ${res.statusText}`)
  }

  const data = await res.json()
  return data.places || []
}

/**
 * Best available Google Maps link for a place:
 * saved Takeout URL > place_id deep link > name search
 */
export function getGmapsUrl(place: { gmaps_url?: string; place_id?: string; name: string }): string {
  if (place.gmaps_url) return place.gmaps_url
  if (place.place_id) return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`
}

/**
 * Construct photo URL from Places API photo reference
 * Can be called from client-side (rendering only)
 */
export function getPhotoUrl(photoReference: string, maxWidth = 400): string {
  if (!GMAPS_API_KEY) {
    console.warn("Missing VITE_GMAPS_API_KEY")
    return ""
  }

  return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${GMAPS_API_KEY}`
}
