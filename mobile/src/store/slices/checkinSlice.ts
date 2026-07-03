import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedItem, LeaderboardEntry, CheckinLocation } from '@/types';
import apiService from '@/services/apiService';
import type { RootState } from '@/store';

const KUDOS_SEEN_KEY = 'lastSeenKudos';

export interface CheckinState {
  feed: FeedItem[];
  leaderboard: LeaderboardEntry[];
  kudosCount: number; // total kudos received (from backend)
  kudosSeen: number;  // count at last Home visit (persisted)
  isLoading: boolean;
  error: string | null;
}

const initialState: CheckinState = {
  feed: [],
  leaderboard: [],
  kudosCount: 0,
  kudosSeen: 0,
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

export const fetchKudosCount = createAsyncThunk(
  'checkin/fetchKudosCount',
  async (userId: string) => {
    return await apiService.getKudosCount(userId);
  }
);

// Read the last-seen kudos count from storage (call once at startup).
export const restoreKudosSeen = createAsyncThunk('checkin/restoreKudosSeen', async () => {
  const v = await AsyncStorage.getItem(KUDOS_SEEN_KEY);
  return v ? Number(v) : 0;
});

// Mark current kudos as seen (call when Home is viewed) — clears the dot.
export const markKudosSeen = createAsyncThunk('checkin/markKudosSeen', async (_, { getState }) => {
  const count = (getState() as RootState).checkin.kudosCount;
  await AsyncStorage.setItem(KUDOS_SEEN_KEY, String(count));
  return count;
});

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
      })
      .addCase(fetchKudosCount.fulfilled, (state, action) => {
        state.kudosCount = action.payload;
      })
      .addCase(restoreKudosSeen.fulfilled, (state, action) => {
        state.kudosSeen = action.payload;
      })
      .addCase(markKudosSeen.fulfilled, (state, action) => {
        state.kudosSeen = action.payload;
      });
  },
});

export default checkinSlice.reducer;
