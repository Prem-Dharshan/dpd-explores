/**
 * Dashboard
 * Place cards grid with filters, sort, search, and mood recommender
 */

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useSession } from "@/hooks/useSession"
import { signOut } from "@/lib/auth-client"
import { supabase } from "@/lib/supabase"
import { getPhotoUrl, getGmapsUrl } from "@/lib/gmaps"
import { GmapsIcon } from "@/components/GmapsIcon"
import { getMoodRecommendation } from "@/lib/groq"
import {
  MapPin, Search, Sparkles, SlidersHorizontal, CheckCircle, Bookmark,
  Star, UploadCloud, ChevronDown, X, ArrowUpDown, Plus, Dices
} from "lucide-react"
import { labelize } from "@/lib/constants"
import type { Place } from "@/types"

function PlaceholderPhoto({ name }: { name: string }) {
  const colors = [
    ["#e6d8cd", "#c9b8a8"], ["#d4e0d9", "#a3c2b0"],
    ["#d8e3ec", "#a8bfcc"], ["#e8dcd6", "#ccb4a8"], ["#dfe0d4", "#bcc2a6"],
  ]
  const [from, to] = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <span className="font-display text-5xl text-white opacity-40 select-none leading-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function PlaceCard({ place, highlighted }: { place: Place; highlighted: boolean | null }) {
  const photo = place.photo_references?.[0]
  return (
    <Link
      to={`/place/${place.id}`}
      className={`group rounded-[14px] bg-surface border shadow-card overflow-hidden flex flex-col cursor-pointer transition-all duration-150
        hover:-translate-y-0.5 hover:shadow-elevated
        ${highlighted ? "border-accent ring-1 ring-accent/20" : "border-border"}
        ${highlighted === false ? "opacity-40" : ""}`}
    >
      {/* Photo */}
      <div className="h-44 w-full bg-sunken relative overflow-hidden shrink-0">
        {photo ? (
          <img
            src={getPhotoUrl(photo, 600)}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <PlaceholderPhoto name={place.name} />
        )}
        {/* Open in Google Maps */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            window.open(getGmapsUrl(place), "_blank", "noopener")
          }}
          title="Open in Google Maps"
          className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-surface/95 hover:bg-surface rounded-full shadow-card flex items-center justify-center transition-transform hover:scale-110"
        >
          <GmapsIcon className="h-[18px]" />
        </button>
        {/* Badge */}
        <div className="absolute top-2.5 right-2.5">
          {place.visited ? (
            <span className="flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] text-[10px] font-medium px-2 py-1 rounded-sm shadow-sm">
              <CheckCircle className="w-3 h-3" /> Visited
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-accent-muted text-accent-text text-[10px] font-medium px-2 py-1 rounded-sm shadow-sm">
              <Bookmark className="w-3 h-3" fill="currentColor" /> Wishlist
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-display text-[17px] font-medium text-ink leading-tight group-hover:text-accent transition-colors line-clamp-2">
            {place.name}
          </h3>
          <span className="font-mono text-[12px] text-ink-secondary shrink-0">
            {place.price_range || "—"}
          </span>
        </div>
        <p className="text-[12px] text-ink-secondary mb-3">
          {[place.cuisine_type, place.area, place.city].filter(Boolean).join(" · ")}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {place.vibe.slice(0, 2).map((v) => (
            <span key={v} className="h-[22px] px-2 rounded-full bg-sunken border border-border text-[10px] text-ink-secondary flex items-center">
              {v.replace(/_/g, " ")}
            </span>
          ))}
          {place.cuisine_tags.slice(0, 1).map((t) => (
            <span key={t} className="h-[22px] px-2 rounded-full bg-sunken border border-border text-[10px] text-ink-secondary flex items-center">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

const SORT_OPTIONS = [
  { value: "recently_added", label: "Recently Added" },
  { value: "recently_visited", label: "Recently Visited" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "wishlist_priority", label: "Wishlist Priority" },
  { value: "budget_low_high", label: "Budget: Low → High" },
  { value: "budget_high_low", label: "Budget: High → Low" },
]

type ActiveHighlight = { ids: string[] } | null

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [moodInput, setMoodInput] = useState("")
  const [moodLoading, setMoodLoading] = useState(false)
  const [highlight, setHighlight] = useState<ActiveHighlight>(null)
  const [sortOpen, setSortOpen] = useState(false)

  const search = searchParams.get("q") || ""
  const visited = searchParams.get("visited") || "all"
  const typeFilter = searchParams.get("type") || ""
  const dietFilter = searchParams.get("diet") || "all"
  const sortBy = searchParams.get("sort") || "recently_added"
  const cityFilter = searchParams.get("city") || ""
  const vibeFilter = searchParams.getAll("vibe")
  const occasionFilter = searchParams.getAll("occasion")

  const stringifiedVibeFilter = JSON.stringify(vibeFilter)
  const stringifiedOccasionFilter = JSON.stringify(occasionFilter)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/login"
  }

  // Load places
  useEffect(() => {
    if (!user) return
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false })
      if (error) {
        setLoadError(error.message)
        setPlaces([])
        setIsLoading(false)
        return
      }
      // First-time users (no places yet) go straight to onboarding,
      // unless they explicitly skipped it before
      if ((data || []).length === 0 && !localStorage.getItem("dpd_onboarding_skipped")) {
        navigate("/onboarding", { replace: true })
        return
      }
      setPlaces(data || [])
      setIsLoading(false)
    })()
  }, [user, navigate])

  // Filter + sort
  const displayedPlaces = useMemo(() => {
    let result = [...places]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.cuisine_type?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q) ||
        p.vibe.some((v) => v.includes(q))
      )
    }
    if (visited === "visited") result = result.filter((p) => p.visited)
    if (visited === "wishlist") result = result.filter((p) => !p.visited)
    if (typeFilter) result = result.filter((p) => p.place_type === typeFilter)
    if (dietFilter !== "all") result = result.filter((p) => p.diet_type === dietFilter)
    if (cityFilter) result = result.filter((p) => p.city?.toLowerCase() === cityFilter.toLowerCase())
    if (vibeFilter.length) result = result.filter((p) => vibeFilter.some((v) => p.vibe.includes(v as never)))
    if (occasionFilter.length) result = result.filter((p) => occasionFilter.some((o) => p.occasion.includes(o as never)))

    // Sort
    if (sortBy === "name_asc") result.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === "recently_visited") result.sort((a, b) => (b.last_visited_at || "").localeCompare(a.last_visited_at || ""))
    else if (sortBy === "wishlist_priority") {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
      result.sort((a, b) => (order[a.wishlist_priority] ?? 3) - (order[b.wishlist_priority] ?? 3))
    }
    else if (sortBy === "budget_low_high") result.sort((a, b) => (a.budget_per_person_max || 9999) - (b.budget_per_person_max || 9999))
    else if (sortBy === "budget_high_low") result.sort((a, b) => (b.budget_per_person_max || 0) - (a.budget_per_person_max || 0))

    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, search, visited, dietFilter, cityFilter, stringifiedVibeFilter, stringifiedOccasionFilter, sortBy])

  // Mood recommender
  const handleMoodSearch = async () => {
    if (!moodInput.trim() || places.length === 0) return
    setMoodLoading(true)
    try {
      const ids = await getMoodRecommendation(moodInput, places)
      setHighlight({ ids })
    } catch (e) {
      console.error(e)
    } finally {
      setMoodLoading(false)
    }
  }

  const cities = [...new Set(places.map((p) => p.city).filter(Boolean))] as string[]
  const placeTypes = [...new Set(places.map((p) => p.place_type).filter(Boolean))] as string[]

  const activeFilterCount = [
    search, visited !== "all" ? visited : "", dietFilter !== "all" ? dietFilter : "",
    typeFilter, cityFilter, ...vibeFilter, ...occasionFilter
  ].filter(Boolean).length

  // "I'm bored!" — outsyd-style: jump to a random place that matches the
  // current filters, preferring ones you haven't visited yet
  const handleImBored = () => {
    const pool = displayedPlaces.length > 0 ? displayedPlaces : places
    if (pool.length === 0) return
    const unvisited = pool.filter((p) => !p.visited)
    const pickFrom = unvisited.length > 0 ? unvisited : pool
    const pick = pickFrom[Math.floor(Math.random() * pickFrom.length)]
    navigate(`/place/${pick.id}`)
  }

  // Skeleton
  const SkeletonCard = () => (
    <div className="rounded-[14px] bg-surface border border-border shadow-card overflow-hidden">
      <div className="h-44 bg-sunken animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-sunken rounded animate-pulse w-3/4" />
        <div className="h-3 bg-sunken rounded animate-pulse w-1/2" />
        <div className="flex gap-1.5 mt-3">
          <div className="h-5 w-14 bg-sunken rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-sunken rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-base font-body text-ink flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-base/80 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <h1 className="font-display text-[20px] font-medium flex items-center gap-2 shrink-0">
          <MapPin className="w-5 h-5 text-accent" />
          <span className="hidden sm:inline">DPD Explores</span>
        </h1>

        <div className="flex-1 relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search by name, cuisine, vibe..."
            className="w-full bg-sunken border border-transparent rounded-md py-2 pl-9 pr-3 text-[14px] text-ink placeholder:text-ink-tertiary focus:border-accent focus:bg-surface focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate("/add")}
            className="flex items-center gap-1.5 text-[13px] font-medium bg-accent text-surface rounded-md px-3 py-2 hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add place</span>
          </button>
          <button
            onClick={() => navigate("/onboarding")}
            className="hidden sm:flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink border border-border rounded-md px-3 py-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Import
          </button>
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || ""}
              className="w-8 h-8 rounded-full border border-border cursor-pointer"
              onClick={handleSignOut}
              title="Click to sign out"
            />
          ) : (
            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-full bg-accent-muted text-accent font-display text-sm flex items-center justify-center"
            >
              {user?.email?.charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto">
        {/* Mood bar */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex gap-2">
            <div className="flex-1 bg-accent-muted rounded-md flex items-center gap-3 px-4 py-3">
              <Sparkles className="h-5 w-5 text-accent shrink-0" />
              <input
                type="text"
                value={moodInput}
                onChange={(e) => { setMoodInput(e.target.value); if (highlight) setHighlight(null) }}
                onKeyDown={(e) => e.key === "Enter" && handleMoodSearch()}
                placeholder="I'm in the mood for..."
                className="flex-1 bg-transparent font-display italic text-[16px] text-ink placeholder:text-ink-secondary outline-none"
              />
              {highlight && (
                <button onClick={() => { setHighlight(null); setMoodInput("") }} className="text-ink-secondary hover:text-ink">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleMoodSearch}
              disabled={moodLoading || !moodInput.trim()}
              className="bg-accent text-surface px-4 rounded-md text-[14px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {moodLoading ? "..." : "Find"}
            </button>
            <button
              onClick={handleImBored}
              disabled={places.length === 0}
              title="Take me somewhere random"
              className="border border-border-strong bg-surface text-ink px-4 rounded-md text-[14px] font-medium hover:border-accent hover:text-accent transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Dices className="w-4 h-4" />
              <span className="hidden sm:inline">I'm bored!</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-0 lg:gap-8 flex-1 px-4 sm:px-6 lg:px-8 pt-5 pb-8">
          {/* Filter Sidebar */}
          <aside className={`
            fixed inset-0 z-40 lg:static lg:block lg:w-[240px] lg:shrink-0
            ${sidebarOpen ? "block" : "hidden"}
          `}>
            {/* Overlay */}
            <div className="fixed inset-0 bg-ink/20 lg:hidden" onClick={() => setSidebarOpen(false)} />

            <div className="relative z-10 h-full lg:h-auto bg-base lg:bg-transparent w-72 lg:w-auto overflow-y-auto p-4 lg:p-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-secondary flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-accent text-surface text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                      {activeFilterCount}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="text-[12px] text-accent hover:text-accent-hover"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-5">
                {/* Status */}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-ink-secondary mb-2 border-b border-border pb-1">Status</p>
                  {["all", "visited", "wishlist"].map((v) => (
                    <label key={v} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${visited === v ? "border-accent bg-accent" : "border-border"}`}>
                        {visited === v && <div className="w-2 h-2 rounded-full bg-surface" />}
                      </div>
                      <span className="text-[13px] text-ink capitalize">{v === "all" ? "All Places" : v}</span>
                    </label>
                  ))}
                </div>

                {/* Category */}
                {placeTypes.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.06em] text-ink-secondary mb-2 border-b border-border pb-1">Category</p>
                    <div className="flex flex-wrap gap-1.5">
                      {placeTypes.map((t) => (
                        <button
                          key={t}
                          onClick={() => setParam("type", typeFilter === t ? "" : t)}
                          className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors ${typeFilter === t
                            ? "bg-accent-muted text-accent-text"
                            : "bg-transparent border border-border text-ink-secondary hover:border-border-strong"
                            }`}
                        >
                          {labelize(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diet */}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-ink-secondary mb-2 border-b border-border pb-1">Diet</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "veg", "nonveg", "both"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setParam("diet", d === "all" ? "" : d)}
                        className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors ${dietFilter === d || (d === "all" && !dietFilter)
                          ? "bg-accent-muted text-accent-text"
                          : "bg-transparent border border-border text-ink-secondary hover:border-border-strong"
                          }`}
                      >
                        {d === "all" ? "All" : d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                {cities.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.06em] text-ink-secondary mb-2 border-b border-border pb-1">City</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cities.slice(0, 8).map((c) => (
                        <button
                          key={c}
                          onClick={() => setParam("city", cityFilter === c ? "" : c)}
                          className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors ${cityFilter === c
                            ? "bg-accent-muted text-accent-text"
                            : "bg-transparent border border-border text-ink-secondary hover:border-border-strong"
                            }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vibe */}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-ink-secondary mb-2 border-b border-border pb-1">Vibe</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["chill", "romantic", "lively", "hidden_gem", "instagrammable", "old_school"].map((v) => {
                      const active = vibeFilter.includes(v)
                      return (
                        <button
                          key={v}
                          onClick={() => {
                            const next = new URLSearchParams(searchParams)
                            if (active) {
                              next.delete("vibe")
                              vibeFilter.filter((x) => x !== v).forEach((x) => next.append("vibe", x))
                            } else {
                              next.append("vibe", v)
                            }
                            setSearchParams(next)
                          }}
                          className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors ${active
                            ? "bg-accent-muted text-accent-text"
                            : "bg-transparent border border-border text-ink-secondary hover:border-border-strong"
                            }`}
                        >
                          {v.replace(/_/g, " ")}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-[13px] text-ink border border-border rounded-md px-3 py-1.5"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && <span className="bg-accent text-surface text-[10px] px-1.5 rounded-full">{activeFilterCount}</span>}
                </button>
                <p className="text-[13px] text-ink-secondary">
                  <span className="font-mono text-ink">{displayedPlaces.length}</span> places
                </p>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-1.5 text-[13px] text-ink border border-border rounded-md px-3 py-1.5 hover:border-border-strong transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort"}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-elevated z-20 w-52 py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setParam("sort", opt.value); setSortOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${sortBy === opt.value ? "text-accent font-medium" : "text-ink hover:bg-sunken"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Load error */}
            {loadError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-[14px] text-red-600">
                Couldn't load your places: {loadError}
              </div>
            )}

            {/* Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayedPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <MapPin className="w-12 h-12 text-ink-tertiary mb-4" />
                <h3 className="font-display text-[20px] text-ink mb-2">No places found</h3>
                <p className="text-[14px] text-ink-secondary mb-6">
                  {places.length === 0
                    ? "Upload a CSV from Google Takeout to get started."
                    : "Try adjusting your filters."}
                </p>
                {places.length === 0 && (
                  <button
                    onClick={() => navigate("/onboarding")}
                    className="bg-accent text-surface px-5 py-2.5 rounded-md text-[14px] font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload CSV
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayedPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    highlighted={
                      highlight
                        ? highlight.ids.includes(place.id)
                        : null
                    }
                  />
                ))}
              </div>
            )}

            {/* Uncategorized CTA */}
            {!isLoading && places.some((p) => !p.categorized) && (
              <div className="mt-8 bg-sunken border border-border rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-ink">
                    {places.filter((p) => !p.categorized).length} places need categorizing
                  </p>
                  <p className="text-[13px] text-ink-secondary">
                    Go through the AI flashcard flow to tag them.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/flashcard")}
                  className="shrink-0 bg-accent text-surface px-4 py-2 rounded-md text-[13px] font-medium hover:bg-accent-hover transition-colors flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5" />
                  Categorize
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
