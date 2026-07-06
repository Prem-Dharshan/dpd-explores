-- DPD Explores — one-shot database setup
-- Paste this whole file into the Supabase SQL Editor of your (new) project and run it.
-- It creates the Better Auth tables + the app schema. Idempotent (safe to re-run).
--
-- After running:
--   1. Update .env: DATABASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
--      (DATABASE_URL = "Session pooler" connection string from Supabase → Connect)
--   2. Mirror the same vars in Vercel project settings (plus VITE_GMAPS_API_KEY).
--
-- NOTE on RLS: this app authenticates with Better Auth (not Supabase Auth) and
-- talks to these tables with the anon key, so RLS policies based on auth.uid()
-- won't work. Tables are left with RLS disabled — do not enable it without
-- adding a different authorization strategy.

-- ─── Better Auth tables ─────────────────────────────────────
create table if not exists "user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create table if not exists "session" (
  "id" text not null primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user" ("id") on delete cascade
);

create table if not exists "account" (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null
);

create table if not exists "verification" (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create index if not exists "session_userId_idx" on "session" ("userId");
create index if not exists "account_userId_idx" on "account" ("userId");
create index if not exists "verification_identifier_idx" on "verification" ("identifier");

-- ─── App schema ─────────────────────────────────────────────
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,

  -- Identity
  name text not null,
  gmaps_url text,
  place_id text,
  source text default 'csv',

  -- Location
  address text,
  city text,
  area text,
  lat numeric,
  lng numeric,

  -- Classification
  place_type text,
  cuisine_type text,
  cuisine_tags text[] default '{}',
  diet_type text default 'both',
  alcohol_served text default 'unknown',
  price_range text,
  budget_per_person_min int,
  budget_per_person_max int,

  -- Personal notes (from CSV)
  notes text,
  comment text,

  -- Curated content
  signature_dishes text[] default '{}',
  best_dishes text[] default '{}',
  dishes_to_avoid text[] default '{}',
  must_try text,
  menu_link text,
  instagram_handle text,

  -- Occasion & Vibe
  occasion text[] default '{}',
  best_for_time text[] default '{}',
  ambience text[] default '{}',
  vibe text[] default '{}',

  -- Practical
  accepts_reservations boolean,
  reservation_link text,
  opening_hours jsonb,
  phone_number text,

  -- Photos (Google Maps photo references)
  photo_references text[] default '{}',

  -- Visit status
  visited boolean default false,
  visited_count int default 0,
  first_visited_at timestamptz,
  last_visited_at timestamptz,
  would_return boolean,
  wishlist_priority text default 'medium',

  -- State
  categorized boolean default false,
  held_for_review boolean default false,
  active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists place_lists (
  place_id uuid references places(id) on delete cascade,
  list_id uuid references lists(id) on delete cascade,
  primary key (place_id, list_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id) on delete cascade,
  user_id text not null,
  visited_at timestamptz,
  bill_amount int,
  visited_with text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  category text not null,
  score int check (score >= 1 and score <= 10)
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id) on delete cascade,
  tag text not null
);

create index if not exists idx_places_user_id on places(user_id);
create index if not exists idx_places_city on places(city);
create index if not exists idx_places_categorized on places(categorized);
create index if not exists idx_places_visited on places(visited);
create index if not exists idx_places_held_for_review on places(held_for_review);
