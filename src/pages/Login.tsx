/**
 * Login Page
 * Google OAuth login with "Continue with Google" button
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn } from "@/lib/auth-client"
import { useSession } from "@/hooks/useSession"
import { MapPin, Sparkles, Navigation, Search } from "lucide-react"

export function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: sessionLoading } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !sessionLoading) {
    navigate("/", { replace: true })
    return null
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await signIn.social({
        provider: "google",
        callbackURL: "/",
      })

      if (response?.error) {
        setError(response.error.message || "Failed to connect to authentication server")
        setIsLoading(false)
        return
      }

      // If successful, better-auth will automatically redirect to Google.
      // We keep isLoading true while the redirect happens.
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      console.error("Google sign in error:", err)
      setIsLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 relative overflow-hidden font-body text-ink">
      {/* Subtle background decoration to make it feel like a map/journal */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px', color: '#1C1917' }}>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border shadow-card mb-6">
            <MapPin className="w-8 h-8 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl text-ink mb-3 tracking-tight">DPD Explores</h1>
          <p className="text-ink-secondary text-base font-body max-w-sm mx-auto leading-relaxed">
            A personal journal that thinks. Discover, categorize, and remember the places you love.
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border-strong shadow-elevated overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-md bg-accent px-4 py-3.5 text-[15px] font-medium text-surface transition-all duration-200 hover:bg-accent-hover hover:-translate-y-[1px] hover:shadow-card disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-surface border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    className="flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-sunken border-t border-border p-6 sm:px-8">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-secondary mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border-strong opacity-40"></span>
              The Experience
              <span className="h-px flex-1 bg-border-strong opacity-40"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
                  <Navigation className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-ink">Import from Maps</p>
                  <p className="text-[13px] text-ink-secondary mt-0.5">Bring your saved places from Google Takeout</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
                  <Sparkles className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-ink">AI Categorization</p>
                  <p className="text-[13px] text-ink-secondary mt-0.5">Automatically tag places with vibes and cuisines</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
                  <Search className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-ink">Find exactly what you want</p>
                  <p className="text-[13px] text-ink-secondary mt-0.5">Mood-based search when you don't know where to go</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-[13px] text-ink-tertiary mt-8">
          A well-organised map for a curious mind.
        </p>
      </div>
    </div>
  )
}
