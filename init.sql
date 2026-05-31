-- Competition Calendar SQL migration
-- Run this against the PostgreSQL database to create the required tables.

CREATE TABLE IF NOT EXISTS competitions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Ukraine', 'International')),
  event_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'planned', 'live')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competition_weight_categories (
  id SERIAL PRIMARY KEY,
  competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  weight_name TEXT NOT NULL,
  bracket_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
