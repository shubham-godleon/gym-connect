# Gym Connect

A mobile app for fitness enthusiasts to connect with friends, track personal records (PRs), and compete on leaderboards.

## Quick Start

```bash
# Clone repo
git clone https://github.com/yourusername/gym-connect.git
cd gym-connect

# Install all dependencies
npm run install:all

# Start backend (Terminal 1)
cd backend && ./mvnw spring-boot:run

# Start mobile app (Terminal 2)
cd mobile && npm start
```

👉 **New to the project?** See [Getting Started Guide](docs/GETTING_STARTED.md)

## Features

✨ **User Authentication**

- Email/password, Google, and Facebook login
- JWT-based API authentication
- Secure token management

👥 **Social**

- Follow and befriend other users
- View friend profiles
- Activity feed of friends' workouts

🏋️ **Personal Records Tracking**

- Log PR attempts for each machine
- Track weight, reps, and date
- View PR history

🏆 **Leaderboards**

- Per-machine rankings among friends
- Real-time leaderboard updates
- Compare your lifts

🔔 **Notifications**

- Instant alerts on friend check-ins
- PR milestones and achievements
- Firebase Cloud Messaging

## Tech Stack

### Frontend

- **React Native** 0.81.5 + **Expo SDK 54**
- **React** 19.1.0
- **Redux Toolkit** 2.0+ with **React Redux** 9.1+ for state management
- **React Navigation** 6.x for routing
- **Supabase** for real-time database & authentication
- **Firebase Cloud Messaging** for notifications
- **TypeScript** 5.6.0+ for type safety

### Backend

- **Spring Boot** 3.2.0
- **Java** 17+
- **PostgreSQL** (via Supabase)
- **JWT** (jjwt 0.12.3) for API authentication
- **Firebase Admin SDK** 9.2.0 for notifications
- **Spring Security** for request protection

### Infrastructure & Services

- **Supabase** - PostgreSQL database, real-time subscriptions, authentication
- **Firebase** - Cloud messaging, cloud functions
- **GitHub** - Version control & CI/CD ready

### Development Requirements

- **Node.js** 20.19.4+ (required for React Native 0.81.5)
- **npm** 11+
- **Java** 17+
- **Git** latest version
- **Xcode** (for iOS development, macOS only)

## Project Structure

```
gym-connect/
├── mobile/              # React Native app (Expo)
├── backend/             # Spring Boot API
├── docs/                # Full documentation
└── README.md
```

## Documentation

- **[Getting Started](docs/GETTING_STARTED.md)** - Setup in 15 minutes
- **[Architecture](docs/ARCHITECTURE.md)** - System design
- **[API Reference](docs/API.md)** - REST endpoints
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Data models
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Dev environment
- **[Supabase Guide](docs/SUPABASE_SETUP.md)** - Database & auth
- **[Firebase Guide](docs/FIREBASE_SETUP.md)** - Notifications
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute

## Key Features

### Home Screen

- Display PRs by machine
- Add/edit PRs
- Quick statistics

### Friends List

- Browse friends
- Add/remove friends
- View friend profiles

### Feed

- Real-time activity stream
- See what friends are doing
- Get notified instantly

### Rankings

- Per-machine leaderboards
- Compare with friends
- Track progress over time

## Development

### Mobile

```bash
cd mobile

# Start Expo
npm start

# Test on iOS
npm run ios

# Run tests
npm test
```

### Backend

```bash
cd backend

# Start server
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build
./mvnw clean package
```

## Configuration

### Mobile `.env`

```env
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=...
FIREBASE_API_KEY=...
API_BASE_URL=http://localhost:8080/api
```

### Backend `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://...
    username: postgres
    password: ...
```

See [ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for full details.

## Database

PostgreSQL on Supabase with:

- `users` - User profiles
- `personal_records` - PR history
- `friendships` - Friend relationships
- `feed_events` - Activity stream
- `machines` - Equipment catalog

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for detailed schema.

## API Endpoints

```
GET    /users/{id}                    # Get user profile
PUT    /users/{id}                    # Update profile
GET    /prs/user/{userId}             # Get user PRs
POST   /prs                           # Create PR
GET    /machines/{machineId}/leaderboard  # Get rankings
GET    /users/{userId}/friends        # Get friends
POST   /users/{userId}/friends/{id}   # Add friend
GET    /users/{userId}/feed           # Get activity feed
```

See [API.md](docs/API.md) for complete documentation.

## Testing

```bash
# Mobile
cd mobile && npm test

# Backend
cd backend && ./mvnw test
```

## Deployment

- **Mobile**: EAS Build → App Store/Play Store
- **Backend**: Docker container → Cloud provider (AWS, GCP, Azure)
- **Database**: Supabase managed PostgreSQL

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Roadmap

- [ ] Authentication flows (Google & Facebook OAuth)
- [ ] PR creation and editing
- [ ] Real-time leaderboards
- [ ] Push notifications
- [ ] Friend suggestions
- [ ] Achievements and badges
- [ ] Workout history analytics
- [ ] Export PR data

## License

MIT

## Support

- 📖 Read the [documentation](docs/)
- 🐛 Report [issues](https://github.com/yourusername/gym-connect/issues)
- 💬 Start a [discussion](https://github.com/yourusername/gym-connect/discussions)

---

**Status**: 🚀 In Initial Development

Built with ❤️ for fitness enthusiasts who want to connect and compete.
