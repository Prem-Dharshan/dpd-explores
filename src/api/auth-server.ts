/**
 * Better Auth Server Configuration
 * This runs on your backend (Vercel Functions, Node.js server, etc.)
 * 
 * Note: This file is for reference. Deploy via Vercel Functions or Express backend.
 */

import { betterAuth } from "better-auth"

import { Pool } from "pg"

/**
 * Better Auth configuration
 * Should be initialized on your backend server/function
 */
export const getBetterAuthConfig = () => {
  if (typeof process === "undefined") {
    throw new Error("Auth server must run in Node.js environment")
  }
  
  // Suppress the self-signed cert error for local dev with Supabase
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  return {
    database: new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
    },
    secret: process.env.BETTER_AUTH_SECRET || "",
    baseURL: process.env.VITE_APP_URL || process.env.VERCEL_URL || "http://localhost:5173",
    trustedOrigins: [process.env.VITE_APP_URL || "http://localhost:5173"],
  }
}

// Initialize auth with config
export const auth = betterAuth(getBetterAuthConfig())
