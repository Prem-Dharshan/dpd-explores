/**
 * CSV Upload Component
 * Drag-and-drop CSV file upload with enrichment pipeline
 */

import { useState, useRef, useCallback } from "react"
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react"
import { parseCSV } from "@/lib/csv-parser"
import { extractPlaceIdFromUrl } from "@/lib/csv-parser"
import type { RawPlace, Place } from "@/types"

interface Props {
  userId: string
  onSuccess: (places: Place[]) => void
  onError: (message: string) => void
}

interface EnrichProgress {
  current: number
  total: number
  currentName: string
  errors: string[]
}

function mapPlacesAPIToPlace(
  raw: RawPlace,
  api: Record<string, unknown>,
  userId: string
): Partial<Place> {
  type AddressComponent = { longText: string; shortText: string; types: string[] }
  const photos = (api.photos as Array<{ name: string }> | undefined)?.map((p) => p.name) || []
  const components = api.addressComponents as AddressComponent[] | undefined
  const city = components?.find((c) => c.types.includes("locality"))?.longText || ""
  const area =
    components?.find((c) => c.types.includes("sublocality_level_1"))?.longText ||
    components?.find((c) => c.types.includes("sublocality"))?.longText || ""

  const priceMap: Record<string, "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹"> = {
    PRICE_LEVEL_INEXPENSIVE: "₹",
    PRICE_LEVEL_MODERATE: "₹₹",
    PRICE_LEVEL_EXPENSIVE: "₹₹₹",
    PRICE_LEVEL_VERY_EXPENSIVE: "₹₹₹₹",
  }

  return {
    name: raw.name,
    notes: raw.notes,
    comment: raw.comment,
    gmaps_url: raw.gmaps_url,
    user_id: userId,
    source: "csv" as const,
    place_id: (api.id as string | undefined) || extractPlaceIdFromUrl(raw.gmaps_url || "") || undefined,
    address: api.formattedAddress as string | undefined,
    city,
    area,
    lat: (api.location as { latitude?: number } | undefined)?.latitude,
    lng: (api.location as { longitude?: number } | undefined)?.longitude,
    phone_number: api.internationalPhoneNumber as string | undefined,
    opening_hours: api.regularOpeningHours as Record<string, unknown> | undefined,
    photo_references: photos,
    price_range: api.priceLevel ? priceMap[api.priceLevel as string] : undefined,
    menu_link: api.websiteUri as string | undefined,
    // defaults
    cuisine_tags: [],
    diet_type: "both",
    alcohol_served: "unknown",
    signature_dishes: [],
    best_dishes: [],
    dishes_to_avoid: [],
    occasion: [],
    best_for_time: [],
    ambience: [],
    vibe: [],
    visited: false,
    visited_count: 0,
    wishlist_priority: "medium",
    categorized: false,
    held_for_review: false,
    active: true,
  }
}

export function CSVUpload({ userId, onSuccess, onError }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<EnrichProgress | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith(".csv")) {
      onError("Please upload a CSV file from Google Takeout.")
      return
    }
    setFile(f)
  }, [onError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const processFile = async () => {
    if (!file) return
    setIsProcessing(true)

    try {
      const rawPlaces = await parseCSV(file)
      if (rawPlaces.length === 0) {
        onError("No places found in the CSV file.")
        setIsProcessing(false)
        return
      }

      const enriched: Place[] = []
      const errors: string[] = []

      for (let i = 0; i < rawPlaces.length; i++) {
        const raw = rawPlaces[i]
        setProgress({ current: i + 1, total: rawPlaces.length, currentName: raw.name, errors })

        try {
          const placeId = extractPlaceIdFromUrl(raw.gmaps_url || "")
          const res = await fetch("/api/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ placeId, name: raw.name }),
          })

          const apiData: Record<string, unknown> = res.ok ? await res.json() : {}
          const mapped = mapPlacesAPIToPlace(raw, apiData, userId) as Place
          enriched.push(mapped)
        } catch {
          errors.push(raw.name)
          const fallback = mapPlacesAPIToPlace(raw, {}, userId) as Place
          enriched.push(fallback)
        }

        // Small delay to avoid rate limiting
        if (i < rawPlaces.length - 1) await new Promise(r => setTimeout(r, 150))
      }

      onSuccess(enriched)
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to process CSV")
    } finally {
      setIsProcessing(false)
    }
  }

  if (progress && isProcessing) {
    const pct = Math.round((progress.current / progress.total) * 100)
    return (
      <div className="space-y-4">
        <div className="bg-sunken rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-medium text-ink">
              Enriching {progress.current} of {progress.total}
            </p>
            <span className="font-mono text-[13px] text-accent">{pct}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-[13px] text-ink-secondary truncate">
            Fetching details for: <span className="text-ink font-medium">{progress.currentName}</span>
          </p>
        </div>
        {progress.errors.length > 0 && (
          <p className="text-[12px] text-ink-tertiary flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {progress.errors.length} places couldn't be enriched and will be saved as-is
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? "border-accent bg-accent-muted"
            : "border-border hover:border-border-strong hover:bg-sunken"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
        />
        <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-accent" : "text-ink-tertiary"}`} />
        <p className="text-[15px] font-medium text-ink mb-1">
          {isDragging ? "Drop your CSV here" : "Drag & drop your CSV"}
        </p>
        <p className="text-[13px] text-ink-secondary">
          or <span className="text-accent underline">browse files</span>
        </p>
        <p className="text-[12px] text-ink-tertiary mt-3">Google Takeout CSV format</p>
      </div>

      {/* Selected File */}
      {file && !isProcessing && (
        <div className="flex items-center justify-between bg-sunken border border-border rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-accent shrink-0" />
            <div>
              <p className="text-[14px] font-medium text-ink">{file.name}</p>
              <p className="text-[12px] text-ink-secondary">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-ink-tertiary hover:text-ink transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      {file && (
        <button
          onClick={processFile}
          disabled={isProcessing}
          className="w-full bg-accent text-surface font-medium py-3 rounded-md hover:bg-accent-hover transition-all duration-200 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
        >
          Import & Enrich Places
        </button>
      )}
    </div>
  )
}
