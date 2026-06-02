# Database Schema

## Tables Overview

### users

Stores user profile information.

```
┌─────────────────┬──────────────┬─────────────────┐
│ Column          │ Type         │ Constraint      │
├─────────────────┼──────────────┼─────────────────┤
│ id              │ UUID         │ PRIMARY KEY     │
│ email           │ VARCHAR(255) │ UNIQUE, NOT NULL│
│ display_name    │ VARCHAR(255) │ NOT NULL        │
│ photo_url       │ VARCHAR(512) │                 │
│ created_at      │ TIMESTAMP    │ DEFAULT NOW()   │
│ updated_at      │ TIMESTAMP    │ DEFAULT NOW()   │
└─────────────────┴──────────────┴─────────────────┘
```

### personal_records

Stores user personal records for each machine.

```
┌────────────────┬──────────────┬──────────────────┐
│ Column         │ Type         │ Constraint       │
├────────────────┼──────────────┼──────────────────┤
│ id             │ UUID         │ PRIMARY KEY      │
│ user_id        │ UUID         │ FK → users       │
│ machine_id     │ VARCHAR(255) │                  │
│ machine_name   │ VARCHAR(255) │                  │
│ weight         │ DECIMAL      │ NOT NULL         │
│ reps           │ INTEGER      │                  │
│ date           │ TIMESTAMP    │ NOT NULL         │
│ created_at     │ TIMESTAMP    │ DEFAULT NOW()    │
└────────────────┴──────────────┴──────────────────┘
```

### friendships

Stores friendship relationships between users.

```
┌────────────────┬──────────────┬──────────────────┐
│ Column         │ Type         │ Constraint       │
├────────────────┼──────────────┼──────────────────┤
│ id             │ UUID         │ PRIMARY KEY      │
│ user_id        │ UUID         │ FK → users       │
│ friend_id      │ UUID         │ FK → users       │
│ status         │ VARCHAR(50)  │ DEFAULT ACCEPTED │
│ created_at     │ TIMESTAMP    │ DEFAULT NOW()    │
│ (user_id, friend_id) │      │ UNIQUE            │
└────────────────┴──────────────┴──────────────────┘
```

### feed_events

Stores activity feed events (check-ins, PRs).

```
┌─────────────────┬──────────────┬──────────────────┐
│ Column          │ Type         │ Constraint       │
├─────────────────┼──────────────┼──────────────────┤
│ id              │ UUID         │ PRIMARY KEY      │
│ user_id         │ UUID         │ FK → users       │
│ user_name       │ VARCHAR(255) │                  │
│ user_photo_url  │ VARCHAR(512) │                  │
│ type            │ VARCHAR(50)  │ (CHECKIN, PR)    │
│ machine_id      │ VARCHAR(255) │                  │
│ machine_name    │ VARCHAR(255) │                  │
│ pr_weight       │ DECIMAL      │                  │
│ timestamp       │ TIMESTAMP    │ DEFAULT NOW()    │
└─────────────────┴──────────────┴──────────────────┘
```

### machines

Stores gym equipment information.

```
┌────────────────┬──────────────┬──────────────────┐
│ Column         │ Type         │ Constraint       │
├────────────────┼──────────────┼──────────────────┤
│ id             │ UUID         │ PRIMARY KEY      │
│ name           │ VARCHAR(255) │ NOT NULL         │
│ category       │ VARCHAR(100) │                  │
│ gym_id         │ VARCHAR(255) │                  │
│ created_at     │ TIMESTAMP    │ DEFAULT NOW()    │
└────────────────┴──────────────┴──────────────────┘
```

## Relationships

```
users (1) ──→ (N) personal_records
users (1) ──→ (N) friendships (user_id)
users (1) ──→ (N) friendships (friend_id)
users (1) ──→ (N) feed_events
machines (1) ──→ (N) personal_records
```

## Indexes

```sql
CREATE INDEX idx_prs_user ON personal_records(user_id);
CREATE INDEX idx_prs_machine ON personal_records(machine_id);
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_feed_user ON feed_events(user_id);
CREATE INDEX idx_machines_name ON machines(name);
```

## Queries

### Get user's PRs

```sql
SELECT * FROM personal_records
WHERE user_id = :userId
ORDER BY created_at DESC;
```

### Get friends

```sql
SELECT u.* FROM users u
INNER JOIN friendships f ON u.id = f.friend_id
WHERE f.user_id = :userId AND f.status = 'ACCEPTED';
```

### Get leaderboard for machine

```sql
SELECT
  pr.user_id,
  u.display_name,
  u.photo_url,
  MAX(pr.weight) as max_weight,
  ROW_NUMBER() OVER (ORDER BY MAX(pr.weight) DESC) as rank
FROM personal_records pr
INNER JOIN users u ON pr.user_id = u.id
WHERE pr.machine_id = :machineId
  AND pr.user_id = ANY(:friendIds)
GROUP BY pr.user_id, u.id
ORDER BY max_weight DESC;
```

### Get feed for user

```sql
SELECT f.* FROM feed_events f
INNER JOIN friendships fr ON f.user_id = fr.friend_id
WHERE fr.user_id = :userId AND fr.status = 'ACCEPTED'
ORDER BY f.timestamp DESC
LIMIT :limit;
```

## Views (Optional)

### user_pr_stats

```sql
CREATE VIEW user_pr_stats AS
SELECT
  user_id,
  machine_id,
  machine_name,
  MAX(weight) as pr_weight,
  COUNT(*) as total_workouts,
  MAX(date) as last_workout
FROM personal_records
GROUP BY user_id, machine_id, machine_name;
```

### machine_rankings

```sql
CREATE VIEW machine_rankings AS
SELECT
  u.id as user_id,
  u.display_name,
  u.photo_url,
  pr.machine_id,
  pr.machine_name,
  MAX(pr.weight) as weight,
  ROW_NUMBER() OVER (PARTITION BY pr.machine_id ORDER BY MAX(pr.weight) DESC) as rank
FROM personal_records pr
INNER JOIN users u ON pr.user_id = u.id
GROUP BY u.id, pr.machine_id, pr.machine_name;
```
