# Gym Connect - Architecture Overview

## Project Structure

```
gym-connect/
├── mobile/                      # React Native + Expo
│   ├── src/
│   │   ├── screens/            # App screens
│   │   ├── components/         # Reusable components
│   │   ├── navigation/         # Navigation setup
│   │   ├── store/              # Redux store & slices
│   │   ├── services/           # API, Supabase, Firebase
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utilities
│   ├── App.tsx                 # Entry point
│   ├── app.json                # Expo config
│   └── package.json
│
├── backend/                     # Spring Boot API
│   ├── src/main/java/com/gymconnect/api/
│   │   ├── config/             # Spring Boot config
│   │   ├── controller/         # REST endpoints
│   │   ├── service/            # Business logic
│   │   ├── repository/         # Data access
│   │   ├── entity/             # JPA entities
│   │   ├── dto/                # Data transfer objects
│   │   └── security/           # JWT & auth
│   ├── src/main/resources/
│   │   └── application.yml     # Configuration
│   ├── pom.xml                 # Maven config
│   └── README.md
│
├── docs/                        # Documentation
│   ├── ENVIRONMENT_SETUP.md    # Dev environment setup
│   ├── SUPABASE_SETUP.md       # Supabase configuration
│   ├── FIREBASE_SETUP.md       # Firebase notifications
│   ├── API.md                  # API endpoints
│   └── DATABASE_SCHEMA.md      # Database design
│
└── README.md                    # Project overview
```

## Tech Stack

### Frontend

- **Framework**: React Native 0.81.5 with Expo SDK 54.0.0
- **React**: 19.1.0
- **State Management**: Redux Toolkit 2.0+ with Redux 5.0+, React Redux 9.1+
- **Navigation**: React Navigation 6.x (@react-navigation/native, @react-navigation/native-stack, @react-navigation/bottom-tabs)
- **Real-time**: Supabase subscriptions
- **Notifications**: Expo Notifications + Firebase Cloud Messaging
- **Auth**: Supabase Auth (Email + OAuth)
- **TypeScript**: 5.6.0+

### Backend

- **Framework**: Spring Boot 3.2.0
- **Java**: 17+
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (jjwt 0.12.3)
- **Notifications**: Firebase Admin SDK 9.2.0
- **API**: RESTful with Spring Web

### Infrastructure

- **Database**: Supabase (PostgreSQL + Real-time)
- **Notifications**: Firebase Cloud Messaging
- **Auth**: Supabase Auth + Firebase Auth
- **Hosting**: (Ready for AWS, Azure, GCP)

## Data Flow

### Authentication Flow

1. User signs up/logs in via mobile app
2. Supabase Auth handles authentication
3. Returns JWT token to mobile app
4. Mobile app stores token in Redux + SecureStorage
5. Token sent with each API request

### PR Creation Flow

1. User records a PR in Home screen
2. Request sent to backend `/prs` endpoint
3. Backend saves to PostgreSQL via Supabase
4. Supabase triggers real-time event
5. Firebase notification sent to friends
6. Friends' feeds updated in real-time

### Leaderboard Flow

1. User views Rankings tab
2. Frontend fetches user's friend IDs
3. Backend queries top PRs for machine (among friends)
4. Results ranked and returned
5. User sees per-machine rankings

### Feed Updates

1. Friend performs action (check-in or PR)
2. Supabase triggers `feed_events` update
3. Real-time subscription notifies followers
4. Feed screen updates with new event
5. Notification sent (if enabled)

## Database Design

**Core Entities**:

- `users`: User profiles
- `personal_records`: PR history
- `friendships`: Friend relationships
- `feed_events`: Activity stream
- `machines`: Equipment catalog

**Key Relationships**:

- User has many PRs
- User has many friendships (bidirectional)
- Friend sees each other's PRs and activities
- PR creates feed event for followers

**Indexes**:

- `user_id` on personal_records, feed_events
- `machine_id` on personal_records
- `(user_id, friend_id)` on friendships (unique)

## API Endpoints

**User Management**:

- `GET /users/{id}` - Get profile
- `PUT /users/{id}` - Update profile
- `POST /users` - Create user

**Personal Records**:

- `GET /prs/user/{userId}` - Get PRs
- `POST /prs` - Create PR
- `GET /machines/{machineId}/leaderboard` - Get rankings

**Social**:

- `GET /users/{userId}/friends` - Get friends
- `POST /users/{userId}/friends/{friendId}` - Add friend
- `DELETE /users/{userId}/friends/{friendId}` - Remove friend

**Activity**:

- `GET /users/{userId}/feed` - Get feed
- `POST /users/{userId}/check-ins` - Check-in

## Real-Time Features

### Supabase Real-time

- Updates to `personal_records` trigger leaderboard refresh
- Updates to `feed_events` stream new activities
- Updates to `friendships` sync friend lists

### Firebase Push Notifications

- Instant alerts on friend check-in
- PR milestone notifications
- Leaderboard changes (optional)
- Configurable per user

## Security

### Frontend

- JWT token stored in secure storage (Keychain/Keystore)
- Token refreshed before expiry
- API requests authenticated via Authorization header

### Backend

- Spring Security validates JWT
- CORS configured for mobile domain
- Sensitive endpoints require authentication
- Firebase service account secured

### Database

- Supabase handles row-level security
- User data isolated per user
- Public read access only where needed

## Scalability Considerations

**Current State**:

- Single backend instance
- Supabase managed PostgreSQL
- Firebase Cloud Messaging
- Real-time subscriptions for all events

**Future Improvements**:

- API horizontal scaling
- WebSocket for real-time updates
- Redis caching layer
- Event queuing (Kafka/RabbitMQ)
- CDN for assets

## Development Workflow

1. **Feature Branch**

   ```bash
   git checkout -b feature/description
   ```

2. **Mobile Development**

   ```bash
   cd mobile
   npm start
   ```

3. **Backend Development**

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

4. **Testing**
   - Frontend: `npm test`
   - Backend: `./mvnw test`

5. **Pull Request**
   - Provide clear description
   - Link to issues
   - Ensure all tests pass

6. **Deployment** (Future)
   - Mobile: EAS Build → App Store/Google Play
   - Backend: Docker → Cloud provider
