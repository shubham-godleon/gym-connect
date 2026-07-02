-- Gym Communities — Stage 1 schema
-- Run in the Supabase SQL editor before starting the backend (ddl-auto: validate).

CREATE TABLE IF NOT EXISTS gyms (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  address            TEXT,
  lat                DOUBLE PRECISION NOT NULL,
  lng                DOUBLE PRECISION NOT NULL,
  radius_meters      INTEGER NOT NULL DEFAULT 120,      -- geofence footprint
  source             TEXT NOT NULL,                     -- MAPPLS | MANUAL
  mappls_place_id    TEXT,                              -- dedup key for MAPPLS gyms
  qr_token           TEXT NOT NULL UNIQUE,              -- deep-link token on the QR
  location_status    TEXT NOT NULL DEFAULT 'CONFIRMED', -- PROVISIONAL | CONFIRMED
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at         TIMESTAMP NOT NULL
);

-- One gym per Mappls POI (dedup for Case B). Partial index: only enforced when set.
CREATE UNIQUE INDEX IF NOT EXISTS ux_gyms_mappls_place_id
  ON gyms (mappls_place_id) WHERE mappls_place_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS gym_memberships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id     UUID NOT NULL REFERENCES gyms(id),
  user_id    UUID NOT NULL REFERENCES users(id),
  joined_at  TIMESTAMP NOT NULL,
  visible    BOOLEAN NOT NULL DEFAULT TRUE,             -- visible-with-opt-out
  UNIQUE (gym_id, user_id)
);

-- Check-ins gain a gym link + verified flag (true only when the geofence passed).
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES gyms(id);
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE;
