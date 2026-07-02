import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FeedItem, LeaderboardEntry, CheckinLocation } from '@/types';
import apiService from '@/services/apiService';

export interface CheckinState {
  feed: FeedItem[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CheckinState = {
  feed: [],
  leaderboard: [],
  isLoading: false,
  error: null,
};

export const fetchFeed = createAsyncThunk(
  'checkin/fetchFeed',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.getFeed(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'checkin/fetchLeaderboard',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.getLeaderboard(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCheckin = createAsyncThunk(
  'checkin/create',
  async ({ userId, location }: { userId: string; location: CheckinLocation }, { rejectWithValue }) => {
    try {
      return await apiService.checkin(userId, location);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleReaction = createAsyncThunk(
  'checkin/toggleReaction',
  async ({ checkinId, userId }: { checkinId: string; userId: string }, { rejectWithValue }) => {
    try {
      const reacted = await apiService.toggleReaction(checkinId, userId);
      return { checkinId, reacted };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const checkinSlice = createSlice({
  name: 'checkin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
      })
      .addCase(createCheckin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCheckin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed.unshift({ ...action.payload, type: 'CHECKIN' });
      })
      .addCase(createCheckin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleReaction.fulfilled, (state, action) => {
        const checkin = state.feed.find((c) => c.id === action.payload.checkinId);
        if (checkin) {
          checkin.reactedByMe = action.payload.reacted;
          checkin.reactionCount += action.payload.reacted ? 1 : -1;
        }
      });
  },
});

export default checkinSlice.reducer;
