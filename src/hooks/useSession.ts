/**
 * Session Hook
 * Uses client.useSession() — the React hook from better-auth/react client
 */

import { client } from "@/lib/auth-client"

export function useSession() {
  const { data, isPending, error } = client.useSession()
  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isLoading: isPending,
    error,
    isAuthenticated: !!data?.user,
  }
}
