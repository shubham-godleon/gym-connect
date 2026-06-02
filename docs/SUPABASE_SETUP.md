# Supabase Setup Guide

Supabase provides the PostgreSQL database, authentication, and real-time subscriptions.

## 1. Create Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Name it `gym-connect`, pick a region close to you, set a strong DB password
3. Wait ~2 minutes for provisioning

## 2. Get API Keys

Settings → API → copy:
- **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
- **anon** public key → used in the mobile app
- **service_role** secret key → used in the backend (never expose publicly)

Settings → Database → Connection string → URI tab → copy the full `postgresql://...` string

## 3. Run Database Schema

Go to **SQL Editor** and paste the entire block below, then click Run:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(512),
  home_gym_name VARCHAR(255),
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_checkin_date DATE,
  fcm_token VARCHAR(512),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Friendships
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

-- Checkins (core action — user arrives at the gym)
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_name VARCHAR(255) NOT NULL,
  note VARCHAR(280),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_created_at ON checkins(created_at DESC);

-- Reactions (fist bumps — one per user per checkin)
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(checkin_id, from_user_id)
);

CREATE INDEX idx_reactions_checkin ON reactions(checkin_id);

-- Auto-update updated_at on users
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## 4. Enable Realtime

Dashboard → Database → Replication → enable for:
- `checkins`
- `reactions`

## 5. Configure the Apps

### Mobile (`mobile/.env`)
```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Backend (`backend/src/main/resources/application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres
    username: postgres
    password: your-db-password
```

## Table Summary

| Table | Purpose |
|---|---|
| `users` | Profile, home gym, streak data, FCM token |
| `friendships` | Friend requests (PENDING / ACCEPTED / DECLINED) |
| `checkins` | Core action — user checks into the gym |
| `reactions` | Fist bump on a checkin (one per user per checkin) |

Weekly leaderboard and activity feed are derived from `checkins` + `reactions` via queries — no extra tables needed.
