# 🌤️ Real-Time Weather Implementation Guide

## Overview

This implementation provides real-time weather data with automatic 8-minute refresh intervals using OpenWeather API through Supabase Edge Functions.

## 🚀 Features Implemented

### ✅ Comprehensive Weather Data

- **Temperature**: Current temp + feels like
- **Air Quality Index (AQI)**: 1-5 scale with health recommendations
- **UV Index**: 0-11+ scale with protection advice
- **Weather Conditions**: Clear, cloudy, rainy, hazy, etc.
- **Humidity**: Percentage moisture in air
- **Wind**: Speed and direction
- **Rain Detection**: Real-time precipitation status

### ✅ Automatic Refresh System

- **8-minute intervals**: Configurable auto-refresh
- **Location-based**: Uses device GPS coordinates
- **Background updates**: Continues when app is active
- **Smart caching**: Prevents unnecessary API calls
- **Error resilience**: Graceful fallback to cached data

### ✅ Real-Time Location Integration

- **High accuracy GPS**: Uses Expo Location with precise coordinates
- **Permission handling**: Proper location permission management
- **Dynamic updates**: Updates weather when location changes

## 🔧 Setup Instructions

### 1. Supabase Environment Variables

Add these to your Supabase project settings (`Dashboard > Project Settings > Environment Variables`):

```bash
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**Get your API key:**

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Go to API Keys section
4. Copy your API key

### 2. Deploy Supabase Functions

```bash
# Navigate to your project root
cd HealthSuiteV2

# Deploy the new comprehensive weather function
npx supabase functions deploy get-comprehensive-weather

# Verify deployment
npx supabase functions list
```

### 3. Test the Implementation

**Option A: Use Weather Test Screen**

1. Import and use `WeatherTestScreen` component for debugging
2. Test manual refresh, auto-refresh start/stop
3. View detailed weather data and API responses

**Option B: Test in Home Screen**

1. The home screen now shows enhanced weather cards
2. Look for the status indicator showing "Real-time data • Auto-refresh: 8min"
3. Pull to refresh to trigger manual update

## 📱 Usage in Components

### Basic Usage with Auto-Refresh

```typescript
import { useWeatherInfo } from "@/hooks/useWeather";

function MyComponent() {
  const { weatherData, loading, error } = useWeatherInfo(true); // Auto-start 8min refresh

  if (loading) return <Text>Loading weather...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (!weatherData) return <Text>No weather data</Text>;

  return (
    <View>
      <Text>🌡️ {weatherData.weather.temperature}°C</Text>
      <Text>🌬️ AQI: {weatherData.airQuality.aqi}</Text>
      <Text>☀️ UV: {weatherData.weather.uvIndex}</Text>
      <Text>💧 Humidity: {weatherData.weather.humidity}%</Text>
    </View>
  );
}
```

### Manual Control

```typescript
import { useWeatherInfo } from "@/hooks/useWeather";

function WeatherControls() {
  const {
    weatherData,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    isDataStale,
  } = useWeatherInfo(false); // Don't auto-start

  return (
    <View>
      <Button title="Refresh Now" onPress={refresh} />
      <Button title="Start Auto-Refresh" onPress={startAutoRefresh} />
      <Button title="Stop Auto-Refresh" onPress={stopAutoRefresh} />
      <Text>Data Status: {isDataStale ? "Stale" : "Fresh"}</Text>
    </View>
  );
}
```

## 🗃️ File Structure

```
services/
├── WeatherService.ts          # Core weather service with 8-min refresh
└── api.ts                     # Updated with real weather integration

hooks/
└── useWeather.ts              # React hook for weather data

supabase/functions/
└── get-comprehensive-weather/ # Supabase edge function
    ├── index.ts              # Function implementation
    ├── deno.json             # Deno configuration
    └── import_map.json       # Import mappings

components/
└── WeatherTestScreen.tsx     # Test/debug component (optional)

app/(tabs)/
└── home.tsx                  # Updated with enhanced weather display
```

## 🎯 API Endpoints Used

The implementation calls these OpenWeather API endpoints simultaneously:

1. **Current Weather**: `https://api.openweathermap.org/data/2.5/weather`

   - Temperature, humidity, wind, weather conditions
   - Units: metric (Celsius)

2. **UV Index**: `https://api.openweathermap.org/data/2.5/uvi`

   - UV radiation levels with health recommendations

3. **Air Pollution**: `https://api.openweathermap.org/data/2.5/air_pollution`
   - AQI scale 1-5, PM2.5, PM10, pollutant levels

## 🔄 How 8-Minute Auto-Refresh Works

1. **Initialization**: When `useWeatherInfo(true)` is called, auto-refresh starts
2. **Interval Timer**: JavaScript `setInterval` runs every 8 minutes (480,000ms)
3. **Smart Updates**: Only fetches if data is stale (>10 minutes old)
4. **Location Check**: Gets current GPS coordinates for accuracy
5. **API Calls**: Fetches from 3 OpenWeather endpoints simultaneously
6. **State Updates**: All subscribed components receive updated data
7. **Background Resilience**: Continues while app is active/foreground

## 🛠️ Debugging & Troubleshooting

### Check API Key

```bash
# Verify API key is set in Supabase
npx supabase secrets list

# Test API key directly
curl "https://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=YOUR_API_KEY"
```

### Check Function Logs

```bash
# View function logs
npx supabase functions logs get-comprehensive-weather

# Or check in Supabase Dashboard > Edge Functions > Logs
```

### Common Issues

**❌ "OpenWeather API key not configured"**

- Solution: Add `OPENWEATHER_API_KEY` to Supabase environment variables

**❌ "Permission to access location was denied"**

- Solution: Check app permissions in device settings

**❌ "Weather API failed: 401 Unauthorized"**

- Solution: Verify API key is valid and active

**❌ Data not updating every 8 minutes**

- Solution: Check if auto-refresh is started with `useWeatherInfo(true)`

## 📊 Performance Considerations

- **API Limits**: Free OpenWeather allows 1,000 calls/day (sufficient for 8-min intervals)
- **Battery**: Uses GPS efficiently with 30-second cache
- **Network**: Parallel API calls reduce total response time
- **Caching**: Smart caching prevents unnecessary updates
- **Error Handling**: Graceful degradation with fallback data

## 🎉 Integration Complete!

Your app now has:

- ✅ Real-time weather data from OpenWeather API
- ✅ Automatic 8-minute refresh intervals
- ✅ Accurate location-based data
- ✅ Comprehensive weather information (temp, AQI, UV, humidity)
- ✅ Smart error handling and fallbacks
- ✅ Enhanced home screen weather display
- ✅ Background service management

The weather data will automatically refresh every 8 minutes while your app is active, providing users with current conditions based on their exact location!
