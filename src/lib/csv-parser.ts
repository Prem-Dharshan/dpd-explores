/**
 * CSV Parser Utilities
 * Parse Google Maps Takeout format and extract place data
 */

import Papa from "papaparse"
import type { RawPlace } from "@/types"

export interface CSVRow {
  Title: string
  Note: string
  URL: string
  Tags: string
  Comment: string
}

/**
 * Parse CSV file and extract place data
 */
export function parseCSV(file: File): Promise<RawPlace[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const places: RawPlace[] = results.data
            .map((row: CSVRow) => ({
              name: row.Title?.trim() || "",
              notes: row.Note?.trim() || undefined,
              gmaps_url: row.URL?.trim() || undefined,
              comment: row.Comment?.trim() || undefined,
            }))
            .filter((place) => place.name) // Only include rows with a name

          resolve(places)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`))
      },
    })
  })
}

/**
 * Extract Place ID from Google Maps URL
 * Format: /maps/place/Name/data=!4m2!3m1!1s0x...:0x...
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  if (!url) return null

  // Try to match the CID format: 0x...:0x...
  const match = url.match(/!1s([^!&]+)/i)
  if (match) return match[1]

  return null
}

/**
 * Validate raw place data
 */
export function validatePlace(place: RawPlace): string[] {
  const errors: string[] = []

  if (!place.name) {
    errors.push("Place name is required")
  }

  if (place.name && place.name.length > 255) {
    errors.push("Place name must be less than 255 characters")
  }

  return errors
}
