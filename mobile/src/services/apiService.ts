import axios, { AxiosInstance } from 'axios';
import { apiConfig } from './config';
import { User, Checkin, LeaderboardEntry, FriendRequest } from '@/types';

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

  // Checkins
  checkin: async (userId: string, gymName?: string, note?: string): Promise<Checkin> => {
    const response = await apiClient.post(`/checkins`, { userId, gymName, note });
    return response.data;
  },

  getFeed: async (userId: string): Promise<Checkin[]> => {
    const response = await apiClient.get(`/checkins/feed/${userId}`);
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
};

export default apiService;
