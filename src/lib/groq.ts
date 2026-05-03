/**
 * Groq AI API helper functions
 * For categorization and mood recommendations
 */

import type { PlaceCategorization, Place } from "@/types"

/** Strip markdown code fences the model sometimes wraps JSON in */
function stripJsonFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim()
}

/**
 * Categorize a place — calls our Vite SSR API route (keeps GROQ_API_KEY server-side)
 */
export async function categorizePlace(placeData: {
  name: string
  address?: string
  place_type?: string
  notes?: string
  comment?: string
}): Promise<PlaceCategorization> {
  const res = await fetch("/api/categorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(placeData),
  })
  if (!res.ok) throw new Error("Failed to categorize place")
  return res.json()
}

/**
 * Get mood-based recommendations — calls our Vite SSR API route
 */
export async function getMoodRecommendation(
  moodPrompt: string,
  places: Place[]
): Promise<string[]> {
  const res = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moodPrompt, places }),
  })
  if (!res.ok) throw new Error("Failed to get recommendations")
  const data = await res.json()
  return data.placeIds || []
}

/**
 * Server-side: Call Groq for place categorization
 * Used by Vite SSR middleware
 */
export async function categorizePlaceWithGroq(placeData: {
  name: string
  address?: string
  place_type?: string
  notes?: string
  comment?: string
}): Promise<PlaceCategorization> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("Missing GROQ_API_KEY")

  const prompt = `You are a food and places expert in India, especially familiar with Chennai, Mumbai, Delhi, Bangalore.

Given this place:
Name: ${placeData.name}
Address: ${placeData.address || "Unknown"}
Place Type: ${placeData.place_type || "Unknown"}
User Notes: ${placeData.notes || "None"}
User Comment: ${placeData.comment || "None"}

Return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "cuisine_type": "string",
  "cuisine_tags": ["string"],
  "diet_type": "veg | nonveg | both",
  "alcohol_served": "yes | no | byob | unknown",
  "place_type": "restaurant | cafe | bar | bakery | dhaba | food_truck | fine_dining | explore_spot | other",
  "occasion": ["date", "family", "friends", "solo", "business", "celebration", "quick_bite"],
  "best_for_time": ["breakfast", "brunch", "lunch", "snack", "dinner", "late_night", "early_morning"],
  "ambience": ["rooftop", "cozy", "loud", "quiet", "outdoor", "live_music", "indoor"],
  "vibe": ["romantic", "lively", "chill", "instagrammable", "old_school", "hidden_gem", "touristy"],
  "signature_dishes": ["string"],
  "must_try": "string or empty",
  "wishlist_priority": "high | medium | low",
  "confidence": 0.0
}

Only include values you are confident about. Use empty arrays for unknown fields.`

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.statusText}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty Groq response")
  return JSON.parse(stripJsonFences(content))
}

/**
 * Server-side: Mood recommendation with Groq
 */
export async function getMoodRecommendationWithGroq(
  moodPrompt: string,
  places: Place[]
): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("Missing GROQ_API_KEY")

  const placesContext = places.map((p) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    area: p.area,
    cuisine_type: p.cuisine_type,
    diet_type: p.diet_type,
    price_range: p.price_range,
    budget_per_person_max: p.budget_per_person_max,
    vibe: p.vibe,
    occasion: p.occasion,
    ambience: p.ambience,
    visited: p.visited,
    must_try: p.must_try,
  }))

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: `You are a personal restaurant recommender in India. Based on the user's mood, return the top 5 place IDs that best match.
Return ONLY a JSON array of place IDs: ["uuid1", "uuid2", ...]
Do not explain. Only return the array.

Available places:
${JSON.stringify(placesContext, null, 2)}

User request: ${moodPrompt}`,
        },
      ],
      temperature: 0.7,
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.statusText}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty Groq response")
  return JSON.parse(stripJsonFences(content))
}
