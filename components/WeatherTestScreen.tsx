import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWeatherInfo } from "@/hooks/useWeather";
import { weatherService } from "@/services/WeatherService";

/**
 * Weather Test Screen Component
 * Use this component to test and debug the weather service functionality
 */
export default function WeatherTestScreen() {
  const {
    weatherData,
    loading,
    error,
    lastUpdated,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    isDataStale,
    getWeatherDisplay,
    getAQIInfo,
    getUVInfo,
  } = useWeatherInfo(false); // Don't auto-start for testing

  const handleManualRefresh = async () => {
    try {
      await refresh();
      Alert.alert("Success", "Weather data refreshed successfully!");
    } catch (error) {
      Alert.alert("Error", `Failed to refresh: ${error.message}`);
    }
  };

  const handleStartAutoRefresh = () => {
    startAutoRefresh();
    Alert.alert("Started", "8-minute auto-refresh started");
  };

  const handleStopAutoRefresh = () => {
    stopAutoRefresh();
    Alert.alert("Stopped", "Auto-refresh stopped");
  };

  const weatherDisplay = getWeatherDisplay?.();
  const aqiInfo = getAQIInfo?.();
  const uvInfo = getUVInfo?.();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌤️ Weather Service Test</Text>
        <Text style={styles.subtitle}>Test OpenWeather API Integration</Text>
      </View>

      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Loading:</Text>
            <Text
              style={[styles.value, { color: loading ? "#FF6B35" : "#4CAF50" }]}
            >
              {loading ? "Yes" : "No"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Data Stale:</Text>
            <Text
              style={[
                styles.value,
                { color: isDataStale ? "#FF6B35" : "#4CAF50" },
              ]}
            >
              {isDataStale ? "Yes" : "No"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
            </Text>
          </View>
          {error && (
            <View style={styles.statusRow}>
              <Text style={styles.label}>Error:</Text>
              <Text style={[styles.value, { color: "#F44336" }]}>{error}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Controls Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Controls</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleManualRefresh}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Manual Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStartAutoRefresh}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.buttonText}>Start Auto-Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStopAutoRefresh}
          >
            <Ionicons name="stop" size={20} color="#fff" />
            <Text style={styles.buttonText}>Stop Auto-Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weather Data Section */}
      {weatherData && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌡️ Weather Data</Text>
            <View style={styles.dataCard}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Temperature:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.weather.temperature}°C
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Feels Like:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.weather.feelsLike}°C
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Condition:</Text>
                <Text style={styles.dataValue}>
                  {weatherDisplay?.emoji}{" "}
                  {weatherData.weather.weatherDescription}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Humidity:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.weather.humidity}%
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Wind:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.weather.windSpeed} m/s
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Rain:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.weather.rain ? "🌧️ Yes" : "☀️ No"}
                  {weatherData.weather.rainAmount > 0 &&
                    ` (${weatherData.weather.rainAmount}mm)`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>☀️ UV Index</Text>
            <View
              style={[
                styles.dataCard,
                { backgroundColor: uvInfo?.color + "20" },
              ]}
            >
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>UV Index:</Text>
                <Text style={[styles.dataValue, { color: uvInfo?.color }]}>
                  {weatherData.weather.uvIndex} ({uvInfo?.level})
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Recommendation:</Text>
                <Text style={styles.dataValue}>{uvInfo?.message}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌬️ Air Quality</Text>
            <View
              style={[
                styles.dataCard,
                { backgroundColor: aqiInfo?.color + "20" },
              ]}
            >
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>AQI:</Text>
                <Text style={[styles.dataValue, { color: aqiInfo?.color }]}>
                  {aqiInfo?.emoji} {weatherData.airQuality.aqi} (
                  {aqiInfo?.level})
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Recommendation:</Text>
                <Text style={styles.dataValue}>{aqiInfo?.message}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>PM2.5:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.airQuality.pm2_5.toFixed(1)} μg/m³
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>PM10:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.airQuality.pm10.toFixed(1)} μg/m³
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            <View style={styles.dataCard}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>City:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.location.city}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Country:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.location.country}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Coordinates:</Text>
                <Text style={styles.dataValue}>
                  {weatherData.location.latitude.toFixed(4)},{" "}
                  {weatherData.location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Raw Data Section for Debugging */}
      {weatherData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Raw Data (Debug)</Text>
          <View style={styles.debugCard}>
            <Text style={styles.debugText}>
              {JSON.stringify(weatherData, null, 2)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#2066c1",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#2066c1",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    minWidth: 120,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 14,
  },
  dataCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dataLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  debugCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
  },
  debugText: {
    color: "#00ff00",
    fontFamily: "monospace",
    fontSize: 10,
  },
});
