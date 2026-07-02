export type WorkoutLocation = 'GYM' | 'HOME' | 'BOTH';
export type CheckinLocation = 'GYM' | 'HOME';

// User profile (matches backend UserDTO)
export interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  photoUrl?: string;
  homeGymName?: string;
  workoutLocation: WorkoutLocation;
  preferredWorkoutTime?: string; // "HH:mm:ss"
  streakCount: number;
  longestStreak: number;
  lastCheckinDate?: string;
  weeklyGoal?: number; // distinct days/week target, 1-7; undefined = not set yet
  weeklyProgress: number; // distinct days checked in so far this week
}

// A friend who's behind their weekly goal (matches backend SlackerDTO)
export interface Slacker {
  userId: string;
  displayName: string;
  photoUrl?: string;
  weeklyProgress: number;
  weeklyGoal: number;
  streakCount: number;
}

// Checkin (matches backend CheckinDTO)
export interface Checkin {
  id: string;
  userId: string;
  displayName: string;
  photoUrl?: string;
  gymName?: string;
  note?: string;
  location: CheckinLocation;
  verified: boolean;
  reactionCount: number;
  reactedByMe: boolean;
  createdAt: string;
}

// Feed item (matches backend FeedItemDTO) — either a checkin or a friend-accepted event
export interface FeedItem {
  type: 'CHECKIN' | 'FRIEND_ACCEPTED';
  id: string;
  userId: string;
  displayName?: string;
  photoUrl?: string;
  gymName?: string;
  note?: string;
  location?: CheckinLocation;
  verified: boolean;
  reactionCount: number;
  reactedByMe: boolean;
  friendDisplayName?: string;
  createdAt: string;
}

// Gym (matches backend GymDTO)
export interface Gym {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  source: 'MAPPLS' | 'MANUAL';
  locationStatus: 'PROVISIONAL' | 'CONFIRMED';
  qrToken: string;
  memberCount: number;
  hereNowCount: number;
  member: boolean;
  distanceMeters?: number;
}

// Gym roster entry (matches backend RosterEntryDTO)
export interface RosterEntry {
  userId: string;
  displayName: string;
  photoUrl?: string;
  hereNow: boolean;
  streakCount: number;
}

// Result of a QR check-in (matches backend GymCheckinResponse)
export interface GymCheckinResult {
  verified: boolean;
  distanceMeters: number;
  checkin?: Checkin;
  message: string;
}

// Calendar day (matches backend CheckinDayDTO)
export interface CheckinDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

// Leaderboard entry (matches backend LeaderboardEntryDTO)
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoUrl?: string;
  checkinsThisWeek: number;
  streakCount: number;
}

// Friendship (matches backend Friendship entity)
export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

// Pending friend request, enriched with requester display info (matches backend FriendRequestDTO)
export interface FriendRequest {
  id: string;
  requesterId: string;
  requesterDisplayName: string;
  requesterPhotoUrl?: string;
  addresseeId: string;
  createdAt: string;
}

// Friend-add username search result (matches backend UserSearchResultDTO)
export interface UserSearchResult {
  userId: string;
  username: string;
  displayName: string;
  photoUrl?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends LoginCredentials {
  displayName: string;
}
