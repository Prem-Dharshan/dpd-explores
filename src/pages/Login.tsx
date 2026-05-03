/**
 * Login Page
 * Google OAuth + Email/Password sign in and sign up
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn, signUp } from "@/lib/auth-client"
import { useSession } from "@/hooks/useSession"
import { MapPin, Mail, Lock, User } from "lucide-react"

export function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: sessionLoading } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      console.error("Google sign in error:", err)
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      if (isSignUp) {
        const { error } = await signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        })
        if (error) throw new Error(error.message)
        // Auto sign-in is default in Better Auth, redirect handled by reactivity
      } else {
        const { error } = await signIn.email({
          email,
          password,
        })
        if (error) throw new Error(error.message)
        // Success redirect handled by reactivity
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
      console.error("Email auth error:", err)
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

        <div className="bg-surface rounded-xl border border-border-strong shadow-elevated overflow-hidden transition-all duration-300">
          <div className="p-8">
            {error && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {isSignUp && (
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-ink-tertiary" />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-md border border-border-strong bg-sunken py-3 pl-10 pr-4 text-sm placeholder:text-ink-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-ink-tertiary" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-md border border-border-strong bg-sunken py-3 pl-10 pr-4 text-sm placeholder:text-ink-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-ink-tertiary" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-md border border-border-strong bg-sunken py-3 pl-10 pr-4 text-sm placeholder:text-ink-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-ink py-3 text-[15px] font-medium text-surface transition-all duration-200 hover:bg-ink-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In with Email")}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-strong"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-surface px-2 text-ink-tertiary">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-md bg-accent px-4 py-3.5 text-[15px] font-medium text-surface transition-all duration-200 hover:bg-accent-hover hover:-translate-y-[1px] hover:shadow-card disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <svg width="20" height="20" className="flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="mt-6 text-center text-[13.5px] text-ink-secondary">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="font-medium text-accent hover:underline"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[13px] text-ink-tertiary mt-8">
          A well-organised map for a curious mind.
        </p>
      </div>
    </div>
  )
}
