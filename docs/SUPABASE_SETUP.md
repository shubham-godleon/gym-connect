# Supabase Integration Guide

Supabase is used for authentication, real-time database, and data storage.

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Choose PostgreSQL database and set a strong password
4. Note your project URL and API keys

### 2. Get API Keys

- In Supabase dashboard, go to Settings > API
- Copy:
  - `Project URL`
  - `anon` key (public key for frontend)
  - `service_role` key (for backend)

### 3. Configure Mobile App

Create `.env` file in `mobile/`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=http://localhost:8080/api
```

### 4. Configure Backend

Create `application.yml` in `backend/src/main/resources/`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://your-project.supabase.co:5432/postgres
    username: postgres
    password: your-password
```

## Database Schema

The following tables need to be created:

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### personal_records

```sql
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  machine_id VARCHAR(255),
  machine_name VARCHAR(255),
  weight DECIMAL(10, 2) NOT NULL,
  reps INTEGER,
  date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prs_user ON personal_records(user_id);
CREATE INDEX idx_prs_machine ON personal_records(machine_id);
```

### friendships

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  friend_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'ACCEPTED',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
```

### feed_events

```sql
CREATE TABLE feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  user_name VARCHAR(255),
  user_photo_url VARCHAR(512),
  type VARCHAR(50),
  machine_id VARCHAR(255),
  machine_name VARCHAR(255),
  pr_weight DECIMAL(10, 2),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feed_user ON feed_events(user_id);
```

### machines

```sql
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  gym_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_machines_name ON machines(name);
```

## Real-Time Features

Enable Realtime for these tables:

1. Go to Supabase Dashboard
2. Navigate to Database > Replication
3. Enable for: `feed_events`, `personal_records`, `friendships`

## Authentication

Supabase handles email/password and OAuth (Google, Facebook):

```typescript
// Email signup
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
});

// Email login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
});
```

## Backup & Migrations

Supabase automatically backs up daily. You can download backups from:

- Settings > Backups in Supabase Dashboard

For local development, use:

```bash
# Export data
pg_dump -h your-project.supabase.co -U postgres > backup.sql

# Import data
psql -h localhost -U postgres < backup.sql
```
