import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FeedEvent } from '@/types';
import apiService from '@/services/apiService';

interface FeedState {
  events: FeedEvent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FeedState = {
  events: [],
  isLoading: false,
  error: null,
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async ({ userId, limit }: { userId: string; limit?: number }, { rejectWithValue }) => {
    try {
      return await apiService.getFeed(userId, limit);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFeedEvent = createAsyncThunk(
  'feed/addEvent',
  async (event: FeedEvent, { rejectWithValue }) => {
    try {
      return event;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    prependFeedEvent: (state, action) => {
      state.events.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addFeedEvent.fulfilled, (state, action) => {
        state.events.unshift(action.payload);
      });
  },
});

export const { prependFeedEvent } = feedSlice.actions;
export default feedSlice.reducer;
