import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Profile {
  id: string;
  push_token: string;
  latitude: number;
  longitude: number;
}

serve(async () => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, push_token, latitude, longitude')
      .not('push_token', 'is', null)
      .not('latitude', 'is', null);

    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users with push tokens and location."}), { status: 200 });
    }

    const notifications = [];
    for (const profile of profiles as Profile[]) {
      const { latitude, longitude } = profile;
      const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
      const weatherUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
      
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) continue;

      const weatherData = await weatherResponse.json();
      const aqi = weatherData.list[0].main.aqi; // 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor

      if (aqi >= 4) {
        notifications.push({
          to: profile.push_token,
          sound: 'default',
          title: '🌬️ Air Quality Alert',
          body: `The air quality in your area is poor (AQI: ${aqi}). Consider limiting outdoor activities today.`,
        });
      }
    }

    if (notifications.length > 0) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(notifications),
      });
    }

    return new Response(JSON.stringify({ message: `Sent ${notifications.length} alerts.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});