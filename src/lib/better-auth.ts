/**
 * Better Auth setup
 * Google OAuth + session management
 */

// This file will be used on the server-side (via API routes)
// For client-side, use useSession() hook from Better Auth

export const getBetterAuthConfig = () => ({
  database: {
    provider: "postgresql",
    url: import.meta.env.DATABASE_URL,
  },
  socialProviders: {
    google: {
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    },
  },
})
