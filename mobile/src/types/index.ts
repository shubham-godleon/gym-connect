// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

// PR (Personal Record) types
export interface PersonalRecord {
  id: string;
  userId: string;
  machineId: string;
  machineName: string;
  weight: number;
  reps?: number;
  date: string;
  createdAt: string;
}

// Machine types
export interface Machine {
  id: string;
  name: string;
  category: string;
  gymId: string;
}

// Friendship types
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

// Feed types
export interface FeedEvent {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  type: 'checkin' | 'pr';
  machineId?: string;
  machineName?: string;
  prWeight?: number;
  timestamp: string;
}

// Ranking types
export interface Ranking {
  userId: string;
  userName: string;
  userPhotoURL?: string;
  machineId: string;
  machineName: string;
  weight: number;
  rank: number;
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
