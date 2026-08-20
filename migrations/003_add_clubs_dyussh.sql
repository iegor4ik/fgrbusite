CREATE TABLE IF NOT EXISTS clubs_dyussh (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  photo TEXT NOT NULL,
  city TEXT,
  gym_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  trainers JSONB NOT NULL DEFAULT '[]'::jsonb,
  contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clubs_dyussh
  ADD COLUMN IF NOT EXISTS contacts JSONB NOT NULL DEFAULT '[]'::jsonb;
