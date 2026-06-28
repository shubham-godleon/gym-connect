import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import apiService, { setAuthToken } from '@/services/apiService';

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
        const profile = await apiService.createUser({ email, displayName });
        return { user: profile, token: data.session.access_token };
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
        const profile = await fetchOrCreateProfile(email, data.user.user_metadata?.displayName);
        return { user: profile, token: data.session.access_token };
      }
      throw new Error('Sign in failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Redirects the browser to Google; once Supabase sets the session on
      // the way back, restoreToken (run on app mount) picks up the user.
      await supabaseService.signInWithGoogle();
      return null;
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
      if (user && user.email) {
        const profile = await fetchOrCreateProfile(user.email, user.user_metadata?.displayName);
        return { user: profile, token: 'restored' };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

async function fetchOrCreateProfile(email: string, displayName?: string) {
  try {
    return await apiService.getUserByEmail(email);
  } catch {
    return await apiService.createUser({ email, displayName: displayName || email });
  }
}

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
        state.user = action.payload.user;
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
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(restoreToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
        state.isLoading = false;
      })
      .addCase(restoreToken.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
