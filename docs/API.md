# API Documentation

## Base URL

```
http://localhost:8080/api
```

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Users

#### Get User Profile

```
GET /users/{userId}
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "url",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

#### Update User Profile

```
PUT /users/{userId}
```

Request:

```json
{
  "displayName": "New Name",
  "photoURL": "new-url"
}
```

#### Create User

```
POST /users
```

Request:

```json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "url"
}
```

### Personal Records

#### Get User PRs

```
GET /prs/user/{userId}
```

Response:

```json
[
  {
    "id": "uuid",
    "userId": "user-id",
    "machineId": "machine-id",
    "machineName": "Bench Press",
    "weight": 185.5,
    "reps": 8,
    "date": "2024-01-01T00:00:00",
    "createdAt": "2024-01-01T00:00:00"
  }
]
```

#### Create PR

```
POST /prs
```

Request:

```json
{
  "userId": "user-id",
  "machineId": "machine-id",
  "machineName": "Bench Press",
  "weight": 185.5,
  "reps": 8,
  "date": "2024-01-01T00:00:00"
}
```

### Friendships

#### Get Friends

```
GET /users/{userId}/friends
```

#### Add Friend

```
POST /users/{userId}/friends/{friendId}
```

#### Remove Friend

```
DELETE /users/{userId}/friends/{friendId}
```

### Leaderboards

#### Get Machine Leaderboard

```
GET /machines/{machineId}/leaderboard?friendIds=id1,id2,id3
```

Response:

```json
[
  {
    "userId": "user-id",
    "userName": "John Doe",
    "userPhotoURL": "url",
    "machineId": "machine-id",
    "machineName": "Bench Press",
    "weight": 185.5,
    "rank": 1
  }
]
```

### Feed

#### Get Feed

```
GET /users/{userId}/feed?limit=20
```

### Check-Ins

#### Create Check-In

```
POST /users/{userId}/check-ins
```

Request:

```json
{
  "machineId": "machine-id",
  "timestamp": "2024-01-01T00:00:00"
}
```

## Error Responses

```json
{
  "error": "User not found",
  "status": 404,
  "timestamp": "2024-01-01T00:00:00"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
