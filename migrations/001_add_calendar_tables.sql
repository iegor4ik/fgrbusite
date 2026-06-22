-- Migration: Add calendar_years and calendar_events tables
-- This script creates the tables needed for the new calendar management feature.

CREATE TABLE IF NOT EXISTS calendar_years (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  pdf_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  calendar_year_id INTEGER NOT NULL REFERENCES calendar_years(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('міжнародне', 'національне', 'чемпіонат')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  regulation_pdf TEXT,
  results_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
