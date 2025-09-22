// These are the CORS headers that Supabase Edge Functions expect.
// They allow your mobile app to securely communicate with the function.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
