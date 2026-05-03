/**
 * Better Auth Client — React
 * Must import from "better-auth/react" for React hook support
 */

import { createAuthClient } from "better-auth/react"

export const client = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
})

export const { signIn, signOut, signUp } = client
