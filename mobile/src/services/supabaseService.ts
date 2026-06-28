import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabaseConfig } from './config';

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
