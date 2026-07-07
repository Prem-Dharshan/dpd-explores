/**
 * Shared place taxonomy — food spots AND experiences.
 * DPD Explores covers everything worth going out for.
 */

export const PLACE_TYPES = [
  // Food & drink
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "dessert",
  "dhaba",
  "food_truck",
  "fine_dining",
  // Experiences
  "adventure",
  "gaming",
  "nature",
  "beach",
  "trek",
  "park",
  "museum",
  "arts_culture",
  "heritage",
  "viewpoint",
  "nightlife",
  "shopping",
  "wellness",
  "stay",
  "explore_spot",
  "other",
] as const

export const FOOD_PLACE_TYPES = [
  "restaurant", "cafe", "bar", "bakery", "dessert", "dhaba", "food_truck", "fine_dining",
] as const

export const OCCASIONS = [
  "date", "family", "friends", "solo", "business", "celebration", "quick_bite",
] as const

export const BEST_FOR_TIMES = [
  "breakfast", "brunch", "lunch", "snack", "dinner", "late_night", "early_morning",
] as const

export const AMBIENCE_TAGS = [
  "rooftop", "cozy", "loud", "quiet", "outdoor", "live_music", "indoor",
] as const

export const VIBE_TAGS = [
  "romantic", "lively", "chill", "instagrammable", "old_school", "hidden_gem", "touristy",
] as const

export const PRICE_RANGES = ["₹", "₹₹", "₹₹₹", "₹₹₹₹"] as const

export const DIET_TYPES = ["veg", "nonveg", "both"] as const

export const WISHLIST_PRIORITIES = ["high", "medium", "low"] as const

export function labelize(value: string): string {
  return value.replace(/_/g, " ")
}
