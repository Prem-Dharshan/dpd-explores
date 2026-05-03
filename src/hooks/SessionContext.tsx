/**
 * Session Storage Context
 * Note: Better Auth handles session management internally
 * This file serves as a reference for accessing session data
 */

import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { client } from "@/lib/auth-client"

interface User {
  id: string
  email: string
  name?: string
  image?: string | null
}

interface SessionContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending, error } = client.useSession()

  const value: SessionContextType = {
    user: sessionData?.user || null,
    isLoading: isPending,
    isAuthenticated: !!sessionData?.user,
    error: error as Error | null,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider")
  }
  return context
}
