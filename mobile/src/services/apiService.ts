import axios, { AxiosInstance } from 'axios';
import { apiConfig } from './config';
import { User, PersonalRecord, FeedEvent, Ranking } from '@/types';

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
  // User endpoints
  getUserProfile: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  updateUserProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },

  // Personal Records
  getUserPRs: async (userId: string): Promise<PersonalRecord[]> => {
    const response = await apiClient.get(`/users/${userId}/prs`);
    return response.data;
  },

  createPR: async (userId: string, pr: Omit<PersonalRecord, 'id' | 'userId' | 'createdAt'>): Promise<PersonalRecord> => {
    const response = await apiClient.post(`/users/${userId}/prs`, pr);
    return response.data;
  },

  getMachinePRLeaderboard: async (machineId: string, friendIds?: string[]): Promise<Ranking[]> => {
    const response = await apiClient.get(`/machines/${machineId}/leaderboard`, {
      params: { friendIds: friendIds?.join(',') }
    });
    return response.data;
  },

  // Friends
  getFriends: async (userId: string): Promise<User[]> => {
    const response = await apiClient.get(`/users/${userId}/friends`);
    return response.data;
  },

  addFriend: async (userId: string, friendId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/friends/${friendId}`);
  },

  removeFriend: async (userId: string, friendId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/friends/${friendId}`);
  },

  // Feed
  getFeed: async (userId: string, limit: number = 20): Promise<FeedEvent[]> => {
    const response = await apiClient.get(`/users/${userId}/feed`, {
      params: { limit }
    });
    return response.data;
  },

  getCheckIns: async (machineId: string): Promise<any[]> => {
    const response = await apiClient.get(`/machines/${machineId}/check-ins`);
    return response.data;
  },

  createCheckIn: async (userId: string, machineId: string): Promise<any> => {
    const response = await apiClient.post(`/users/${userId}/check-ins`, {
      machineId,
      timestamp: new Date().toISOString()
    });
    return response.data;
  },

  // Machines
  getAllMachines: async (): Promise<any[]> => {
    const response = await apiClient.get('/machines');
    return response.data;
  },

  getMachineById: async (machineId: string): Promise<any> => {
    const response = await apiClient.get(`/machines/${machineId}`);
    return response.data;
  },
};

export default apiService;
