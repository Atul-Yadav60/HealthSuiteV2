
import { supabase } from '@/lib/supabase'; // Using your existing supabase client
import { Coordinates } from '@/hooks/useLocation';

// A type definition for the data we expect from the API
export interface EnvironmentalData {
  temp: number;
  aqi: number;
  uv: number;
  weather: string;
  rain:boolean
}

export interface HealthData {
  heartRate: number;
  steps: number;
}

// Function to call the Supabase Edge Function
export const fetchEnvironmentalData = async (): Promise<EnvironmentalData> => {
  const { data, error } = await supabase.functions.invoke('environmental-alerts', {
     body: { lat: location.latitude, lon: location.longitude },
  });

  if (error) {
    console.error('Error fetching environmental data:', error);
    throw new Error('Failed to fetch environmental data.');
  }

  // Assuming the function returns data in the correct shape
  return data;
};

// Mock function for heart rate and steps for now
// In the future, this would fetch data from HealthKit, Google Fit, or your device
export const fetchHealthData = async (): Promise<HealthData> => {
  // Simulating an API call
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        heartRate: 78,
        steps: 4521,
      });
    }, 500)
  );
};