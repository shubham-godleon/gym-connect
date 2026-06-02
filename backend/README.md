# Gym Connect Backend API

Spring Boot 3.2 REST API for Gym Connect mobile app with JWT authentication and Firebase integration.

## Tech Stack

- **Spring Boot**: 3.2.0
- **Java**: 17+
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (jjwt 0.12.3)
- **Notifications**: Firebase Admin SDK 9.2.0
- **ORM**: Spring Data JPA with Hibernate
- **Build Tool**: Maven

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL (or Supabase)
- Firebase service account JSON

## Build & Run

```bash
# Build
./mvnw clean install

# Run dev server
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Build JAR
./mvnw clean package
java -jar target/gym-connect-api-1.0.0.jar
```

## Configuration

### Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE gym_connect;
```

Update `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gym_connect
    username: postgres
    password: your_password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update # Change to 'validate' in production

jwt:
  secret: your-secret-key-change-this-in-production
  expiration: 86400000 # 24 hours in milliseconds

firebase:
  credentials:
    path: classpath:firebase-service-account.json
```

### Firebase Setup

1. Download service account JSON from Firebase Console
2. Place in `src/main/resources/firebase-service-account.json`

## API Endpoints

See [API.md](../docs/API.md) for complete endpoint documentation.

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Users

- `GET /api/users/{id}` - Get user profile
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `GET /api/users/{userId}/friends` - Get friends list

### Personal Records

- `GET /api/prs` - Get all PRs
- `GET /api/prs/user/{userId}` - Get user's PRs
- `POST /api/prs` - Create new PR
- `PUT /api/prs/{id}` - Update PR
- `DELETE /api/prs/{id}` - Delete PR
- `GET /api/machines/{machineId}/leaderboard` - Get PR rankings for machine

### Feed

- `GET /api/feed/users/{userId}` - Get user's feed
- `POST /api/feed` - Create feed event

### Friendships

- `POST /api/friends/{userId}/{friendId}` - Add friend
- `DELETE /api/friends/{userId}/{friendId}` - Remove friend

## Database Schema

See `src/main/java/com/gymconnect/api/entity` for entity definitions.

Run migrations with Hibernate ddl-auto=update or create SQL migration files.

## Testing

```bash
./mvnw test
```
