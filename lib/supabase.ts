import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// --- LIVE Production Keys ---
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// --- LOCAL Development Keys (if using local Supabase) ---
const YOUR_COMPUTER_IP = '10.12.240.136'; // <--- Replace with your actual IP
const localSupabaseUrl = `http://${YOUR_COMPUTER_IP}:54321`;
const localSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0 '; // <--- Your local anon key

// --- Intelligent Switch ---
const USE_LOCAL_SUPABASE = false; // <--- Set to true only if you have local Supabase running

const finalSupabaseUrl = (__DEV__ && USE_LOCAL_SUPABASE) ? localSupabaseUrl : supabaseUrl;
const finalSupabaseAnonKey = (__DEV__ && USE_LOCAL_SUPABASE) ? localSupabaseAnonKey : supabaseAnonKey;

console.log(`\n--- Supabase Client Initialized for: ${(__DEV__ && USE_LOCAL_SUPABASE) ? 'LOCAL DEVELOPMENT' : 'LIVE PRODUCTION'} ---`);
console.log(`--- API URL: ${finalSupabaseUrl} ---\n`);

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});