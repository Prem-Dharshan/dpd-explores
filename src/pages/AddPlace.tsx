/**
 * Add Place
 * Paste a Google Maps link to auto-fill, or fill the form manually.
 * Food spots, treks, arcades, beaches — anything worth exploring.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/hooks/useSession"
import { supabase } from "@/lib/supabase"
import { PlaceForm } from "@/components/PlaceForm"
import { getPhotoUrl } from "@/lib/gmaps"
import { GmapsIcon } from "@/components/GmapsIcon"
import { MapPin, ArrowLeft, Sparkles } from "lucide-react"
import type { Place, PlacesAPIResponse } from "@/types"

const PRICE_MAP: Record<string, Place["price_range"]> = {
  PRICE_LEVEL_INEXPENSIVE: "₹",
  PRICE_LEVEL_MODERATE: "₹₹",
  PRICE_LEVEL_EXPENSIVE: "₹₹₹",
  PRICE_LEVEL_VERY_EXPENSIVE: "₹₹₹₹",
}

function mapApiToForm(api: PlacesAPIResponse & { id?: string }, link: string): Partial<Place> {
  const comps = api.addressComponents || []
  const byType = (t: string) => comps.find((c) => (c.types || []).includes(t))?.longText
  return {
    name: api.displayName?.text,
    place_id: api.id,
    gmaps_url: link,
    address: api.formattedAddress,
    city: byType("locality") || "",
    area: byType("sublocality_level_1") || byType("sublocality") || "",
    lat: api.location?.latitude,
    lng: api.location?.longitude,
    phone_number: api.internationalPhoneNumber,
    opening_hours: api.regularOpeningHours,
    photo_references: (api.photos || []).map((p) => p.name),
    price_range: api.priceLevel ? PRICE_MAP[api.priceLevel] : undefined,
    menu_link: api.websiteUri,
  }
}

export function AddPlace() {
  const navigate = useNavigate()
  const { user } = useSession()
  const [link, setLink] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [prefill, setPrefill] = useState<Partial<Place>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleFetch = async () => {
    if (!link.trim()) return
    setIsFetching(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Lookup failed")
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Couldn't find that place. Fill the form manually below.")
      }
      setPrefill(mapApiToForm(data, link.trim()))
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Lookup failed")
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (values: Partial<Place>) => {
    if (!user) return
    setIsSaving(true)
    setSaveError(null)
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("places")
      .insert({
        // enrichment-only fields not shown in the form
        place_id: prefill.place_id || null,
        lat: prefill.lat ?? null,
        lng: prefill.lng ?? null,
        opening_hours: prefill.opening_hours || null,
        photo_references: prefill.photo_references || [],
        ...values,
        user_id: user.id,
        source: "manual",
        cuisine_tags: values.cuisine_tags || [],
        signature_dishes: [],
        best_dishes: [],
        dishes_to_avoid: [],
        occasion: values.occasion || [],
        best_for_time: values.best_for_time || [],
        ambience: values.ambience || [],
        vibe: values.vibe || [],
        diet_type: values.diet_type || "both",
        alcohol_served: "unknown",
        visited: values.visited || false,
        visited_count: values.visited ? 1 : 0,
        wishlist_priority: values.wishlist_priority || "medium",
        categorized: true,
        held_for_review: false,
        active: true,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single()
    setIsSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    navigate(data?.id ? `/place/${data.id}` : "/")
  }

  const previewPhoto = prefill.photo_references?.[0]

  return (
    <div className="min-h-screen bg-base font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-border bg-base/90 backdrop-blur px-4 sm:px-6 h-14 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="font-display text-[18px] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          Add a place
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Maps-link autofill */}
        <div className="bg-surface border border-border-strong rounded-xl p-5 shadow-elevated">
          <div className="flex items-center gap-2 mb-3">
            <GmapsIcon className="h-5" />
            <h2 className="text-[14px] font-medium text-ink">Start with a Google Maps link</h2>
          </div>
          <p className="text-[13px] text-ink-secondary mb-3">
            Paste any Google Maps link (share links work too) and we'll fill in the details,
            photos and location for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleFetch() } }}
              placeholder="https://maps.app.goo.gl/..."
              className="flex-1 rounded-md border border-border-strong bg-sunken py-2.5 px-3 text-[14px] placeholder:text-ink-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={isFetching || !link.trim()}
              className="bg-accent text-surface px-5 py-2.5 rounded-md text-[14px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isFetching ? "Fetching..." : "Auto-fill"}
            </button>
          </div>
          {fetchError && (
            <p className="mt-3 text-[13px] text-red-600">{fetchError}</p>
          )}
          {prefill.name && (
            <div className="mt-4 flex items-center gap-3 bg-sunken border border-border rounded-lg p-3">
              {previewPhoto && (
                <img
                  src={getPhotoUrl(previewPhoto, 200)}
                  alt={prefill.name}
                  className="w-14 h-14 rounded-md object-cover shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
              )}
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink truncate">{prefill.name}</p>
                <p className="text-[12px] text-ink-secondary truncate">
                  {[prefill.area, prefill.city].filter(Boolean).join(" · ") || prefill.address}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  {prefill.photo_references?.length || 0} photos found — review the form below, then save
                </p>
              </div>
            </div>
          )}
        </div>

        {saveError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-[14px] text-red-600">
            {saveError}
          </div>
        )}

        <PlaceForm
          initial={prefill}
          onSubmit={handleSubmit}
          submitLabel="Add place"
          isSaving={isSaving}
        />
      </main>
    </div>
  )
}
