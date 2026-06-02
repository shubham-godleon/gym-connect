# Setup Checklist

Complete these steps to get Gym Connect ready for development.

## Phase 1: Local Setup (15 minutes)

-  Clone the repository
-  Run `npm run install:all` to install all dependencies
-  Copy `mobile/.env.example` to `mobile/.env`
-  Copy `backend/application.yml.example` to `backend/src/main/resources/application.yml`
-  Verify project structure is complete

## Phase 2: Supabase Setup (10 minutes)

- [ ] Create account at https://supabase.com
- [ ] Create new project
- [ ] Go to Settings > API
- [ ] Copy Project URL to `mobile/.env` as `SUPABASE_URL`
- [ ] Copy `anon` key to `mobile/.env` as `SUPABASE_ANON_KEY`
- [ ] Copy `service_role` key (for backend setup)
- [ ] Update database connection string in `backend/src/main/resources/application.yml`
- [ ] Go to Settings > Database > Connection Pools and enable pooling
- [ ] Run SQL migrations from `docs/DATABASE_SCHEMA.md`:
  - [ ] Create `users` table
  - [ ] Create `personal_records` table
  - [ ] Create `friendships` table
  - [ ] Create `feed_events` table
  - [ ] Create `machines` table
- [ ] Go to Database > Replication and enable for:
  - [ ] `feed_events`
  - [ ] `personal_records`
  - [ ] `friendships`

## Phase 3: Firebase Setup (10 minutes)

- [ ] Create account at https://firebase.google.com
- [ ] Create new project named "Gym Connect"
- [ ] Go to Project Settings > Service Accounts
- [ ] Click "Generate New Private Key"
- [ ] Save and place as `backend/src/main/resources/firebase-service-account.json`
- [ ] Go to Project Settings > General
- [ ] Copy Firebase config values:
  - [ ] `FIREBASE_API_KEY`
  - [ ] `FIREBASE_AUTH_DOMAIN`
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `FIREBASE_STORAGE_BUCKET`
  - [ ] `FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `FIREBASE_APP_ID`
- [ ] Add these to `mobile/.env`
- [ ] Go to Build > Messaging and verify enabled

## Phase 4: OAuth Configuration (15 minutes)

### Google Sign-In

- [ ] Go to https://console.cloud.google.com
- [ ] Create new project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add iOS Bundle ID: `com.gymconnect.app` (or your custom)
- [ ] Add Android package name
- [ ] Copy iOS Client ID to `mobile/.env` as `GOOGLE_IOS_CLIENT_ID`
- [ ] Copy Android Client ID to `mobile/.env` as `GOOGLE_ANDROID_CLIENT_ID`

### Facebook OAuth

- [ ] Go to https://developers.facebook.com
- [ ] Create new app
- [ ] Add Facebook Login product
- [ ] Configure iOS and Android platforms
- [ ] Copy App ID to `mobile/.env` as `FACEBOOK_APP_ID`
- [ ] Update `mobile/app.json` with Facebook App ID

## Phase 5: Backend Configuration (5 minutes)

- [ ] Edit `backend/src/main/resources/application.yml`
- [ ] Set database connection URL
- [ ] Set database username/password
- [ ] Set JWT secret (change from default!)
- [ ] Set JWT expiration time
- [ ] Set Firebase credentials path

## Phase 6: Mobile Configuration (5 minutes)

- [ ] Edit `mobile/.env` with all values from previous steps
- [ ] Verify all environment variables are set:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `FIREBASE_*` variables
  - [ ] `GOOGLE_*` variables
  - [ ] `FACEBOOK_APP_ID`
  - [ ] `API_BASE_URL`

## Phase 7: Local Testing (10 minutes)

### Backend

- [ ] Open Terminal 1
- [ ] Run `cd backend && ./mvnw spring-boot:run`
- [ ] Verify Spring Boot starts without errors
- [ ] Test API: `curl http://localhost:8080/api/users`
- [ ] Should get 401 or error (expected without auth)

### Mobile

- [ ] Open Terminal 2
- [ ] Run `cd mobile && npm start`
- [ ] Verify Expo starts
- [ ] Open Expo in iOS simulator: Press `i`
- [ ] Or scan QR code with iPhone using Expo Go app
- [ ] Verify app loads without errors

## Phase 8: Feature Development Readiness

- [ ] Test database connection from backend
- [ ] Test Supabase authentication signup
- [ ] Test Firebase messaging (optional)
- [ ] Verify Redux store connects
- [ ] Test API connection from mobile app

## Phase 9: Git Setup

- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Update origin URL to your repository
- [ ] Create initial commit with setup complete
- [ ] Push to GitHub

## Phase 10: Development Environment

- [ ] Install VS Code extensions (optional)
- [ ] Configure IDE settings
- [ ] Set up debugging
- [ ] Configure terminal preferences
- [ ] Review [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Final Verification

- [ ] Backend runs on port 8080
- [ ] Mobile app runs on Expo
- [ ] Database is connected
- [ ] Firebase is configured
- [ ] OAuth credentials are set
- [ ] All environment variables are defined
- [ ] No console errors on startup

## What's Next?

Once all items are checked:

1. **Start Building Features**
   - Home screen with PR list
   - Friends list functionality
   - Activity feed
   - Leaderboards
   - Notifications

2. **Write Tests**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Deploy**
   - Staging environment
   - Production deployment
   - App store releases

## Notes

- Save any API keys or secrets securely
- Never commit `.env` files
- Use `.env.example` as template
- Keep documentation updated
- Test on real iPhone device before release

## Troubleshooting

If any step fails:

1. Check the relevant documentation in `docs/`
2. Review [ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md#troubleshooting)
3. Check console outputs for error messages
4. Compare with examples in documentation

## Support

- 📖 Read documentation in `docs/` folder
- 🔍 Check [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)
- 🐛 Review [CONTRIBUTING.md](docs/CONTRIBUTING.md)
- 💬 Open GitHub issues

---

**Estimated Total Time**: 1.5 hours

**Start**: [Phase 1](#phase-1-local-setup-15-minutes)

Good luck! 🚀
