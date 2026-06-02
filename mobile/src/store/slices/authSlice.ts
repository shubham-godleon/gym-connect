import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';
import supabaseService from '@/services/supabaseService';
import { setAuthToken } from '@/services/apiService';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  token: null,
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }, { rejectWithValue }) => {
    try {
      const data = await supabaseService.signUp(email, password, displayName);
      if (data.user && data.session) {
        setAuthToken(data.session.access_token);
        return { user: data.user, token: data.session.access_token };
      }
      throw new Error('Sign up failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await supabaseService.signInWithEmail(email, password);
      if (data.user && data.session) {
        setAuthToken(data.session.access_token);
        return { user: data.user, token: data.session.access_token };
      }
      throw new Error('Sign in failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await supabaseService.signOut();
      setAuthToken(null);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const restoreToken = createAsyncThunk(
  'auth/restoreToken',
  async (_, { rejectWithValue }) => {
    try {
      const user = await supabaseService.getCurrentUser();
      if (user) {
        return { user, token: 'restored' };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as any;
        state.token = action.payload.token;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as any;
        state.token = action.payload.token;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(restoreToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user as any;
          state.token = action.payload.token;
        }
        state.isLoading = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
