CREATE TABLE IF NOT EXISTS national_team_photos (
  id SERIAL PRIMARY KEY,
  image_data BYTEA NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE national_team_entries
  ADD COLUMN IF NOT EXISTS photo_id INTEGER REFERENCES national_team_photos(id) ON DELETE SET NULL;

DELETE FROM national_team_entries WHERE age_category = 'u15' AND championship = 'world';
UPDATE national_team_display_settings
SET championship = 'europe', updated_at = now()
WHERE age_category = 'u15' AND championship <> 'europe';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'national_team_entries_u15_europe_only'
      AND conrelid = 'national_team_entries'::regclass
  ) THEN
    ALTER TABLE national_team_entries
      ADD CONSTRAINT national_team_entries_u15_europe_only
      CHECK (age_category <> 'u15' OR championship = 'europe');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'national_team_display_u15_europe_only'
      AND conrelid = 'national_team_display_settings'::regclass
  ) THEN
    ALTER TABLE national_team_display_settings
      ADD CONSTRAINT national_team_display_u15_europe_only
      CHECK (age_category <> 'u15' OR championship = 'europe');
  END IF;
END $$;
