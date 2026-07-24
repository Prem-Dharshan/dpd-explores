/**
 * Flashcard Categorizer
 * AI-powered place categorization with user-editable chips
 */

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useSession } from "@/hooks/useSession"
import { getPhotoUrl } from "@/lib/gmaps"
import { categorizePlace } from "@/lib/groq"
import { Check, Pencil, SkipForward, MapPin, X, Plus } from "lucide-react"
import type { Place, PlaceCategorization } from "@/types"

interface FlashcardPlace extends Place {
  ai?: PlaceCategorization
  aiLoading?: boolean
}

type TagField =
  | "cuisine_tags"
  | "occasion"
  | "best_for_time"
  | "ambience"
  | "vibe"

const FIELD_LABELS: Record<TagField, string> = {
  cuisine_tags: "Cuisine",
  occasion: "Occasion",
  best_for_time: "Best For",
  ambience: "Ambience",
  vibe: "Vibe",
}

function PlaceholderPhoto({ name }: { name: string }) {
  const colors = [
    ["#e6d8cd", "#c9b8a8"],
    ["#d4e0d9", "#a3c2b0"],
    ["#d8e3ec", "#a8bfcc"],
    ["#e8dcd6", "#ccb4a8"],
    ["#dfe0d4", "#bcc2a6"],
  ]
  const idx = name.charCodeAt(0) % colors.length
  const [from, to] = colors[idx]
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="font-display text-[80px] text-white opacity-40 select-none leading-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function TagChip({
  label,
  onRemove,
}: {
  label: string
  onRemove?: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-accent-muted text-accent-text text-[11px] font-medium border border-transparent group">
      {label.replace(/_/g, " ")}
      {onRemove && (
        <button
          aria-label="Remove tag"
          onClick={onRemove}
          className="opacity-50 hover:opacity-100 transition-opacity ml-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

export function Flashcard() {
  const navigate = useNavigate()
  const { user } = useSession()
  const [queue, setQueue] = useState<FlashcardPlace[]>([])
  const [heldQueue, setHeldQueue] = useState<FlashcardPlace[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showHeld, setShowHeld] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedTags, setEditedTags] = useState<Partial<Place>>({})
  const [addingField, setAddingField] = useState<TagField | null>(null)
  const [newTagValue, setNewTagValue] = useState("")

  const activeQueue = showHeld ? heldQueue : queue
  const currentPlace = activeQueue[currentIdx]

  // Load uncategorized places
  useEffect(() => {
    if (!user) { navigate("/login"); return }
    ;(async () => {
      setIsLoading(true)
      const { data: mainQ } = await supabase
        .from("places")
        .select("*")
        .eq("user_id", user.id)
        .eq("categorized", false)
        .eq("held_for_review", false)
        .order("created_at", { ascending: true })
      const { data: heldQ } = await supabase
        .from("places")
        .select("*")
        .eq("user_id", user.id)
        .eq("held_for_review", true)
        .order("created_at", { ascending: true })
      setQueue(mainQ || [])
      setHeldQueue(heldQ || [])
      setIsLoading(false)
    })()
  }, [user, navigate])

  // Fetch AI categorization when place changes
  const fetchAI = useCallback(async (place: FlashcardPlace, isHeld: boolean) => {
    const setter = isHeld ? setHeldQueue : setQueue
    setter((prev) =>
      prev.map((p) => (p.id === place.id ? { ...p, aiLoading: true } : p))
    )
    try {
      const ai = await categorizePlace({
        name: place.name,
        address: place.address,
        place_type: place.place_type,
        notes: place.notes,
        comment: place.comment,
      })
      setter((prev) =>
        prev.map((p) => (p.id === place.id ? { ...p, ai, aiLoading: false } : p))
      )
    } catch {
      setter((prev) =>
        prev.map((p) => (p.id === place.id ? { ...p, aiLoading: false } : p))
      )
    }
  }, [])

  useEffect(() => {
    if (!currentPlace || currentPlace.ai || currentPlace.aiLoading) return
    fetchAI(currentPlace, showHeld)
  }, [currentPlace, showHeld, fetchAI])

  // Initialize edit state when entering edit mode
  useEffect(() => {
    if (editMode && currentPlace) {
      const tags = currentPlace.ai
      setEditedTags({
        cuisine_tags: tags?.cuisine_tags || currentPlace.cuisine_tags || [],
        occasion: tags?.occasion as Place["occasion"] || currentPlace.occasion,
        best_for_time: tags?.best_for_time as Place["best_for_time"] || currentPlace.best_for_time,
        ambience: tags?.ambience as Place["ambience"] || currentPlace.ambience,
        vibe: tags?.vibe as Place["vibe"] || currentPlace.vibe,
        must_try: tags?.must_try || currentPlace.must_try || "",
        diet_type: tags?.diet_type || currentPlace.diet_type,
        cuisine_type: tags?.cuisine_type || currentPlace.cuisine_type,
        wishlist_priority: tags?.wishlist_priority || currentPlace.wishlist_priority,
      })
    }
  }, [editMode, currentPlace])

  const buildSavePayload = () => {
    const ai = currentPlace?.ai
    const tags = editMode ? editedTags : ai
    return {
      categorized: true,
      held_for_review: false,
      cuisine_type: tags?.cuisine_type || currentPlace?.cuisine_type || null,
      cuisine_tags: tags?.cuisine_tags || ai?.cuisine_tags || [],
      diet_type: tags?.diet_type || ai?.diet_type || "both",
      alcohol_served: ai?.alcohol_served || "unknown",
      place_type: ai?.place_type || currentPlace?.place_type,
      occasion: tags?.occasion || ai?.occasion || [],
      best_for_time: tags?.best_for_time || ai?.best_for_time || [],
      ambience: tags?.ambience || ai?.ambience || [],
      vibe: tags?.vibe || ai?.vibe || [],
      signature_dishes: ai?.signature_dishes || [],
      must_try: tags?.must_try || ai?.must_try || null,
      wishlist_priority: tags?.wishlist_priority || ai?.wishlist_priority || "medium",
      updated_at: new Date().toISOString(),
    }
  }

  const handleApprove = async () => {
    if (!currentPlace || !user || isSaving) return
    setIsSaving(true)
    setSaveError(null)
    const { error } = await supabase.from("places").update(buildSavePayload()).eq("id", currentPlace.id).eq("user_id", user.id)
    setIsSaving(false)
    if (error) {
      setSaveError(`Couldn't save "${currentPlace.name}": ${error.message}`)
      return
    }
    advance()
    setEditMode(false)
  }

  const handleHold = async () => {
    if (!currentPlace || !user || isSaving) return
    setSaveError(null)
    const { error } = await supabase.from("places").update({ held_for_review: true, updated_at: new Date().toISOString() }).eq("id", currentPlace.id).eq("user_id", user.id)
    if (error) {
      setSaveError(`Couldn't hold "${currentPlace.name}": ${error.message}`)
      return
    }
    const held = { ...currentPlace, held_for_review: true }
    if (showHeld) {
      // Move it to the back of the held queue
      setHeldQueue((prev) => [...prev.filter((p) => p.id !== currentPlace.id), held])
    } else {
      // Removing it from the queue slides the next card into the current index,
      // so don't advance() here — that would skip a card
      setQueue((prev) => prev.filter((p) => p.id !== currentPlace.id))
      setHeldQueue((prev) => [...prev, held])
    }
    setEditMode(false)
    setEditedTags({})
  }

  const advance = () => {
    setEditMode(false)
    setEditedTags({})
    if (currentIdx < activeQueue.length - 1) {
      setCurrentIdx((i) => i + 1)
    } else if (!showHeld && heldQueue.length > 0) {
      setShowHeld(true)
      setCurrentIdx(0)
    } else {
      navigate("/")
    }
  }

  // Keyboard shortcuts (advertised in the footer hints)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return
      if (!currentPlace) return
      if (e.key === "ArrowRight") handleApprove()
      else if (e.key === "e" && !editMode) setEditMode(true)
      else if (e.key === "h") handleHold()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const removeTag = (field: TagField, value: string) => {
    setEditedTags((prev) => ({
      ...prev,
      [field]: ((prev[field] as string[]) || []).filter((t) => t !== value),
    }))
  }

  const addTag = (field: TagField) => {
    const val = newTagValue.trim().toLowerCase().replace(/\s+/g, "_")
    if (val) {
      setEditedTags((prev) => ({
        ...prev,
        [field]: [...((prev[field] as string[]) || []), val],
      }))
    }
    setNewTagValue("")
    setAddingField(null)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!currentPlace) {
    const isDone = queue.length === 0 && heldQueue.length === 0
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-4">
        <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-sm w-full shadow-elevated">
          <div className="w-14 h-14 bg-accent-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-accent" />
          </div>
          <h2 className="font-display text-[24px] text-ink mb-2">
            {isDone ? "All done!" : showHeld ? "Held queue done!" : "Main queue done!"}
          </h2>
          <p className="text-[14px] text-ink-secondary mb-6">
            {isDone
              ? "You've categorized all your places."
              : !showHeld && heldQueue.length > 0
              ? `You have ${heldQueue.length} held places to review.`
              : "All places are categorized."}
          </p>
          {!showHeld && heldQueue.length > 0 ? (
            <button
              onClick={() => { setShowHeld(true); setCurrentIdx(0) }}
              className="w-full bg-accent text-surface font-medium py-3 rounded-md hover:bg-accent-hover transition-colors text-[15px]"
            >
              Review {heldQueue.length} held places
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="w-full bg-accent text-surface font-medium py-3 rounded-md hover:bg-accent-hover transition-colors text-[15px]"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    )
  }

  const photo = currentPlace.photo_references?.[0]
  const ai = currentPlace.ai
  const tags = editMode ? editedTags : ai

  const progressNum = currentIdx + 1
  const progressTotal = showHeld ? heldQueue.length : queue.length

  return (
    <div className="min-h-screen bg-base font-body text-ink flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-base/90 backdrop-blur border-b border-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="font-display text-[17px]">DPD Explores</span>
          {showHeld && (
            <span className="ml-2 text-[11px] bg-[#F3E8FF] text-[#9333EA] font-medium px-2 py-0.5 rounded-full">
              Held queue
            </span>
          )}
        </div>
        <span className="font-mono text-[14px] text-ink-secondary">
          {progressNum} / {progressTotal}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${(progressNum / progressTotal) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col lg:flex-row max-w-5xl mx-auto w-full gap-0 lg:gap-8 p-4 sm:p-6">
        {/* Left: Photo + info */}
        <div className="lg:w-[380px] shrink-0 flex flex-col gap-4">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-sunken relative shadow-card">
            {photo ? (
              <img
                src={getPhotoUrl(photo, 800)}
                alt={currentPlace.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.currentTarget
                  t.style.display = "none"
                  t.nextElementSibling?.removeAttribute("style")
                }}
              />
            ) : null}
            {!photo && <PlaceholderPhoto name={currentPlace.name} />}
          </div>

          <div>
            <h2 className="font-display text-[24px] font-medium text-ink leading-tight">
              {currentPlace.name}
            </h2>
            {currentPlace.address && (
              <p className="text-[13px] text-ink-secondary mt-1">{currentPlace.address}</p>
            )}
            {currentPlace.notes && (
              <p className="text-[13px] text-ink-secondary mt-2 italic">"{currentPlace.notes}"</p>
            )}
          </div>

          {/* Diet + price badges */}
          <div className="flex flex-wrap gap-2">
            {(ai?.diet_type || currentPlace.diet_type) && (
              <span className="h-6 px-2.5 rounded-full bg-sunken border border-border text-[11px] text-ink-secondary flex items-center">
                {(ai?.diet_type || currentPlace.diet_type).replace("_", " ")}
              </span>
            )}
            {currentPlace.price_range && (
              <span className="h-6 px-2.5 rounded-full bg-sunken border border-border text-[11px] font-mono text-ink-secondary flex items-center">
                {currentPlace.price_range}
              </span>
            )}
          </div>
        </div>

        {/* Right: AI tags + actions */}
        <div className="flex-1 flex flex-col gap-5 mt-4 lg:mt-0">
          {/* Save error */}
          {saveError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
              {saveError}
            </div>
          )}

          {/* AI Loading */}
          {currentPlace.aiLoading && (
            <div className="flex items-center gap-2 text-[13px] text-ink-secondary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              AI categorizing...
            </div>
          )}

          {/* must_try */}
          {(ai?.must_try || currentPlace.must_try) && (
            <div className="bg-accent-muted rounded-lg px-4 py-3 border border-transparent">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-accent-text mb-1">Must Try</p>
              <p className="font-display italic text-[16px] text-ink">
                "{ai?.must_try || currentPlace.must_try}"
              </p>
            </div>
          )}

          {/* Tag sections */}
          {(Object.entries(FIELD_LABELS) as [TagField, string][]).map(([field, label]) => {
            const values = (tags?.[field] as string[] | undefined) || (currentPlace[field] as string[] | undefined) || []
            return (
              <div key={field}>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-secondary mb-2">
                  {label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((v) => (
                    <TagChip
                      key={v}
                      label={v}
                      onRemove={editMode ? () => removeTag(field, v) : undefined}
                    />
                  ))}
                  {editMode && (
                    addingField === field ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={newTagValue}
                          onChange={(e) => setNewTagValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") addTag(field); if (e.key === "Escape") setAddingField(null) }}
                          className="h-7 px-2 rounded-full border border-accent bg-surface text-[11px] text-ink outline-none w-28"
                          placeholder="Add tag..."
                        />
                        <button aria-label="Confirm add tag" onClick={() => addTag(field)} className="text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"><Check className="w-3.5 h-3.5" /></button>
                        <button aria-label="Cancel add tag" onClick={() => setAddingField(null)} className="text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button
                        aria-label={`Add tag for ${field}`}
                        onClick={() => setAddingField(field)}
                        className="h-7 w-7 rounded-full border border-dashed border-border-strong flex items-center justify-center text-ink-tertiary hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}

          {/* Actions */}
          <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleHold}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border text-[14px] font-medium text-ink-secondary hover:border-border-strong hover:text-ink transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
              Hold
            </button>

            {editMode ? (
              <button
                onClick={handleApprove}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent text-surface text-[14px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Edits"}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border text-[14px] font-medium text-ink hover:border-border-strong transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit & Save
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSaving || currentPlace.aiLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent text-surface text-[14px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Approve"}
                </button>
              </>
            )}
          </div>

          {/* Keyboard hints */}
          <p className="hidden lg:flex gap-4 text-[11px] text-ink-tertiary">
            <span><kbd className="font-mono bg-sunken px-1.5 py-0.5 rounded border border-border">→</kbd> Approve</span>
            <span><kbd className="font-mono bg-sunken px-1.5 py-0.5 rounded border border-border">e</kbd> Edit</span>
            <span><kbd className="font-mono bg-sunken px-1.5 py-0.5 rounded border border-border">h</kbd> Hold</span>
          </p>
        </div>
      </main>
    </div>
  )
}
