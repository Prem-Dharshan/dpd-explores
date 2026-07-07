/**
 * Shared place form — used by Add Place and the detail page's edit mode.
 * Covers every editable field: food spots and experiences alike.
 */

import { useState, useEffect } from "react"
import type { Place } from "@/types"
import {
  PLACE_TYPES, OCCASIONS, BEST_FOR_TIMES, AMBIENCE_TAGS, VIBE_TAGS,
  PRICE_RANGES, DIET_TYPES, WISHLIST_PRIORITIES, labelize,
} from "@/lib/constants"

interface PlaceFormProps {
  initial: Partial<Place>
  onSubmit: (values: Partial<Place>) => void | Promise<void>
  submitLabel: string
  isSaving?: boolean
  onCancel?: () => void
}

const inputCls =
  "w-full rounded-md border border-border-strong bg-sunken py-2.5 px-3 text-[14px] text-ink placeholder:text-ink-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-ink-secondary mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-4">
      <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-secondary border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

function ChipToggles({
  options, selected, onToggle,
}: {
  options: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.includes(o)
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors ${
              active
                ? "bg-accent-muted text-accent-text"
                : "bg-transparent border border-border text-ink-secondary hover:border-border-strong"
            }`}
          >
            {labelize(o)}
          </button>
        )
      })}
    </div>
  )
}

export function PlaceForm({ initial, onSubmit, submitLabel, isSaving, onCancel }: PlaceFormProps) {
  const [values, setValues] = useState<Partial<Place>>(initial)
  const [error, setError] = useState<string | null>(null)

  // Merge in new autofill/initial data (e.g. after a Maps-link lookup)
  useEffect(() => {
    setValues((v) => ({ ...v, ...initial }))
  }, [initial])

  const set = <K extends keyof Place>(key: K, value: Place[K] | undefined) =>
    setValues((v) => ({ ...v, [key]: value }))

  const toggleTag = (key: "occasion" | "best_for_time" | "ambience" | "vibe", tag: string) => {
    const current = (values[key] as string[] | undefined) || []
    set(
      key,
      (current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]) as Place[typeof key]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name?.trim()) {
      setError("Name is required")
      return
    }
    setError(null)
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <Section title="Basics">
        <Field label="Name *">
          <input
            type="text"
            value={values.name || ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Place name"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category">
            <select
              value={values.place_type || ""}
              onChange={(e) => set("place_type", e.target.value || undefined)}
              className={inputCls}
            >
              <option value="">Pick a category…</option>
              {PLACE_TYPES.map((t) => (
                <option key={t} value={t}>{labelize(t)}</option>
              ))}
            </select>
          </Field>
          <Field label="Wishlist priority">
            <select
              value={values.wishlist_priority || "medium"}
              onChange={(e) => set("wishlist_priority", e.target.value as Place["wishlist_priority"])}
              className={inputCls}
            >
              {WISHLIST_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-[14px] text-ink">
          <input
            type="checkbox"
            checked={!!values.visited}
            onChange={(e) => set("visited", e.target.checked)}
            className="accent-[#2D6A4F] w-4 h-4"
          />
          I've visited this place
        </label>
        <Field label="Notes">
          <textarea
            value={values.notes || ""}
            onChange={(e) => set("notes", e.target.value || undefined)}
            placeholder="Why did you save this place?"
            rows={2}
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Location">
        <Field label="Address">
          <input
            type="text"
            value={values.address || ""}
            onChange={(e) => set("address", e.target.value || undefined)}
            placeholder="Street address"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Area">
            <input
              type="text"
              value={values.area || ""}
              onChange={(e) => set("area", e.target.value || undefined)}
              placeholder="Neighbourhood"
              className={inputCls}
            />
          </Field>
          <Field label="City">
            <input
              type="text"
              value={values.city || ""}
              onChange={(e) => set("city", e.target.value || undefined)}
              placeholder="City"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Google Maps link">
          <input
            type="url"
            value={values.gmaps_url || ""}
            onChange={(e) => set("gmaps_url", e.target.value || undefined)}
            placeholder="https://maps.google.com/..."
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Food & budget (skip for non-food spots)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Cuisine">
            <input
              type="text"
              value={values.cuisine_type || ""}
              onChange={(e) => set("cuisine_type", e.target.value || undefined)}
              placeholder="e.g. South Indian"
              className={inputCls}
            />
          </Field>
          <Field label="Diet">
            <select
              value={values.diet_type || "both"}
              onChange={(e) => set("diet_type", e.target.value as Place["diet_type"])}
              className={inputCls}
            >
              {DIET_TYPES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Price range">
            <select
              value={values.price_range || ""}
              onChange={(e) => set("price_range", (e.target.value || undefined) as Place["price_range"])}
              className={inputCls}
            >
              <option value="">—</option>
              {PRICE_RANGES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget / person min">
            <input
              type="number"
              value={values.budget_per_person_min ?? ""}
              onChange={(e) => set("budget_per_person_min", e.target.value ? +e.target.value : undefined)}
              placeholder="₹"
              className={inputCls}
            />
          </Field>
          <Field label="Budget / person max">
            <input
              type="number"
              value={values.budget_per_person_max ?? ""}
              onChange={(e) => set("budget_per_person_max", e.target.value ? +e.target.value : undefined)}
              placeholder="₹"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Must try">
          <input
            type="text"
            value={values.must_try || ""}
            onChange={(e) => set("must_try", e.target.value || undefined)}
            placeholder="The one thing not to miss"
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Contact & links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input
              type="tel"
              value={values.phone_number || ""}
              onChange={(e) => set("phone_number", e.target.value || undefined)}
              placeholder="+91..."
              className={inputCls}
            />
          </Field>
          <Field label="Instagram">
            <input
              type="text"
              value={values.instagram_handle || ""}
              onChange={(e) => set("instagram_handle", e.target.value || undefined)}
              placeholder="@handle"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Website / menu link">
          <input
            type="url"
            value={values.menu_link || ""}
            onChange={(e) => set("menu_link", e.target.value || undefined)}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Occasion & vibe">
        <Field label="Occasion">
          <ChipToggles
            options={OCCASIONS}
            selected={(values.occasion as string[]) || []}
            onToggle={(t) => toggleTag("occasion", t)}
          />
        </Field>
        <Field label="Best for">
          <ChipToggles
            options={BEST_FOR_TIMES}
            selected={(values.best_for_time as string[]) || []}
            onToggle={(t) => toggleTag("best_for_time", t)}
          />
        </Field>
        <Field label="Ambience">
          <ChipToggles
            options={AMBIENCE_TAGS}
            selected={(values.ambience as string[]) || []}
            onToggle={(t) => toggleTag("ambience", t)}
          />
        </Field>
        <Field label="Vibe">
          <ChipToggles
            options={VIBE_TAGS}
            selected={(values.vibe as string[]) || []}
            onToggle={(t) => toggleTag("vibe", t)}
          />
        </Field>
      </Section>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-md border border-border text-[14px] font-medium text-ink-secondary hover:border-border-strong hover:text-ink transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-accent text-surface font-medium py-3 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  )
}
