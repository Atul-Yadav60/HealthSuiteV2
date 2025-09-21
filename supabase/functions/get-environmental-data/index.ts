import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function is called when the user opens the home screen.
// It requires a valid JWT from the logged-in user.
serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // 2. Create a Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Get the logged-in user's details
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }

    // 4. Get the user's location from their profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile || profile.latitude == null) {
       return new Response(JSON.stringify({ message: "User location not set." }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200,
      });
    }

    // 5. Fetch weather data using the user's location
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    const { latitude, longitude } = profile;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
       const errorText = await weatherResponse.text();
       throw new Error(`Weather API failed: ${errorText}`);
    }

    const weatherData = await weatherResponse.json();
    const aqi = weatherData.list[0].main.aqi;

    // 6. Return the data to the app
    const responseData = { aqi, ...weatherData.list[0].components };

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        },
        status: 200
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        }
      },
    )
  }
})
