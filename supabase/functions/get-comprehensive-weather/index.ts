import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("🌤️ Comprehensive weather data function loaded");

// This function fetches comprehensive weather data including temperature, UV, AQI, and conditions
serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      }
    })
  }

  try {
    console.log("🔄 Comprehensive weather function invoked");
    
    // Check if API key is available
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      throw new Error("OpenWeather API key not configured");
    }

    let latitude: number, longitude: number;

    // Get coordinates from request body or user profile
    if (req.method === 'POST') {
      const body = await req.json();
      if (body.latitude && body.longitude) {
        latitude = body.latitude;
        longitude = body.longitude;
        console.log(`📍 Using coordinates from request: ${latitude}, ${longitude}`);
      } else {
        throw new Error("Latitude and longitude required in request body");
      }
    } else {
      // Fallback: Get from user profile (requires authentication)
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      )

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.latitude == null) {
        return new Response(JSON.stringify({ 
          error: "User location not set in profile" 
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 400,
        });
      }

      latitude = profile.latitude;
      longitude = profile.longitude;
      console.log(`📍 Using coordinates from profile: ${latitude}, ${longitude}`);
    }

    // Prepare API URLs
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    console.log("🌍 Fetching weather data from multiple endpoints...");

    // Fetch all data concurrently
    const [weatherResponse, uvResponse, airResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(uvUrl),
      fetch(airPollutionUrl)
    ]);

    // Check responses
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      throw new Error(`Weather API failed: ${errorText}`);
    }
    if (!uvResponse.ok) {
      const errorText = await uvResponse.text();
      throw new Error(`UV API failed: ${errorText}`);
    }
    if (!airResponse.ok) {
      const errorText = await airResponse.text();
      throw new Error(`Air pollution API failed: ${errorText}`);
    }

    // Parse responses
    const weatherData = await weatherResponse.json();
    const uvData = await uvResponse.json();
    const airData = await airResponse.json();

    console.log("✅ All weather APIs responded successfully");

    // Structure the comprehensive response
    const comprehensiveWeatherData = {
      weather: {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        uvIndex: uvData.value ? Math.round(uvData.value * 10) / 10 : 0,
        weatherMain: weatherData.weather[0].main,
        weatherDescription: weatherData.weather[0].description,
        windSpeed: weatherData.wind?.speed || 0,
        windDeg: weatherData.wind?.deg || 0,
        rain: weatherData.weather[0].main.toLowerCase().includes('rain') || 
              (weatherData.rain && weatherData.rain['1h'] > 0),
        rainAmount: weatherData.rain?.['1h'] || 0,
        clouds: weatherData.clouds.all
      },
      airQuality: {
        aqi: airData.list[0].main.aqi,
        co: airData.list[0].components.co,
        no: airData.list[0].components.no,
        no2: airData.list[0].components.no2,
        o3: airData.list[0].components.o3,
        so2: airData.list[0].components.so2,
        pm2_5: airData.list[0].components.pm2_5,
        pm10: airData.list[0].components.pm10,
        nh3: airData.list[0].components.nh3
      },
      location: {
        latitude: latitude,
        longitude: longitude,
        city: weatherData.name,
        country: weatherData.sys.country
      },
      lastUpdated: new Date().toISOString()
    };

    console.log(`🌡️ Weather: ${comprehensiveWeatherData.weather.temperature}°C, ${comprehensiveWeatherData.weather.weatherDescription}`);
    console.log(`☀️ UV Index: ${comprehensiveWeatherData.weather.uvIndex}`);
    console.log(`🌬️ AQI: ${comprehensiveWeatherData.airQuality.aqi}`);
    console.log(`💧 Humidity: ${comprehensiveWeatherData.weather.humidity}%`);

    return new Response(
      JSON.stringify(comprehensiveWeatherData),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        },
        status: 200
      },
    )
  } catch (error) {
    console.error("🔥 Weather function error:", error);
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