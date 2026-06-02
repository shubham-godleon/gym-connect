# Getting Started with Gym Connect

Welcome to Gym Connect! This guide will get you up and running in 15 minutes.

## Quick Start (5 minutes)

### Prerequisites

- Node.js 20.19.4+ (required for React Native 0.81.5)
- Java 17+
- Git
- Expo CLI (will install with npm)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/gym-connect.git
cd gym-connect

# Install dependencies
npm run install:all
```

### 2. Configure Environment

#### Mobile App

```bash
cd mobile
cp .env.example .env
# Edit .env with your credentials
```

#### Backend

```bash
cd ../backend
cp application.yml.example src/main/resources/application.yml
# Edit with database credentials
```

### 3. Start Services

**Terminal 1 - Backend**:

```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2 - Mobile**:

```bash
cd mobile
npm start
# Press 'i' for iOS or scan QR code
```

## Setup Next Steps (10 minutes)

### 1. Supabase Setup

- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy project URL and API key to `.env`

See [SUPABASE_SETUP.md](../docs/SUPABASE_SETUP.md) for detailed steps.

### 2. Firebase Setup

- Go to [firebase.google.com](https://firebase.google.com)
- Create new project
- Download service account key
- Place in `backend/src/main/resources/`

See [FIREBASE_SETUP.md](../docs/FIREBASE_SETUP.md) for detailed steps.

### 3. Database Setup

- Create tables using SQL from [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)
- Or let Supabase auto-migrate with Hibernate

## Project Structure

```
├── mobile/          # React Native app
├── backend/         # Spring Boot API
├── docs/            # Documentation
└── README.md
```

## File Locations

- **Mobile config**: `mobile/.env`
- **Backend config**: `backend/src/main/resources/application.yml`
- **Firebase key**: `backend/src/main/resources/firebase-service-account.json`
- **Documentation**: `docs/`

## Common Commands

### Mobile

```bash
cd mobile

# Start dev server
npm start

# Test on iOS
npm run ios

# Test on Android
npm run android

# Run tests
npm test

# Lint
npm run lint
```

### Backend

```bash
cd backend

# Run dev server
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build JAR
./mvnw clean package

# Check dependencies
./mvnw dependency:tree
```

## Troubleshooting

### "Cannot find module" errors in mobile

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues

- Verify Supabase URL and credentials in `.env`
- Check database is running
- Ensure PostgreSQL connection is allowed

### Backend won't compile

- Verify Java 17 is installed: `java -version`
- Try `./mvnw clean compile`

### Port 8080 already in use

```bash
# Kill process on port 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

See [ENVIRONMENT_SETUP.md](../docs/ENVIRONMENT_SETUP.md) for more troubleshooting.

## Testing

### Mobile App

```bash
cd mobile
npm test
```

### Backend

```bash
cd backend
./mvnw test
```

## Documentation

- **Architecture**: [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **API Reference**: [API.md](../docs/API.md)
- **Database Schema**: [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)
- **Environment Setup**: [ENVIRONMENT_SETUP.md](../docs/ENVIRONMENT_SETUP.md)
- **Supabase Guide**: [SUPABASE_SETUP.md](../docs/SUPABASE_SETUP.md)
- **Firebase Guide**: [FIREBASE_SETUP.md](../docs/FIREBASE_SETUP.md)

## Features Development

### Home Screen

- [ ] Display user's PRs by machine
- [ ] Add new PR button
- [ ] Edit/delete PR

### Friends List

- [ ] Display friends
- [ ] Add friends (search)
- [ ] Remove friends
- [ ] View friend profile

### Feed

- [ ] Real-time activity stream
- [ ] Filter by friend
- [ ] Notification on new activity

### Rankings

- [ ] Per-machine leaderboards
- [ ] Friend-only rankings
- [ ] Update on new PRs

### Authentication

- [ ] Email login/signup
- [ ] Google OAuth
- [ ] Facebook OAuth
- [ ] Logout

## IDE Setup

### VS Code

```bash
# Install extensions
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension vscjava.extension-pack-for-java
code --install-extension Expo.Expo-Tools
```

### IntelliJ IDEA

- Install Node.js plugin
- Enable Firebase plugin
- Configure Maven

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add feature description"

# Push and create PR
git push origin feature/my-feature
```

## Next Steps

1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Configure environment
4. ✅ Set up Supabase
5. ✅ Set up Firebase
6. ✅ Start development servers
7. 🔄 Start building features!

## Support

- Check documentation in `docs/`
- Review existing code
- Create GitHub issues for bugs

Happy coding! 🚀
