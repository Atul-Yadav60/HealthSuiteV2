import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Profile {
  id: string;
  push_token: string;
  latitude: number;
  longitude: number;
}

console.log("🚀 Environmental alerts function script loaded");

serve(async () => {
  console.log("🔄 Function invoked");
  try {
    // 1. Check if the API key is loaded
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      console.error("❌ ERROR: OPENWEATHER_API_KEY is not set in .env.local file!");
      throw new Error("OPENWEATHER_API_KEY is not configured.");
    }
    console.log("✅ API key loaded successfully.");

    // 2. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    console.log("✅ Supabase admin client initialized.");

    // 3. Fetch user profiles with location data
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, push_token, latitude, longitude')
      .not('push_token', 'is', null)
      .not('latitude', 'is', null);

    if (profileError) {
      console.error("❌ ERROR fetching profiles:", profileError);
      throw profileError;
    }
    
    console.log(`👥 Found ${profiles?.length || 0} profiles with location and push token.`);
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users with push tokens and location."}), { status: 200 });
    }

    const notifications = [];
    for (const profile of profiles as Profile[]) {
      const { latitude, longitude } = profile;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
      
      console.log(`🌍 Fetching weather for profile ${profile.id} from: ${weatherUrl}`);
      const weatherResponse = await fetch(weatherUrl);

      console.log(`➡️ Weather API response status for profile ${profile.id}: ${weatherResponse.status}`);
      if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        console.error(`❌ ERROR from Weather API for profile ${profile.id}: ${errorText}`);
        continue; // Skip to the next user
      }

      const weatherData = await weatherResponse.json();
      const aqi = weatherData.list[0].main.aqi; // 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
      console.log(`🌬️ AQI for profile ${profile.id} is: ${aqi}`);

      if (aqi >= 4) {
        console.log(`🚨 High AQI detected for profile ${profile.id}. Preparing notification.`);
        notifications.push({
          to: profile.push_token,
          sound: 'default',
          title: '🌬️ Air Quality Alert',
          body: `The air quality in your area is poor (AQI: ${aqi}). Consider limiting outdoor activities today.`,
        });
      }
    }

    if (notifications.length > 0) {
      console.log(`✉️ Sending ${notifications.length} push notifications...`);
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(notifications),
      });
      console.log("✅ Push notifications sent.");
    }

    return new Response(JSON.stringify({ message: `Sent ${notifications.length} alerts.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 4. This will now catch and print the SPECIFIC error
    console.error("🔥 FATAL FUNCTION ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
