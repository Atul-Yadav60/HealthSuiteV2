import { LocationObject } from 'expo-location';
import { supabase } from '@/lib/supabase'; // Using the intelligent client

export interface EnvironmentalData {
  aqi: number;
  temp: number;
  uv: number;
  weather: string;
  rain: boolean;
}

// This function can remain as is.
export const fetchEnvironmentalData = async (location: LocationObject): Promise<EnvironmentalData> => {
  console.log("Fetching environmental data...");
  // In a real app, this would also call a Supabase function
  // For now, we return mock data.
  return new Promise(resolve => setTimeout(() => resolve({
    aqi: 151,
    temp: 25,
    uv: 8,
    weather: "hazy",
    rain: false,
  }), 1000));
};


// --- THIS IS THE CORRECTED FUNCTION ---
// This is where your logic belongs. It's clean and simple.
// It relies on `lib/supabase.ts` to correctly point to either the local or live server.
export const checkDrugInteraction = async (query: string) => {
  console.log(`Checking drug interaction for: "${query}"`);
  
  if (!query || query.trim().length < 5) {
    throw new Error("Please enter a valid question about drug interactions.");
  }

  try {
    // `invoke` will automatically use the correct URL (local or live)
    // because of our setup in `lib/supabase.ts`.
    const { data, error } = await supabase.functions.invoke('drug-interaction', {
      body: { query },
    });

    if (error) {
      console.error("Supabase function invocation error:", error);
      throw error; // Forward the error to be caught by the UI
    }

    console.log("Received interaction data:", data);
    return data;
  } catch (error) {
    console.error('Drug interaction error:', error);
    // Re-throw the error to be handled by the component
    throw error;
  }
};






    

