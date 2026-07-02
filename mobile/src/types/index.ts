export type WorkoutLocation = 'GYM' | 'HOME' | 'BOTH';
export type CheckinLocation = 'GYM' | 'HOME';

// User profile (matches backend UserDTO)
export interface User {
  id: string;
  email: string;
  displayName: string;
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
  reactionCount: number;
  reactedByMe: boolean;
  friendDisplayName?: string;
  createdAt: string;
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
