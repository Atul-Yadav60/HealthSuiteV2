import { supabase } from '@/lib/supabase';
import * as Location from 'expo-location';
import { Coordinates } from '@/hooks/useLocation';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  weatherMain: string; // e.g., "Clear", "Clouds", "Rain", "Haze"
  weatherDescription: string; // e.g., "clear sky", "few clouds", "haze"
  windSpeed: number;
  windDeg: number;
  rain: boolean;
  rainAmount?: number; // mm in last hour
  clouds: number; // cloudiness %
}

export interface AirQualityData {
  aqi: number; // 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
  co: number; // Carbon monoxide μg/m3
  no: number; // Nitric oxide μg/m3
  no2: number; // Nitrogen dioxide μg/m3
  o3: number; // Ozone μg/m3
  so2: number; // Sulphur dioxide μg/m3
  pm2_5: number; // Fine particles matter μg/m3
  pm10: number; // Coarse particulate matter μg/m3
  nh3: number; // Ammonia μg/m3
}

export interface EnvironmentalData {
  weather: WeatherData;
  airQuality: AirQualityData;
  lastUpdated: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

/**
 * Weather Service Class
 * Manages real-time weather data fetching with automatic 8-minute refresh intervals
 */
class WeatherService {
  private static instance: WeatherService;
  private refreshInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: EnvironmentalData | null) => void> = [];
  private currentData: EnvironmentalData | null = null;
  private isRefreshing = false;
  
  // 8 minutes in milliseconds
  private readonly REFRESH_INTERVAL = 8 * 60 * 1000;

  private constructor() {}

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Subscribe to weather data updates
   */
  subscribe(callback: (data: EnvironmentalData | null) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately provide current data if available
    if (this.currentData) {
      callback(this.currentData);
    }

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Start automatic weather data fetching with 8-minute intervals
   */
  async startAutoRefresh(): Promise<void> {
    console.log('🌤️ Starting weather auto-refresh every 8 minutes...');
    
    // Clear existing interval if any
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Fetch data immediately
    await this.fetchWeatherData();

    // Set up 8-minute interval
    this.refreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refreshing weather data...');
      await this.fetchWeatherData();
    }, this.REFRESH_INTERVAL);
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Weather auto-refresh stopped');
    }
  }

  /**
   * Manually fetch fresh weather data
   */
  async refreshWeatherData(): Promise<EnvironmentalData | null> {
    return await this.fetchWeatherData(true);
  }

  /**
   * Get current cached weather data
   */
  getCurrentData(): EnvironmentalData | null {
    return this.currentData;
  }

  /**
   * Check if data is stale (older than 10 minutes)
   */
  private isDataStale(): boolean {
    if (!this.currentData) return true;
    
    const lastUpdate = new Date(this.currentData.lastUpdated);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    return diffMinutes > 10;
  }

  /**
   * Get user's current location with high accuracy
   */
  private async getCurrentLocation(): Promise<Coordinates> {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Get current position with high accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      maximumAge: 30000, // Use cached location if less than 30 seconds old
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  /**
   * Main method to fetch comprehensive weather data
   */
  private async fetchWeatherData(forceRefresh = false): Promise<EnvironmentalData | null> {
    // Prevent multiple simultaneous refresh calls
    if (this.isRefreshing && !forceRefresh) {
      console.log('⏳ Weather refresh already in progress...');
      return this.currentData;
    }

    // Check if we need to refresh
    if (!forceRefresh && !this.isDataStale()) {
      console.log('✅ Weather data is fresh, no refresh needed');
      return this.currentData;
    }

    this.isRefreshing = true;

    try {
      console.log('🌍 Fetching comprehensive weather data...');
      
      // Get current location
      const location = await this.getCurrentLocation();
      console.log(`📍 Location: ${location.latitude}, ${location.longitude}`);

      // Fetch data from Supabase function
      const { data, error } = await supabase.functions.invoke('get-comprehensive-weather', {
        body: { 
          latitude: location.latitude, 
          longitude: location.longitude 
        },
      });

      if (error) {
        console.error('❌ Weather fetch error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No weather data received');
      }

      // Update current data
      this.currentData = {
        ...data,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          city: data.location?.city,
          country: data.location?.country,
        },
        lastUpdated: new Date().toISOString(),
      };

      console.log('✅ Weather data updated successfully');
      console.log(`🌡️ Temperature: ${this.currentData.weather.temperature}°C`);
      console.log(`☁️ Condition: ${this.currentData.weather.weatherDescription}`);
      console.log(`🌬️ AQI: ${this.currentData.airQuality.aqi}`);
      console.log(`☀️ UV Index: ${this.currentData.weather.uvIndex}`);

      // Notify all subscribers
      this.notifySubscribers(this.currentData);

      return this.currentData;

    } catch (error) {
      console.error('🔥 Weather service error:', error);
      
      // Notify subscribers of error (pass null)
      this.notifySubscribers(null);
      
      // Don't throw error to prevent app crashes
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Notify all subscribers of data updates
   */
  private notifySubscribers(data: EnvironmentalData | null): void {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Subscriber callback error:', error);
      }
    });
  }

  /**
   * Get weather condition emoji and message
   */
  static getWeatherDisplay(weatherMain: string, rain: boolean): { emoji: string; condition: string } {
    const main = weatherMain.toLowerCase();
    
    if (rain) {
      return { emoji: '🌧️', condition: 'Rainy' };
    }
    
    switch (main) {
      case 'clear':
        return { emoji: '☀️', condition: 'Clear' };
      case 'clouds':
        return { emoji: '☁️', condition: 'Cloudy' };
      case 'rain':
        return { emoji: '🌧️', condition: 'Rainy' };
      case 'drizzle':
        return { emoji: '🌦️', condition: 'Drizzle' };
      case 'thunderstorm':
        return { emoji: '⛈️', condition: 'Thunderstorm' };
      case 'snow':
        return { emoji: '❄️', condition: 'Snow' };
      case 'mist':
      case 'fog':
        return { emoji: '🌫️', condition: 'Misty' };
      case 'haze':
        return { emoji: '🌫️', condition: 'Hazy' };
      case 'dust':
      case 'sand':
        return { emoji: '🌪️', condition: 'Dusty' };
      default:
        return { emoji: '🌤️', condition: 'Partly Cloudy' };
    }
  }

  /**
   * Get AQI level information
   */
  static getAQIInfo(aqi: number): { level: string; color: string; emoji: string; message: string } {
    switch (aqi) {
      case 1:
        return {
          level: 'Good',
          color: '#00E400',
          emoji: '😊',
          message: 'Air quality is good. Perfect for outdoor activities!'
        };
      case 2:
        return {
          level: 'Fair',
          color: '#FFFF00',
          emoji: '🙂',
          message: 'Air quality is acceptable for most people.'
        };
      case 3:
        return {
          level: 'Moderate',
          color: '#FF7E00',
          emoji: '😐',
          message: 'Sensitive people should limit outdoor activities.'
        };
      case 4:
        return {
          level: 'Poor',
          color: '#FF0000',
          emoji: '😷',
          message: 'Air quality is unhealthy. Limit outdoor activities.'
        };
      case 5:
        return {
          level: 'Very Poor',
          color: '#8F3F97',
          emoji: '🚨',
          message: 'Air quality is very unhealthy. Avoid outdoor activities.'
        };
      default:
        return {
          level: 'Unknown',
          color: '#999999',
          emoji: '❓',
          message: 'Air quality data unavailable.'
        };
    }
  }

  /**
   * Get UV Index information
   */
  static getUVInfo(uvIndex: number): { level: string; color: string; message: string } {
    if (uvIndex <= 2) {
      return {
        level: 'Low',
        color: '#289500',
        message: 'You can safely stay outside.'
      };
    } else if (uvIndex <= 5) {
      return {
        level: 'Moderate',
        color: '#F7E400',
        message: 'Seek shade during midday hours.'
      };
    } else if (uvIndex <= 7) {
      return {
        level: 'High',
        color: '#F85900',
        message: 'Protection required. Avoid midday sun.'
      };
    } else if (uvIndex <= 10) {
      return {
        level: 'Very High',
        color: '#D8001D',
        message: 'Extra protection needed. Avoid sun exposure.'
      };
    } else {
      return {
        level: 'Extreme',
        color: '#6B49C8',
        message: 'Stay indoors. UV radiation is dangerous.'
      };
    }
  }
}

// Export singleton instance
export const weatherService = WeatherService.getInstance();
export default weatherService;