/**
 * Vercel Serverless — Groq categorization
 * POST /api/categorize
 */

import type { VercelRequest, VercelResponse } from "@vercel/node"

function stripJsonFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" })

  const { name, address, place_type, notes, comment } = req.body || {}
  if (!name) return res.status(400).json({ error: "name is required" })

  const systemPrompt = `You are an expert on places and experiences in India — restaurants and cafes, but also adventure activities, gaming arcades, nature spots, beaches, treks, museums, heritage sites, nightlife, shopping and wellness. Especially familiar with Chennai, Coimbatore, Mumbai, Delhi, Bangalore.

Return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "cuisine_type": "string (empty for non-food places)",
  "cuisine_tags": ["string"],
  "diet_type": "veg | nonveg | both",
  "alcohol_served": "yes | no | byob | unknown",
  "place_type": "restaurant | cafe | bar | bakery | dessert | dhaba | food_truck | fine_dining | adventure | gaming | nature | beach | trek | park | museum | arts_culture | heritage | viewpoint | nightlife | shopping | wellness | stay | explore_spot | other",
  "occasion": ["date", "family", "friends", "solo", "business", "celebration", "quick_bite"],
  "best_for_time": ["breakfast", "brunch", "lunch", "snack", "dinner", "late_night", "early_morning"],
  "ambience": ["rooftop", "cozy", "loud", "quiet", "outdoor", "live_music", "indoor"],
  "vibe": ["romantic", "lively", "chill", "instagrammable", "old_school", "hidden_gem", "touristy"],
  "signature_dishes": ["string (empty for non-food places)"],
  "must_try": "string or empty (for experiences: the highlight activity)",
  "wishlist_priority": "high | medium | low",
  "confidence": 0.0
}

For non-food places (treks, museums, arcades...) leave cuisine fields and signature_dishes empty and pick the right place_type. Only include values you are confident about. Use empty arrays for unknown fields.`

  const userPrompt = `Given this place:
Name: ${name}
Address: ${address || "Unknown"}
Place Type: ${place_type || "Unknown"}
User Notes: ${notes || "None"}
User Comment: ${comment || "None"}`

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
      }),
    })
    if (!r.ok) throw new Error(`Groq error: ${r.statusText}`)
    const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("Empty Groq response")
    return res.status(200).json(JSON.parse(stripJsonFences(content)))
  } catch (e) {
    console.error("[/api/categorize]", e)
    return res.status(500).json({ error: "An error occurred" })
  }
}
