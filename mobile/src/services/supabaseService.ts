import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { decode } from 'base64-arraybuffer';
import { supabaseConfig } from './config';
import { setAuthToken } from './apiService';

const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Keep the backend Authorization header in sync whenever Supabase rotates
// the access token in the background (auto-refresh) or signs out.
supabase.auth.onAuthStateChange((_event, session) => {
  setAuthToken(session?.access_token ?? null);
});

export const supabaseService = {
  // Auth methods
  signUp: async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { displayName }
      }
    });
    if (error) throw error;
    return data;
  },

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  signInWithGoogle: async () => {
    const redirectTo = Platform.OS === 'web' ? window.location.origin : Linking.createURL('/');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  // base64Jpeg is a raw base64 string (no "data:image/..." prefix).
  // Path is scoped by the Supabase Auth user's own id (not the backend's user
  // id, which is a separate UUID) — that's what the storage RLS policy checks
  // against via auth.uid(), so it has to match exactly.
  uploadAvatar: async (base64Jpeg: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');

    const path = `${user.id}/avatar.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, decode(base64Jpeg), { upsert: true, contentType: 'image/jpeg' });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`; // cache-bust since the path is stable
  },

  // Real-time subscriptions
  subscribeToUserProfile: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`user-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` }, (payload) => {
        callback(payload);
      })
      .subscribe();
  },

  subscribeToCheckins: (friendIds: string[], callback: (payload: any) => void) => {
    return supabase
      .channel('checkins-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checkins' }, (payload) => {
        if (friendIds.includes((payload.new as any).user_id)) {
          callback(payload.new);
        }
      })
      .subscribe();
  },
};

export default supabase;
