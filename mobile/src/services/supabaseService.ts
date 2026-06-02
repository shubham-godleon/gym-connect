import { createClient } from '@supabase/supabase-js';
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

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Real-time subscriptions
  subscribeToUserProfile: (userId: string, callback: Function) => {
    return supabase
      .from('users')
      .on('*', (payload) => {
        callback(payload);
      })
      .subscribe();
  },

  subscribeToPRs: (userId: string, callback: Function) => {
    return supabase
      .from('personal_records')
      .on('INSERT', (payload) => {
        if (payload.new.user_id === userId) {
          callback(payload.new);
        }
      })
      .subscribe();
  },

  subscribeToFeed: (friendIds: string[], callback: Function) => {
    return supabase
      .from('feed_events')
      .on('INSERT', (payload) => {
        if (friendIds.includes(payload.new.user_id)) {
          callback(payload.new);
        }
      })
      .subscribe();
  },
};

export default supabase;
