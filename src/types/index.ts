/**
 * DPD Explores - Shared Types
 */

// ─── AUTHENTICATION ─────────────────────────────────────────
export interface User {
  id: string
  email: string
  name?: string
  image?: string
}

// ─── PLACES ────────────────────────────────────────────────
export interface Place {
  id: string
  user_id: string

  // Identity
  name: string
  gmaps_url?: string
  place_id?: string
  source: "csv" | "manual" | "instagram"

  // Location
  address?: string
  city?: string
  area?: string
  lat?: number
  lng?: number

  // Classification
  place_type?:
    | "restaurant"
    | "cafe"
    | "bar"
    | "bakery"
    | "dhaba"
    | "food_truck"
    | "fine_dining"
    | "explore_spot"
    | "other"
  cuisine_type?: string
  cuisine_tags: string[]
  diet_type: "veg" | "nonveg" | "both"
  alcohol_served: "yes" | "no" | "byob" | "unknown"
  price_range?: "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹"
  budget_per_person_min?: number
  budget_per_person_max?: number

  // Personal notes
  notes?: string
  comment?: string

  // Curated content
  signature_dishes: string[]
  best_dishes: string[]
  dishes_to_avoid: string[]
  must_try?: string
  menu_link?: string
  instagram_handle?: string

  // Occasion & Vibe
  occasion: Array<
    "date" | "family" | "friends" | "solo" | "business" | "celebration" | "quick_bite"
  >
  best_for_time: Array<
    | "breakfast"
    | "brunch"
    | "lunch"
    | "snack"
    | "dinner"
    | "late_night"
    | "early_morning"
  >
  ambience: Array<
    "rooftop" | "cozy" | "loud" | "quiet" | "outdoor" | "live_music" | "indoor"
  >
  vibe: Array<
    "romantic" | "lively" | "chill" | "instagrammable" | "old_school" | "hidden_gem" | "touristy"
  >

  // Practical
  accepts_reservations?: boolean
  reservation_link?: string
  opening_hours?: Record<string, unknown>
  phone_number?: string

  // Photos (Google Maps photo references)
  photo_references: string[]

  // Visit status
  visited: boolean
  visited_count: number
  first_visited_at?: string
  last_visited_at?: string
  would_return?: boolean
  wishlist_priority: "high" | "medium" | "low"

  // State
  categorized: boolean
  held_for_review: boolean
  active: boolean

  created_at: string
  updated_at: string
}

// ─── PLACE (from CSV before enrichment) ──────────────────
export interface RawPlace {
  name: string
  notes?: string
  gmaps_url?: string
  comment?: string
}

// ─── PLACE CATEGORIZATION (AI response) ─────────────────
export interface PlaceCategorization {
  cuisine_type: string
  cuisine_tags: string[]
  diet_type: "veg" | "nonveg" | "both"
  alcohol_served: "yes" | "no" | "byob" | "unknown"
  place_type:
    | "restaurant"
    | "cafe"
    | "bar"
    | "bakery"
    | "dhaba"
    | "food_truck"
    | "fine_dining"
    | "explore_spot"
    | "other"
  occasion: string[]
  best_for_time: string[]
  ambience: string[]
  vibe: string[]
  signature_dishes: string[]
  must_try?: string
  wishlist_priority: "high" | "medium" | "low"
  confidence: number
}

// ─── LISTS ────────────────────────────────────────────────
export interface List {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
}

// ─── REVIEWS ──────────────────────────────────────────────
export interface Review {
  id: string
  place_id: string
  user_id: string
  visited_at?: string
  bill_amount?: number
  visited_with?: "solo" | "partner" | "family" | "friends"
  notes?: string
  created_at: string
}

// ─── RATINGS ──────────────────────────────────────────────
export interface Rating {
  id: string
  review_id: string
  category: string
  score: number
}

// ─── TAGS ────────────────────────────────────────────────
export interface Tag {
  id: string
  place_id: string
  tag: string
}

// ─── FILTER STATE (from URL params) ─────────────────────
export interface FilterState {
  search?: string
  cities?: string[]
  areas?: string[]
  place_types?: string[]
  cuisines?: string[]
  diet?: "all" | "veg" | "nonveg" | "both"
  alcohol?: "any" | "yes" | "no" | "byob"
  visited?: "all" | "visited" | "wishlist"
  would_return?: boolean
  wishlist_priority?: string[]
  occasions?: string[]
  best_for_time?: string[]
  vibes?: string[]
  ambience?: string[]
  price_ranges?: string[]
  budget_min?: number
  budget_max?: number
  rating_min?: number
  source?: string[]
  has_photos?: boolean
  has_reviews?: boolean
}

// ─── SORT OPTIONS ──────────────────────────────────────
export type SortOption =
  | "recently_added"
  | "recently_visited"
  | "highest_rated"
  | "wishlist_priority"
  | "name_asc"
  | "budget_low_high"
  | "budget_high_low"

// ─── GOOGLE MAPS PLACES API RESPONSE ────────────────────
export interface PlacesAPIResponse {
  displayName?: {
    text?: string
  }
  formattedAddress?: string
  location?: {
    latitude: number
    longitude: number
  }
  internationalPhoneNumber?: string
  regularOpeningHours?: Record<string, unknown>
  priceLevel?: string
  photos?: Array<{
    name: string
  }>
  primaryTypeDisplayName?: {
    text?: string
  }
  addressComponents?: Array<{
    longText: string
    shortText: string
    types: string[]
  }>
  websiteUri?: string
}
