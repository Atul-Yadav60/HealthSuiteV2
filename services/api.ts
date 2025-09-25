import { LocationObject } from 'expo-location';
import { supabase } from '@/lib/supabase';

export interface EnvironmentalData {
  aqi: number;
  temp: number;
  uv: number;
  weather: string;
  rain: boolean;
}

/**
 * Fetch comprehensive environmental data using Supabase function
 * @deprecated Use WeatherService for real-time weather data with automatic refresh
 */
export const fetchEnvironmentalData = async (location: LocationObject): Promise<EnvironmentalData> => {
  console.log("Fetching environmental data...");
  
  try {
    const { data, error } = await supabase.functions.invoke('get-comprehensive-weather', {
      body: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
    });
    
    if (error) {
      console.error("Environmental data fetch error:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("No environmental data received");
    }
    
    // Convert comprehensive data to legacy format for backward compatibility
    return {
      aqi: data.airQuality.aqi,
      temp: data.weather.temperature,
      uv: data.weather.uvIndex,
      weather: data.weather.weatherMain.toLowerCase(),
      rain: data.weather.rain,
    };
    
  } catch (error) {
    console.error('Environmental data error:', error);
    // Return mock data as fallback to prevent crashes
    return {
      aqi: 151,
      temp: 25,
      uv: 8,
      weather: "hazy",
      rain: false,
    };
  }
};

// It calls the cloud-based 'drug-interaction-v2' function
export const checkDrugInteraction = async (query: string) => {
  console.log(`Checking drug interaction for: "${query}"`);
  
  if (!query || query.trim().length < 5) {
    throw new Error("Please enter a valid question about drug interactions.");
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('drug-interaction-v2', {
      body: { query },
    });
    
    if (error) {
      console.error("Supabase function invocation error:", error);
      throw error;
    }
    
    console.log("Received interaction data:", data);
    return data;
  } catch (error) {
    console.error('Drug interaction error:', error);
    throw error;
  }
};