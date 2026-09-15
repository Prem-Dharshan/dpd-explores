/**
 * Vercel Serverless — Groq mood recommender
 * POST /api/recommend
 */

import type { VercelRequest, VercelResponse } from "@vercel/node"

function stripJsonFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" })

  const { moodPrompt, places } = req.body || {}
  if (!moodPrompt) return res.status(400).json({ error: "moodPrompt is required" })

  const placesContext = (places || []).map((p: Record<string, unknown>) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    area: p.area,
    cuisine_type: p.cuisine_type,
    diet_type: p.diet_type,
    price_range: p.price_range,
    vibe: p.vibe,
    occasion: p.occasion,
    ambience: p.ambience,
    visited: p.visited,
    must_try: p.must_try,
  }))

  try {
    const systemPrompt = `You are a personal recommender for places and experiences in India — food spots, adventures, nature, culture, nightlife and more. Based on the user's mood, return the top 5 place IDs that best match.
Return ONLY a JSON array of place IDs: ["uuid1", "uuid2", ...]
Do not explain. Only return the array.

Available places:
${JSON.stringify(placesContext, null, 2)}`

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User request: ${moodPrompt}` }
        ],
        temperature: 0.7,
      }),
    })
    if (!r.ok) throw new Error(`Groq error: ${r.statusText}`)
    const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("Empty Groq response")
    return res.status(200).json({ placeIds: JSON.parse(stripJsonFences(content)) })
  } catch (e) {
    console.error("[/api/recommend]", e)
    return res.status(500).json({ error: "An error occurred" })
  }
}
