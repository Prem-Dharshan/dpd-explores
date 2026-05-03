/**
 * Onboarding Page
 * First-time user CSV upload flow
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/hooks/useSession"
import { CSVUpload } from "@/components/upload/CSVUpload"
import { supabase } from "@/lib/supabase"
import { MapPin, ChevronRight, Download } from "lucide-react"
import type { Place } from "@/types"

export function Onboarding() {
  const navigate = useNavigate()
  const { user } = useSession()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(0)

  const handleUploadSuccess = async (places: Place[]) => {
    try {
      setIsSaving(true)
      setError(null)

      // Insert in batches of 50
      let count = 0
      for (let i = 0; i < places.length; i += 50) {
        const batch = places.slice(i, i + 50).map((p) => ({
          ...p,
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
        const { error: err } = await supabase.from("places").insert(batch)
        if (err) throw err
        count += batch.length
        setSaved(count)
      }

      navigate("/flashcard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save places")
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-base font-body text-ink">
      {/* Header */}
      <header className="border-b border-border px-6 h-16 flex items-center">
        <h1 className="font-display text-[20px] font-medium flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          DPD Explores
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="font-display text-[32px] text-ink mb-3">
            Import your saved places
          </h2>
          <p className="text-[15px] text-ink-secondary max-w-md mx-auto leading-relaxed">
            Start by uploading a CSV from Google Takeout. We'll enrich every place
            with photos, hours, and more — then let AI categorize them for you.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-6 shadow-card">
          <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-secondary mb-4">
            How to export from Google Maps
          </h3>
          <ol className="space-y-3">
            {[
              { step: "1", text: "Go to takeout.google.com" },
              { step: "2", text: "Select Maps → Saved Places" },
              { step: "3", text: "Download as CSV" },
              { step: "4", text: "Upload the file below" },
            ].map((item) => (
              <li key={item.step} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent text-[11px] font-medium">
                  {item.step}
                </span>
                <span className="text-[14px] text-ink">{item.text}</span>
              </li>
            ))}
          </ol>
          <a
            href="https://takeout.google.com"
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-1.5 text-[13px] text-accent hover:text-accent-hover transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Open Google Takeout
          </a>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-[14px] text-red-600">
            {error}
          </div>
        )}

        {/* Saving state */}
        {isSaving ? (
          <div className="bg-sunken border border-border rounded-xl p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mb-4" />
            <p className="text-[15px] font-medium text-ink">Saving places...</p>
            <p className="text-[13px] text-ink-secondary mt-1">{saved} saved so far</p>
          </div>
        ) : (
          <div className="bg-surface border border-border-strong rounded-xl p-6 shadow-elevated">
            <CSVUpload
              userId={user?.id || ""}
              onSuccess={handleUploadSuccess}
              onError={setError}
            />
          </div>
        )}

        {/* Skip */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="text-[13px] text-ink-secondary hover:text-ink transition-colors flex items-center gap-1 mx-auto"
          >
            Skip for now
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    </div>
  )
}
