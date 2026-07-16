/**
 * Better Auth Server Configuration
 * Used by both Vite dev middleware and Vercel Serverless Functions
 */

import { betterAuth } from "better-auth"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const baseURL = process.env.BETTER_AUTH_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173")

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL,
  trustedOrigins: [
    "http://localhost:5173",
    "https://dpd-explores.vercel.app",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
})
