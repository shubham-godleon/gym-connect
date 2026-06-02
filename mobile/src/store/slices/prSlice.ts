import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PersonalRecord, Ranking } from '@/types';
import apiService from '@/services/apiService';

interface PRState {
  userPRs: PersonalRecord[];
  leaderboards: Record<string, Ranking[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: PRState = {
  userPRs: [],
  leaderboards: {},
  isLoading: false,
  error: null,
};

export const fetchUserPRs = createAsyncThunk(
  'pr/fetchUserPRs',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.getUserPRs(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPR = createAsyncThunk(
  'pr/create',
  async ({ userId, pr }: { userId: string; pr: Omit<PersonalRecord, 'id' | 'userId' | 'createdAt'> }, { rejectWithValue }) => {
    try {
      return await apiService.createPR(userId, pr);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'pr/fetchLeaderboard',
  async ({ machineId, friendIds }: { machineId: string; friendIds?: string[] }, { rejectWithValue }) => {
    try {
      const data = await apiService.getMachinePRLeaderboard(machineId, friendIds);
      return { machineId, rankings: data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const prSlice = createSlice({
  name: 'pr',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPRs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPRs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPRs = action.payload;
      })
      .addCase(fetchUserPRs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPR.fulfilled, (state, action) => {
        state.userPRs.unshift(action.payload);
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboards[action.payload.machineId] = action.payload.rankings;
      });
  },
});

export default prSlice.reducer;
