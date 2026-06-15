// User profile (matches backend UserDTO)
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  homeGymName?: string;
  streakCount: number;
  longestStreak: number;
  lastCheckinDate?: string;
}

// Checkin (matches backend CheckinDTO)
export interface Checkin {
  id: string;
  userId: string;
  displayName: string;
  photoUrl?: string;
  gymName: string;
  note?: string;
  reactionCount: number;
  reactedByMe: boolean;
  createdAt: string;
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
