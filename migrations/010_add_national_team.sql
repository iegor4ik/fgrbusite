CREATE TABLE IF NOT EXISTS national_team_years (
  year INTEGER PRIMARY KEY CHECK (year BETWEEN 1900 AND 2200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS national_team_entries (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL REFERENCES national_team_years(year) ON DELETE CASCADE,
  age_category TEXT NOT NULL CHECK (age_category IN ('adult', 'u23', 'u20', 'u17', 'u15')),
  championship TEXT NOT NULL CHECK (championship IN ('europe', 'world')),
  member_type TEXT NOT NULL CHECK (member_type IN ('athlete', 'coach')),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  birth_date DATE,
  city TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS national_team_entries_lookup
  ON national_team_entries (year, age_category, championship, member_type, sort_order, id);
CREATE UNIQUE INDEX IF NOT EXISTS national_team_entries_position_unique
  ON national_team_entries (year, age_category, championship, member_type, sort_order);

CREATE TABLE IF NOT EXISTS national_team_display_settings (
  age_category TEXT PRIMARY KEY CHECK (age_category IN ('adult', 'u23', 'u20', 'u17', 'u15')),
  year INTEGER NOT NULL REFERENCES national_team_years(year) ON DELETE RESTRICT,
  championship TEXT NOT NULL CHECK (championship IN ('europe', 'world')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO national_team_years (year) VALUES (2026)
ON CONFLICT (year) DO NOTHING;

INSERT INTO national_team_display_settings (age_category, year, championship)
VALUES
  ('adult', 2026, 'europe'),
  ('u23', 2026, 'europe'),
  ('u20', 2026, 'europe'),
  ('u17', 2026, 'europe'),
  ('u15', 2026, 'europe')
ON CONFLICT (age_category) DO NOTHING;
