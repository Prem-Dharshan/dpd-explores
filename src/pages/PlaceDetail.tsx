/**
 * Place Detail Page
 * Full details, photo carousel, reviews, ratings
 */

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSession } from "@/hooks/useSession"
import { supabase } from "@/lib/supabase"
import { getPhotoUrl, getGmapsUrl } from "@/lib/gmaps"
import { GmapsIcon } from "@/components/GmapsIcon"
import { PlaceForm } from "@/components/PlaceForm"
import {
  ArrowLeft, MapPin, Phone, Globe, Clock, ChevronLeft, ChevronRight,
  CheckCircle, Bookmark, Star, Plus, X, Pencil
} from "lucide-react"
import type { Place, Review, Rating } from "@/types"

interface ReviewWithRatings extends Review {
  ratings?: Rating[]
}

const RATING_CATEGORIES = [
  { key: "food_taste", label: "Food Taste" },
  { key: "food_quality", label: "Food Quality" },
  { key: "food_quantity", label: "Quantity" },
  { key: "value_for_money", label: "Value" },
  { key: "ambience", label: "Ambience" },
  { key: "service", label: "Service" },
]

function RatingBar({ score, label }: { score: number; label: string }) {
  const pct = (score / 10) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-ink-secondary w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-sunken rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-600"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[12px] text-ink w-8 text-right">{score.toFixed(1)}</span>
    </div>
  )
}

function PlaceholderPhoto({ name, className }: { name: string; className?: string }) {
  const colors = [["#e6d8cd", "#c9b8a8"], ["#d4e0d9", "#a3c2b0"], ["#d8e3ec", "#a8bfcc"]]
  const [from, to] = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="font-display text-8xl text-white opacity-30 select-none">{name.charAt(0)}</span>
    </div>
  )
}

export function PlaceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSession()
  const [place, setPlace] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<ReviewWithRatings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showAddReview, setShowAddReview] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    visited_at: new Date().toISOString().slice(0, 10),
    visited_with: "friends" as const,
    bill_amount: "",
    notes: "",
    scores: {} as Record<string, number>,
  })
  const [savingReview, setSavingReview] = useState(false)

  useEffect(() => {
    if (!user || !id) return
    ;(async () => {
      setIsLoading(true)
      const [{ data: placeData }, { data: reviewData }] = await Promise.all([
        supabase.from("places").select("*").eq("id", id).eq("user_id", user.id).single(),
        supabase.from("reviews").select("*, ratings(*)").eq("place_id", id).eq("user_id", user.id).order("created_at", { ascending: false }),
      ])
      setPlace(placeData)
      setReviews((reviewData as ReviewWithRatings[]) || [])
      setIsLoading(false)
    })()
  }, [user, id])

  const saveReview = async () => {
    if (!user || !place) return
    setSavingReview(true)
    try {
      const { data: rev } = await supabase.from("reviews").insert({
        place_id: place.id,
        user_id: user.id,
        visited_at: reviewForm.visited_at,
        visited_with: reviewForm.visited_with,
        bill_amount: reviewForm.bill_amount ? parseInt(reviewForm.bill_amount) : null,
        notes: reviewForm.notes || null,
      }).select().single()

      if (rev) {
        const ratingsToInsert = Object.entries(reviewForm.scores).map(([category, score]) => ({
          review_id: rev.id,
          category,
          score,
        }))
        if (ratingsToInsert.length > 0) {
          await supabase.from("ratings").insert(ratingsToInsert)
        }
        // Update place visited status
        await supabase.from("places").update({
          visited: true,
          visited_count: (place.visited_count || 0) + 1,
          last_visited_at: reviewForm.visited_at,
          first_visited_at: place.first_visited_at || reviewForm.visited_at,
        }).eq("id", place.id)
        setPlace((p) => p ? { ...p, visited: true } : p)
      }

      setShowAddReview(false)
    } finally {
      setSavingReview(false)
    }
  }

  const saveEdit = async (values: Partial<Place>) => {
    if (!user || !place) return
    setSavingEdit(true)
    setEditError(null)
    // Strip fields that must never be written from the form
    const { id: _id, user_id: _uid, created_at: _created, ...payload } = values
    void _id; void _uid; void _created
    const { error } = await supabase
      .from("places")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", place.id)
      .eq("user_id", user.id)
    setSavingEdit(false)
    if (error) {
      setEditError(error.message)
      return
    }
    setPlace({ ...place, ...values })
    setEditMode(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!place) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base flex-col gap-4">
        <MapPin className="w-12 h-12 text-ink-tertiary" />
        <p className="text-ink-secondary">Place not found.</p>
        <Link to="/" className="text-accent hover:underline text-[14px]">Back to dashboard</Link>
      </div>
    )
  }

  const photos = place.photo_references || []
  const allTags = [...place.vibe, ...place.ambience, ...place.occasion, ...place.best_for_time]

  const avgScores: Record<string, number> = {}
  reviews.forEach((r) => {
    r.ratings?.forEach((rt) => {
      if (!avgScores[rt.category]) avgScores[rt.category] = 0
      avgScores[rt.category] += rt.score
    })
  })
  if (reviews.length > 0) {
    Object.keys(avgScores).forEach((k) => { avgScores[k] = avgScores[k] / reviews.length })
  }

  return (
    <div className="min-h-screen bg-base font-body text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-base/90 backdrop-blur px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h2 className="font-display text-[18px] text-ink truncate max-w-xs">{place.name}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditMode(!editMode); setEditError(null) }}
            className={`flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-md border transition-colors ${
              editMode
                ? "border-accent text-accent"
                : "border-border text-ink-secondary hover:border-border-strong hover:text-ink"
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">{editMode ? "Cancel edit" : "Edit"}</span>
          </button>
          <button
            onClick={() => setShowAddReview(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium bg-accent text-surface px-3 py-1.5 rounded-md hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Review</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Photo Carousel */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-sunken shadow-elevated">
          {photos.length > 0 ? (
            <>
              <img
                src={getPhotoUrl(photos[photoIdx], 1200)}
                alt={place.name}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/30 hover:bg-ink/50 rounded-full flex items-center justify-center text-surface backdrop-blur transition-colors focus-visible:ring-2 focus-visible:ring-surface focus-visible:outline-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/30 hover:bg-ink/50 rounded-full flex items-center justify-center text-surface backdrop-blur transition-colors focus-visible:ring-2 focus-visible:ring-surface focus-visible:outline-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        aria-label={`Photo ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-surface focus-visible:outline-none ${i === photoIdx ? "w-5 bg-surface" : "w-1.5 bg-surface/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <PlaceholderPhoto name={place.name} className="w-full h-full" />
          )}
          {/* Visit badge */}
          <div className="absolute top-3 right-3">
            {place.visited ? (
              <span className="flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] text-[11px] font-medium px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" /> Visited {place.visited_count}×
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-accent-muted text-accent-text text-[11px] font-medium px-2.5 py-1 rounded-full">
                <Bookmark className="w-3.5 h-3.5" fill="currentColor" /> Wishlist
              </span>
            )}
          </div>
        </div>

        {/* Edit mode */}
        {editMode && (
          <div className="space-y-4">
            {editError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-[14px] text-red-600">
                {editError}
              </div>
            )}
            <PlaceForm
              initial={place}
              onSubmit={saveEdit}
              submitLabel="Save changes"
              isSaving={savingEdit}
              onCancel={() => { setEditMode(false); setEditError(null) }}
            />
          </div>
        )}

        {/* Info */}
        {!editMode && (
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-[32px] text-ink leading-tight">{place.name}</h1>
            <p className="text-[14px] text-ink-secondary mt-1">
              {[place.cuisine_type, place.place_type, place.area, place.city].filter(Boolean).join(" · ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {place.price_range && (
              <span className="h-7 px-3 rounded-full bg-sunken border border-border font-mono text-[12px] text-ink-secondary flex items-center">
                {place.price_range}
              </span>
            )}
            {place.diet_type && (
              <span className="h-7 px-3 rounded-full bg-sunken border border-border text-[12px] text-ink-secondary flex items-center capitalize">
                {place.diet_type}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            {place.address && (
              <div className="flex items-start gap-2 text-ink-secondary">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                {place.address}
              </div>
            )}
            <div className="flex items-center gap-2 text-ink-secondary">
              <GmapsIcon className="h-4 shrink-0" />
              <a
                href={getGmapsUrl(place)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                Open in Google Maps
              </a>
            </div>
            {place.phone_number && (
              <div className="flex items-center gap-2 text-ink-secondary">
                <Phone className="w-4 h-4 text-accent" />
                <a href={`tel:${place.phone_number}`} className="hover:text-accent">{place.phone_number}</a>
              </div>
            )}
            {place.menu_link && (
              <div className="flex items-center gap-2 text-ink-secondary">
                <Globe className="w-4 h-4 text-accent" />
                <a href={place.menu_link} target="_blank" rel="noreferrer" className="hover:text-accent truncate">Website</a>
              </div>
            )}
            {place.opening_hours && (
              <div className="flex items-start gap-2 text-ink-secondary">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                <span className="text-[12px]">Hours on file</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Tags */}
        {!editMode && allTags.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
            <h3 className="text-[12px] uppercase tracking-[0.06em] text-ink-secondary font-medium mb-3">Your Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <span key={t} className="h-7 px-3 rounded-full bg-accent-muted text-accent-text text-[12px] font-medium flex items-center">
                  {t.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dishes */}
        {!editMode && (place.must_try || place.signature_dishes.length > 0) && (
          <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
            <h3 className="text-[12px] uppercase tracking-[0.06em] text-ink-secondary font-medium mb-3">Dishes</h3>
            {place.must_try && (
              <p className="font-display italic text-[17px] text-accent mb-3">
                Must Try: "{place.must_try}"
              </p>
            )}
            {place.signature_dishes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {place.signature_dishes.map((d) => (
                  <span key={d} className="h-7 px-3 rounded-full bg-sunken border border-border text-[12px] text-ink flex items-center">
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {!editMode && (place.notes || place.comment) && (
          <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
            <h3 className="text-[12px] uppercase tracking-[0.06em] text-ink-secondary font-medium mb-2">Your Notes</h3>
            {place.notes && <p className="text-[14px] text-ink">{place.notes}</p>}
            {place.comment && <p className="text-[13px] text-ink-secondary mt-1 italic">"{place.comment}"</p>}
          </div>
        )}

        {/* Ratings */}
        {Object.keys(avgScores).length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
            <h3 className="text-[12px] uppercase tracking-[0.06em] text-ink-secondary font-medium mb-4">Ratings (avg of {reviews.length} review{reviews.length !== 1 ? "s" : ""})</h3>
            <div className="space-y-3">
              {RATING_CATEGORIES.map((cat) =>
                avgScores[cat.key] != null ? (
                  <RatingBar key={cat.key} label={cat.label} score={avgScores[cat.key]} />
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[20px] text-ink">
              Reviews <span className="font-mono text-[16px] text-ink-secondary">({reviews.length})</span>
            </h3>
            <button
              onClick={() => setShowAddReview(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Review
            </button>
          </div>
          {reviews.length === 0 ? (
            <div className="bg-sunken border border-border rounded-xl p-8 text-center">
              <Star className="w-8 h-8 text-ink-tertiary mx-auto mb-2" />
              <p className="text-[14px] text-ink-secondary">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-surface border border-border rounded-xl p-5 shadow-card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[14px] font-medium text-ink">{rev.visited_at?.slice(0, 10) || "Unknown date"}</p>
                      <p className="text-[12px] text-ink-secondary">
                        {[rev.visited_with, rev.bill_amount ? `₹${rev.bill_amount}` : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  {rev.notes && <p className="text-[13px] text-ink mb-3">{rev.notes}</p>}
                  {rev.ratings && rev.ratings.length > 0 && (
                    <div className="space-y-2">
                      {rev.ratings.map((rt) => (
                        <RatingBar key={rt.id} label={RATING_CATEGORIES.find((c) => c.key === rt.category)?.label || rt.category} score={rt.score} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Review Modal */}
      {showAddReview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-elevated max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface">
              <h3 className="font-display text-[20px] text-ink">Add Review</h3>
              <button
                onClick={() => setShowAddReview(false)}
                aria-label="Close modal"
                className="text-ink-tertiary hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.06em] text-ink-secondary mb-1">Date</label>
                  <input
                    type="date"
                    value={reviewForm.visited_at}
                    onChange={(e) => setReviewForm({ ...reviewForm, visited_at: e.target.value })}
                    className="w-full bg-sunken border border-border rounded-md px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.06em] text-ink-secondary mb-1">Visited With</label>
                  <select
                    value={reviewForm.visited_with}
                    onChange={(e) => setReviewForm({ ...reviewForm, visited_with: e.target.value as never })}
                    className="w-full bg-sunken border border-border rounded-md px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
                  >
                    {["solo", "partner", "family", "friends"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-[0.06em] text-ink-secondary mb-1">Bill Amount (₹)</label>
                <input
                  type="number"
                  value={reviewForm.bill_amount}
                  onChange={(e) => setReviewForm({ ...reviewForm, bill_amount: e.target.value })}
                  placeholder="e.g. 1200"
                  className="w-full bg-sunken border border-border rounded-md px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-[0.06em] text-ink-secondary mb-1">Notes</label>
                <textarea
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  rows={2}
                  placeholder="How was it?"
                  className="w-full bg-sunken border border-border rounded-md px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none resize-none"
                />
              </div>

              {/* Scores */}
              <div>
                <p className="text-[12px] uppercase tracking-[0.06em] text-ink-secondary mb-3">Ratings (1–10)</p>
                <div className="space-y-3">
                  {RATING_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-center gap-3">
                      <span className="text-[12px] text-ink-secondary w-28 shrink-0">{cat.label}</span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={0.5}
                        value={reviewForm.scores[cat.key] || 5}
                        onChange={(e) => setReviewForm((f) => ({ ...f, scores: { ...f.scores, [cat.key]: parseFloat(e.target.value) } }))}
                        className="flex-1 accent-accent"
                      />
                      <span className="font-mono text-[13px] text-ink w-8 text-right">
                        {(reviewForm.scores[cat.key] || 5).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={saveReview}
                disabled={savingReview}
                className="w-full bg-accent text-surface font-medium py-3 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60 text-[15px]"
              >
                {savingReview ? "Saving..." : "Save Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
