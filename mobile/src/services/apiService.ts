import axios, { AxiosInstance } from 'axios';
import { apiConfig } from './config';
import {
  User, Checkin, FeedItem, LeaderboardEntry, FriendRequest, CheckinDay, CheckinLocation, Slacker,
  Gym, RosterEntry, GymCheckinResult, UserSearchResult,
} from '@/types';

const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
});

// Add token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const apiService = {
  // Users
  getUserProfile: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const response = await apiClient.get(`/users/by-email/${email}`);
    return response.data;
  },

  searchUsers: async (q: string): Promise<UserSearchResult[]> => {
    const response = await apiClient.get(`/users/search`, { params: { q } });
    return response.data;
  },

  createUser: async (data: { id?: string; email: string; displayName: string; photoUrl?: string; homeGymName?: string }): Promise<User> => {
    const response = await apiClient.post(`/users`, data);
    return response.data;
  },

  updateUserProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },

  updateFcmToken: async (userId: string, fcmToken: string): Promise<void> => {
    await apiClient.put(`/users/${userId}/fcm-token`, { fcmToken });
  },

  getSlackingFriends: async (userId: string): Promise<Slacker[]> => {
    const response = await apiClient.get(`/users/${userId}/slacking-friends`);
    return response.data;
  },

  // Checkins
  checkin: async (userId: string, location: CheckinLocation): Promise<Checkin> => {
    const response = await apiClient.post(`/checkins`, { userId, location });
    return response.data;
  },

  getFeed: async (userId: string, page?: number, size?: number): Promise<FeedItem[]> => {
    const params = page != null || size != null ? { page: page ?? 0, size: size ?? 20 } : undefined;
    const response = await apiClient.get(`/checkins/feed/${userId}`, { params });
    return response.data;
  },

  getCalendar: async (userId: string, year: number): Promise<CheckinDay[]> => {
    const response = await apiClient.get(`/checkins/calendar/${userId}/${year}`);
    return response.data;
  },

  getLeaderboard: async (userId: string): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get(`/checkins/leaderboard/${userId}`);
    return response.data;
  },

  toggleReaction: async (checkinId: string, userId: string): Promise<boolean> => {
    const response = await apiClient.post(`/checkins/${checkinId}/react`, { userId });
    return response.data.reacted;
  },

  // Friends
  getFriends: async (userId: string): Promise<User[]> => {
    const response = await apiClient.get(`/friends/${userId}`);
    return response.data;
  },

  getPendingRequests: async (userId: string): Promise<FriendRequest[]> => {
    const response = await apiClient.get(`/friends/${userId}/pending`);
    return response.data;
  },

  sendFriendRequest: async (requesterId: string, addresseeId: string): Promise<void> => {
    await apiClient.post(`/friends/request`, { requesterId, addresseeId });
  },

  respondToFriendRequest: async (friendshipId: string, addresseeId: string, accept: boolean): Promise<void> => {
    await apiClient.put(`/friends/${friendshipId}/respond`, { addresseeId, accept });
  },

  removeFriend: async (userId: string, friendId: string): Promise<void> => {
    await apiClient.delete(`/friends`, { data: { userId, friendId } });
  },

  // Gyms (all authenticated via token — no userId arg needed)
  getNearbyGyms: async (lat: number, lng: number): Promise<Gym[]> => {
    const response = await apiClient.get(`/gyms/nearby`, { params: { lat, lng } });
    return response.data;
  },

  getMyGyms: async (): Promise<Gym[]> => {
    const response = await apiClient.get(`/gyms/mine`);
    return response.data;
  },

  getGym: async (gymId: string): Promise<Gym> => {
    const response = await apiClient.get(`/gyms/${gymId}`);
    return response.data;
  },

  createGym: async (payload: {
    source: 'MAPPLS' | 'MANUAL';
    name: string;
    address?: string;
    lat: number;
    lng: number;
    mapplsPlaceId?: string;
    radiusMeters?: number;
  }): Promise<Gym> => {
    const response = await apiClient.post(`/gyms`, payload);
    return response.data;
  },

  joinGym: async (gymId: string): Promise<Gym> => {
    const response = await apiClient.post(`/gyms/${gymId}/join`);
    return response.data;
  },

  leaveGym: async (gymId: string): Promise<void> => {
    await apiClient.delete(`/gyms/${gymId}/membership`);
  },

  setGymVisibility: async (gymId: string, visible: boolean): Promise<void> => {
    await apiClient.put(`/gyms/${gymId}/visibility`, { visible });
  },

  checkinViaQr: async (qrToken: string, lat: number, lng: number): Promise<GymCheckinResult> => {
    const response = await apiClient.post(`/gyms/scan/${qrToken}/checkin`, { lat, lng });
    return response.data;
  },

  getGymRoster: async (gymId: string): Promise<RosterEntry[]> => {
    const response = await apiClient.get(`/gyms/${gymId}/roster`);
    return response.data;
  },

  getGymLeaderboard: async (gymId: string): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get(`/gyms/${gymId}/leaderboard`);
    return response.data;
  },
};

export default apiService;
