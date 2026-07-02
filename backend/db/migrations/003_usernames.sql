-- Usernames — single unique handle per user.
-- Run in the Supabase SQL editor before starting the backend (ddl-auto: validate).

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- Case-insensitive uniqueness (no two "alex" / "Alex"). Only enforced once set.
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username_lower
  ON users (lower(username)) WHERE username IS NOT NULL;
