import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Production keys
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Local development keys
const localSupabaseUrl = 'http://127.0.0.1:54321';
const localSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Choose URLs based on environment
const finalSupabaseUrl = __DEV__ ? localSupabaseUrl : supabaseUrl;
const finalSupabaseAnonKey = __DEV__ ? localSupabaseAnonKey : supabaseAnonKey;

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Add this for local function calls
export const getLocalFunctionUrl = (functionName: string) => {
  if (__DEV__) {
    return `http://127.0.0.1:54321/functions/v1/${functionName}`;
  }
  return `${finalSupabaseUrl}/functions/v1/${functionName}`;
};