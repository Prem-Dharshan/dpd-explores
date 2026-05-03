/**
 * Place Enrichment Service
 * Fetches place details from Google Maps Places API
 * NOTE: In production, these calls should be made from a backend API route
 */

import type { RawPlace, Place, PlacesAPIResponse } from "@/types"
import { extractPlaceIdFromUrl } from "@/lib/csv-parser"

const GMAPS_API_KEY = import.meta.env.VITE_GMAPS_API_KEY

/**
 * Convert PlacesAPI response to our Place format
 */
function mapPlacesAPIToPlace(
  rawPlace: RawPlace,
  apiResponse: PlacesAPIResponse,
  userId: string
): Partial<Place> {
  const photoReferences = apiResponse.photos?.map((p) => p.name) || []

  // Extract city from address components
  let city = ""
  if (apiResponse.addressComponents) {
    const cityComponent = apiResponse.addressComponents.find((c) =>
      c.types.includes("locality")
    )
    city = cityComponent?.longText || ""
  }

  // Map price level to price range
  const priceMap: Record<string, "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹"> = {
    PRICE_LEVEL_INEXPENSIVE: "₹",
    PRICE_LEVEL_MODERATE: "₹₹",
    PRICE_LEVEL_EXPENSIVE: "₹₹₹",
    PRICE_LEVEL_VERY_EXPENSIVE: "₹₹₹₹",
  }

  return {
    name: rawPlace.name,
    notes: rawPlace.notes,
    comment: rawPlace.comment,
    address: apiResponse.formattedAddress,
    city: city,
    lat: apiResponse.location?.latitude,
    lng: apiResponse.location?.longitude,
    phone_number: apiResponse.internationalPhoneNumber,
    opening_hours: apiResponse.regularOpeningHours,
    photo_references: photoReferences,
    price_range: apiResponse.priceLevel ? priceMap[apiResponse.priceLevel] : undefined,
    menu_link: apiResponse.websiteUri,
    user_id: userId,
  }
}

/**
 * Fetch place details from Google Maps Places API
 * This should be called from a backend API route in production
 */
export async function enrichPlaceFromAPI(
  place: RawPlace,
  userId: string
): Promise<{ enriched: Partial<Place>; error?: string }> {
  if (!GMAPS_API_KEY) {
    return {
      enriched: { ...place, user_id: userId },
      error: "GMAPS_API_KEY not configured",
    }
  }

  try {
    const placeId = extractPlaceIdFromUrl(place.gmaps_url || "")

    if (!placeId) {
      return {
        enriched: { ...place, user_id: userId },
        error: "Could not extract place ID from URL",
      }
    }

    // Call the backend API route instead of calling Google API directly
    const response = await fetch("/api/enrich-place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, place }),
    })

    if (!response.ok) {
      return {
        enriched: { ...place, user_id: userId },
        error: `API error: ${response.statusText}`,
      }
    }

    const apiResponse: PlacesAPIResponse = await response.json()
    const enriched = mapPlacesAPIToPlace(place, apiResponse, userId)

    return { enriched }
  } catch (error) {
    return {
      enriched: { ...place, user_id: userId },
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Enrich multiple places (for batch CSV import)
 */
export async function enrichPlacesBatch(
  places: RawPlace[],
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ enriched: Partial<Place>; error?: string }>> {
  const results: Array<{ enriched: Partial<Place>; error?: string }> = []

  for (let i = 0; i < places.length; i++) {
    const result = await enrichPlaceFromAPI(places[i], userId)
    results.push(result)

    onProgress?.(i + 1, places.length)

    // Add delay to avoid rate limiting
    if (i < places.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}
