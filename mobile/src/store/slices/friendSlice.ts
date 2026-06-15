import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, Friendship } from '@/types';
import apiService from '@/services/apiService';

export interface FriendState {
  friends: User[];
  pendingRequests: Friendship[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FriendState = {
  friends: [],
  pendingRequests: [],
  isLoading: false,
  error: null,
};

export const fetchFriends = createAsyncThunk(
  'friend/fetchFriends',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.getFriends(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'friend/fetchPendingRequests',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.getPendingRequests(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friend/sendFriendRequest',
  async ({ requesterId, addresseeId }: { requesterId: string; addresseeId: string }, { rejectWithValue }) => {
    try {
      await apiService.sendFriendRequest(requesterId, addresseeId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const respondToFriendRequest = createAsyncThunk(
  'friend/respondToFriendRequest',
  async (
    { friendshipId, addresseeId, accept }: { friendshipId: string; addresseeId: string; accept: boolean },
    { rejectWithValue }
  ) => {
    try {
      await apiService.respondToFriendRequest(friendshipId, addresseeId, accept);
      return friendshipId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFriend = createAsyncThunk(
  'friend/removeFriend',
  async ({ userId, friendId }: { userId: string; friendId: string }, { rejectWithValue }) => {
    try {
      await apiService.removeFriend(userId, friendId);
      return friendId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      .addCase(respondToFriendRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter((r) => r.id !== action.payload);
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter((f) => f.id !== action.payload);
      });
  },
});

export default friendSlice.reducer;
