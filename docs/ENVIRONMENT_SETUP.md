# Environment Setup Guide

Complete setup instructions for Gym Connect development.

## Prerequisites

### Global Requirements

- **Node.js**: 20.19.4+ (required for React Native 0.81.5 compatibility)
- **npm**: 11+ (bundled with Node.js)
- **Java**: 17+ (for Spring Boot)
- **Git**: Latest version
- **Xcode**: Latest version (for iOS development on macOS)

### Install Node.js

```bash
# macOS (using Homebrew)
brew install node

# Windows
# Download from nodejs.org

# Verify
node --version
npm --version
```

### Install Java 17

```bash
# macOS
brew install openjdk@17

# Windows
# Download from oracle.com or use:
choco install openjdk17

# Verify
java -version
```

## Project Setup

### Clone Repository

```bash
git clone https://github.com/yourusername/gym-connect.git
cd gym-connect
```

### Install Expo CLI

```bash
npm install -g expo-cli
```

### Install Mobile Dependencies

```bash
cd mobile
npm install
```

### Install Backend Dependencies

```bash
cd ../backend
./mvnw clean install
```

## Environment Files

### Mobile `.env` file

Create `.env` in `mobile/` directory:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Firebase
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Google Sign-In
GOOGLE_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id

# Facebook
FACEBOOK_APP_ID=your-facebook-app-id

# API
API_BASE_URL=http://localhost:8080/api
```

### Backend `application.yml`

Create `backend/src/main/resources/application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gym_connect
    username: postgres
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update

jwt:
  secret: your-local-dev-secret-key-change-in-prod
  expiration: 86400000

firebase:
  credentials:
    path: classpath:firebase-service-account.json

logging:
  level:
    com.gymconnect: DEBUG
```

## Services Setup

### PostgreSQL with Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string from Project Settings > Database
4. Update database URL in `application.yml`

### Firebase

1. Create project at [firebase.google.com](https://firebase.google.com)
2. Download service account key
3. Place in `backend/src/main/resources/firebase-service-account.json`
4. Add Google OAuth credentials to Firebase

### Google Sign-In

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add iOS/Android bundle IDs
4. Copy credentials to `.env`

### Facebook

1. Create app at [developers.facebook.com](https://developers.facebook.com)
2. Add iOS/Android platforms
3. Copy App ID to `.env`

## Database Setup

### Using Supabase

1. Go to Supabase Dashboard
2. Run SQL migrations in SQL Editor:
   - See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for schema

### Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql  # macOS
choco install postgresql  # Windows

# Start service
brew services start postgresql

# Create database
createdb gym_connect

# Connect
psql -U postgres -d gym_connect
```

## Running the App

### Mobile Development

```bash
cd mobile

# Start Expo dev server
npm start

# Test on iOS
npm run ios

# Or scan QR code with Expo Go app
```

### Backend Development

```bash
cd backend

# Run with dev profile
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Or
./mvnw spring-boot:run
```

## Verify Setup

### Mobile App

```bash
cd mobile
npx expo doctor
npm test
```

### Backend

```bash
cd backend
./mvnw test
curl http://localhost:8080/api/users
```

## Troubleshooting

### Port Already in Use

```bash
# macOS/Linux: Kill process on port 8080
lsof -i :8080
kill -9 <PID>

# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Node Modules Issues

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Java Compiler Errors

```bash
# Ensure Java 17
java -version

# Update JAVA_HOME
export JAVA_HOME=/path/to/java-17
```

### Expo Build Cache

```bash
expo start --clear
```

## IDE Setup

### VS Code Extensions

- **Java Extension Pack** (for Spring Boot)
- **Expo Tools**
- **ES7+ React/Redux/React-Native snippets**
- **Prettier**
- **ESLint**

### Settings

Create `.vscode/settings.json` in root:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": true,
  "maven.executable.path": "/usr/local/opt/maven/bin/mvn",
  "java.home": "/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home"
}
```

## Next Steps

1. Complete Supabase setup: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
2. Complete Firebase setup: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
3. Review Database schema (included in SUPABASE_SETUP.md)
4. Start developing features
