# Quick Reference Guide

## Version Info

| Technology    | Version  | Notes                             |
| ------------- | -------- | --------------------------------- |
| Node.js       | 20.19.4+ | Required for React Native 0.81.5  |
| React         | 19.1.0   | Latest stable                     |
| React Native  | 0.81.5   | Requires Node.js 20.19.4+         |
| Expo          | 54.0.0   | SDK 54                            |
| Redux Toolkit | 2.0+     | Latest with React 19 support      |
| React Redux   | 9.1+     | Latest with useSelector.withTypes |
| Spring Boot   | 3.2.0    | Java 17 required                  |
| Java          | 17+      | For Spring Boot                   |
| TypeScript    | 5.6.0+   | For mobile and type safety        |

## Commands Cheat Sheet

### Mobile (React Native)

```bash
npm start              # Start Expo dev server
npx expo start -c      # Start with cleared bundler cache (recommended after updates)
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm test               # Run tests
npm run lint           # Run ESLint
npm run build          # Build production
```

### Backend (Spring Boot)

```bash
./mvnw spring-boot:run              # Run dev server
./mvnw test                         # Run tests
./mvnw clean install                # Build project
./mvnw format:format                # Format code
./mvnw clean package                # Build JAR
java -jar target/api-1.0.0.jar      # Run JAR
```

### Database (PostgreSQL)

```bash
psql -U postgres -d gym_connect      # Connect to DB
\dt                                  # List tables
\d personal_records                  # Describe table
SELECT * FROM users;                 # Query data
```

## Environment Files

### Mobile `.env`

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
FIREBASE_API_KEY=...
GOOGLE_IOS_CLIENT_ID=...
API_BASE_URL=http://localhost:8080/api
```

### Backend `application.yml`

```yaml
spring.datasource.url=jdbc:postgresql://...
spring.datasource.username=...
spring.datasource.password=...
jwt.secret=...
firebase.credentials.path=...
```

## Key File Locations

| File                                                      | Purpose                |
| --------------------------------------------------------- | ---------------------- |
| `mobile/App.tsx`                                          | Mobile app entry point |
| `mobile/src/navigation/Navigator.tsx`                     | Tab navigation setup   |
| `mobile/src/store/index.ts`                               | Redux store config     |
| `backend/src/main/java/.../GymConnectApiApplication.java` | Backend entry point    |
| `backend/pom.xml`                                         | Maven dependencies     |
| `backend/src/main/resources/application.yml`              | Backend config         |
| `docs/ARCHITECTURE.md`                                    | System design          |
| `docs/API.md`                                             | API documentation      |

## Key Services

### Supabase

- **URL**: https://supabase.com
- **Purpose**: Authentication, PostgreSQL database, real-time
- **Config**: `.env` for mobile, `application.yml` for backend

### Firebase

- **URL**: https://firebase.google.com
- **Purpose**: Push notifications, analytics
- **Config**: Service account JSON, Google OAuth

### Google Sign-In

- **URL**: https://console.cloud.google.com
- **Purpose**: OAuth authentication
- **Config**: iOS/Android client IDs in `.env`

## API Endpoints (Port 8080)

| Method | Endpoint                   | Purpose           |
| ------ | -------------------------- | ----------------- |
| GET    | /users/{id}                | Get user profile  |
| PUT    | /users/{id}                | Update profile    |
| GET    | /prs/user/{id}             | Get user PRs      |
| POST   | /prs                       | Create PR         |
| GET    | /machines/{id}/leaderboard | Get rankings      |
| GET    | /users/{id}/friends        | Get friends       |
| POST   | /users/{id}/friends/{fid}  | Add friend        |
| GET    | /users/{id}/feed           | Get activity feed |

## Database Tables

| Table              | Purpose                |
| ------------------ | ---------------------- |
| `users`            | User profiles and auth |
| `personal_records` | PR history             |
| `friendships`      | Friend relationships   |
| `feed_events`      | Activity stream        |
| `machines`         | Equipment catalog      |

## Port Numbers

- **Mobile**: 19000 (Expo) / Device
- **Backend**: 8080 (REST API)
- **Database**: 5432 (PostgreSQL)
- **Firebase**: N/A (cloud service)

## Directory Structure

```
gym-connect/
├── mobile/
│   ├── src/
│   │   ├── screens/      # UI screens
│   │   ├── components/   # Reusable components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API, auth, notifications
│   │   └── types/        # TypeScript types
│   ├── app.json          # Expo config
│   └── package.json
├── backend/
│   ├── src/main/java/com/gymconnect/api/
│   │   ├── config/       # Spring config
│   │   ├── controller/   # REST endpoints
│   │   ├── service/      # Business logic
│   │   ├── repository/   # Data access
│   │   ├── entity/       # JPA entities
│   │   └── dto/          # DTOs
│   ├── pom.xml
│   └── src/main/resources/
├── docs/
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   ├── SUPABASE_SETUP.md
│   ├── FIREBASE_SETUP.md
│   └── CONTRIBUTING.md
└── README.md
```

## Common Errors & Fixes

| Error                        | Solution                                     |
| ---------------------------- | -------------------------------------------- |
| "Cannot find module"         | Run `npm install`                            |
| "Port 8080 in use"           | Kill process: `lsof -i :8080; kill -9 <PID>` |
| "Database connection failed" | Check Supabase URL and credentials           |
| "Expo not found"             | Install: `npm install -g expo-cli`           |
| "Java not found"             | Install Java 17, set JAVA_HOME               |
| "npm version mismatch"       | Run `npm install` to sync                    |

## Performance Tips

- Use Redux DevTools browser extension
- Enable Hermes in React Native
- Use database indexes
- Lazy-load features
- Batch API calls
- Cache API responses

## Useful Links

- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Supabase Docs**: https://supabase.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Redux Docs**: https://redux.js.org/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

## GitHub Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: describe change"

# Push and create PR
git push origin feature/my-feature
```

## Testing

```bash
# Mobile unit tests
cd mobile && npm test

# Backend unit tests
cd backend && ./mvnw test

# With coverage
./mvnw jacoco:report
```

## Debugging

### Mobile

- Use React DevTools browser extension
- Use Expo DevTools (Ctrl+D)
- Check console in Expo Go app

### Backend

- Use Spring Boot DevTools
- Check logs in console
- Use IDE debugger (breakpoints)

## Roles & Responsibilities

- **Frontend**: React Native, UI/UX, state management
- **Backend**: Spring Boot, databases, APIs
- **DevOps**: Deployment, CI/CD, infrastructure
- **QA**: Testing, bug reporting
