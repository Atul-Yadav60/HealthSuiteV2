import { useState, useEffect, useCallback } from 'react';
import { weatherService, EnvironmentalData, WeatherData, AirQualityData } from '@/services/WeatherService';

export interface UseWeatherReturn {
  weatherData: EnvironmentalData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  isDataStale: boolean;
}

/**
 * React hook for accessing real-time weather data with automatic 8-minute refresh
 * 
 * @param autoStart - Whether to automatically start the 8-minute refresh interval
 * @returns Weather data and control functions
 */
export const useWeather = (autoStart: boolean = true): UseWeatherReturn => {
  const [weatherData, setWeatherData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Check if data is stale (older than 10 minutes)
  const isDataStale = weatherData 
    ? (Date.now() - new Date(weatherData.lastUpdated).getTime()) > 10 * 60 * 1000 
    : true;

  // Handle weather data updates from the service
  const handleWeatherUpdate = useCallback((data: EnvironmentalData | null) => {
    setWeatherData(data);
    setLastUpdated(data ? new Date(data.lastUpdated) : null);
    setLoading(false);
    
    if (data) {
      setError(null);
      console.log('🔄 Weather data updated in hook:', {
        temp: data.weather.temperature,
        condition: data.weather.weatherDescription,
        aqi: data.airQuality.aqi,
        uv: data.weather.uvIndex
      });
    } else {
      setError('Failed to fetch weather data');
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.refreshWeatherData();
      handleWeatherUpdate(data);
    } catch (err) {
      console.error('Weather refresh error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh weather data');
      setLoading(false);
    }
  }, [handleWeatherUpdate]);

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    console.log('🌤️ Starting weather auto-refresh...');
    weatherService.startAutoRefresh();
  }, []);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    console.log('⏹️ Stopping weather auto-refresh...');
    weatherService.stopAutoRefresh();
  }, []);

  // Set up subscription and auto-refresh on mount
  useEffect(() => {
    console.log('🌤️ Initializing weather hook...');
    
    // Subscribe to weather updates
    const unsubscribe = weatherService.subscribe(handleWeatherUpdate);

    // Get current data if available
    const currentData = weatherService.getCurrentData();
    if (currentData) {
      handleWeatherUpdate(currentData);
    } else {
      setLoading(true);
    }

    // Start auto-refresh if requested
    if (autoStart) {
      startAutoRefresh();
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up weather hook...');
      unsubscribe();
      if (autoStart) {
        stopAutoRefresh();
      }
    };
  }, [autoStart, handleWeatherUpdate, startAutoRefresh, stopAutoRefresh]);

  return {
    weatherData,
    loading,
    error,
    lastUpdated,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    isDataStale,
  };
};

/**
 * Hook for accessing specific weather information with formatting
 */
export const useWeatherInfo = (autoStart: boolean = true) => {
  const weather = useWeather(autoStart);

  const getWeatherDisplay = useCallback(() => {
    if (!weather.weatherData) return null;
    
    const { weatherMain, rain } = weather.weatherData.weather;
    return weatherService.constructor.prototype.getWeatherDisplay(weatherMain, rain);
  }, [weather.weatherData]);

  const getAQIInfo = useCallback(() => {
    if (!weather.weatherData) return null;
    
    const { aqi } = weather.weatherData.airQuality;
    return weatherService.constructor.prototype.getAQIInfo(aqi);
  }, [weather.weatherData]);

  const getUVInfo = useCallback(() => {
    if (!weather.weatherData) return null;
    
    const { uvIndex } = weather.weatherData.weather;
    return weatherService.constructor.prototype.getUVInfo(uvIndex);
  }, [weather.weatherData]);

  return {
    ...weather,
    getWeatherDisplay,
    getAQIInfo,
    getUVInfo,
  };
};

export default useWeather;