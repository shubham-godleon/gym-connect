import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@/types';
import apiService from '@/services/apiService';

interface FriendState {
  friends: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FriendState = {
  friends: [],
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

export const addFriend = createAsyncThunk(
  'friend/addFriend',
  async ({ userId, friendId }: { userId: string; friendId: string }, { rejectWithValue }) => {
    try {
      await apiService.addFriend(userId, friendId);
      return friendId;
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
      });
  },
});

export default friendSlice.reducer;
