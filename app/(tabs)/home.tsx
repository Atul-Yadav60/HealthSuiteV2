import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";

// --- Hooks and Services ---
import { useAuth } from "@/hooks/useAuth";
import { useBLE } from "@/contexts/BLEContext";
import { useLocation } from "@/hooks/useLocation";
import { usePedometer } from "@/hooks/usePedometer";
import { useWeatherInfo } from "@/hooks/useWeather";
import { fetchEnvironmentalData, EnvironmentalData } from "@/services/api";
import { useColorScheme } from "@/hooks/useColorScheme";

// --- UI Components and Constants ---
import { InfoCard } from "../../components/ui/InfoCard";
import { WarningScroller } from "../../components/ui/WarningScroller";
import { GlassCard } from "../../components/ui/GlassCard";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import { MOCK_DATA, MODULES, QUICK_ACTIONS } from "../../constants/AppConfig";
import DefaultColors, {
  gradients,
  moduleColors,
  Colors,
} from "../../constants/Colors";

const { width } = Dimensions.get("window");

type Warning = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
};

const MOCK_ENV_DATA: EnvironmentalData = {
  aqi: 151,
  temp: 25,
  uv: 8,
  weather: "hazy",
  rain: false,
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;

  // --- Filtered Quick Actions ---
  const VISIBLE_QUICK_ACTIONS = QUICK_ACTIONS.filter((action) =>
    ["scanSkin", "verifyRx", "medPlanner"].includes(action.id)
  );

  // --- State Management ---
  const { session, loading: authLoading } = useAuth();
  const { connectedDevice, heartRate } = useBLE();
  const { location, loading: locationLoading } = useLocation();
  const { pastStepCount } = usePedometer();

  // New weather service integration with 8-minute auto-refresh
  const {
    weatherData,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
    isDataStale,
  } = useWeatherInfo(true); // Auto-start 8-minute refresh

  const [refreshing, setRefreshing] = useState(false);

  // --- Animation & UI State ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  //  Logic to get unique daily health tips ---
  const dailyHealthTips = useMemo(() => {
    const date = new Date();
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const shuffledTips = [...MOCK_DATA.healthTips].sort((a, b) => {
      const aVal =
        (parseInt(a.id, 10) * dayOfYear) % MOCK_DATA.healthTips.length;
      const bVal =
        (parseInt(b.id, 10) * dayOfYear) % MOCK_DATA.healthTips.length;
      return aVal - bVal;
    });

    // Return the first 6 tips for the day
    return shuffledTips.slice(0, 6);
  }, []);

  // Convert weather data to legacy format for backward compatibility
  const envData = useMemo(() => {
    if (!weatherData) return MOCK_ENV_DATA;

    return {
      aqi: weatherData.airQuality.aqi,
      temp: weatherData.weather.temperature,
      uv: weatherData.weather.uvIndex,
      weather: weatherData.weather.weatherMain.toLowerCase(),
      rain: weatherData.weather.rain,
    };
  }, [weatherData]);

  // Combined loading state
  const dataLoading = authLoading || locationLoading || weatherLoading;

  // Refresh handler that triggers weather refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshWeather();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshWeather]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const warnings = useMemo((): Warning[] => {
    const newWarnings: Warning[] = [];
    if (!envData) return [];
    if (envData.aqi > 100) {
      newWarnings.push({
        id: "aqi",
        icon: "cloud-outline",
        message: "Bad AQI - Wear a mask",
      });
    }
    if (envData.temp > 35) {
      newWarnings.push({
        id: "temp",
        icon: "thermometer-outline",
        message: "High Temp - Stay hydrated",
      });
    }
    if (envData.uv > 6) {
      newWarnings.push({
        id: "uv",
        icon: "sunny-outline",
        message: "High UV Index - Use sunscreen",
      });
    }
    if (envData.rain) {
      newWarnings.push({
        id: "rain",
        icon: "rainy-outline",
        message: "Chance of Rain - Carry umbrella",
      });
    }
    return newWarnings;
  }, [envData]);

  const handleQuickAction = (actionId: string) => {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (action) router.push(action.module as any);
  };

  const handleModulePress = (moduleId: string) => {
    if (moduleId === "medPlanner") {
      router.push("/(tabs)/medPlanner");
    } else if (moduleId === "skinAI") {
      router.push("/(tabs)/skinScan");
    } else if (moduleId === "trustMed") {
      router.push("/(tabs)/trustMed");
    } else if (moduleId === "symptoCare") {
      router.push("/(tabs)/symptoCare");
    } else {
      router.push(`/modules/${moduleId}`);
    }
  };

  const renderModuleCard = ({ item }: { item: any }) => (
    <Animated.View
      style={[
        styles.moduleCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => handleModulePress(item.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            moduleColors[item.id as keyof typeof moduleColors]?.gradient ||
            gradients.primary
          }
          style={styles.moduleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.moduleContent}>
            <View style={styles.moduleIconContainer}>
              <Ionicons name={item.icon as any} size={32} color={colors.text} />
            </View>
            <Text
              style={[styles.moduleTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.moduleSubtitle,
                { color: colors.onSurfaceVariant },
              ]}
              numberOfLines={1}
            >
              {item.subtitle}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <LinearGradient
        colors={["#4F46E5", "#7C3AED", "#EC4899"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* App Name */}
          <View style={styles.appNameContainer}>
            <Text style={styles.appName}>Aarogya AI</Text>
            <View style={styles.appNameUnderline} />
          </View>

          {/* User Profile Icon */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.profileGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {MOCK_DATA?.user?.avatar ? (
                <Image
                  source={{ uri: MOCK_DATA.user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person" size={28} color="#FFFFFF" />
              )}
            </LinearGradient>
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.section,
          {
            paddingHorizontal: 18,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {dataLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ height: 250 }}
          />
        ) : (
          <>
            <View style={styles.cardRow}>
              <InfoCard
                icon="heart-outline"
                label="Heart Rate"
                value={connectedDevice && heartRate > 0 ? heartRate : "--"}
                unit={connectedDevice ? "bpm" : "No Device"}
                gradient={["#FF5757", "#FF2E2E"]}
              />
              <InfoCard
                icon="thermometer-outline"
                label="Temperature"
                value={
                  weatherData
                    ? `${weatherData.weather.temperature}°C`
                    : envData
                    ? `${envData.temp}°C`
                    : "--"
                }
                unit={
                  weatherData ? `Feels ${weatherData.weather.feelsLike}°C` : ""
                }
                gradient={["#FFA500", "#FF8C00"]}
              />
            </View>
            <View style={styles.cardRow}>
              <InfoCard
                icon="cloudy-outline"
                label="Air Quality"
                value={
                  weatherData
                    ? `AQI ${weatherData.airQuality.aqi}`
                    : envData
                    ? `AQI ${envData.aqi}`
                    : "--"
                }
                unit={
                  weatherData
                    ? weatherData.airQuality.aqi <= 2
                      ? "Good"
                      : weatherData.airQuality.aqi === 3
                      ? "Moderate"
                      : weatherData.airQuality.aqi >= 4
                      ? "Poor"
                      : "Unknown"
                    : ""
                }
                gradient={
                  weatherData
                    ? weatherData.airQuality.aqi <= 2
                      ? ["#00E400", "#4CAF50"]
                      : weatherData.airQuality.aqi === 3
                      ? ["#FF7E00", "#FF9800"]
                      : ["#FF0000", "#F44336"]
                    : ["#999999", "#757575"]
                }
              />
              <InfoCard
                icon="sunny-outline"
                label="UV & Weather"
                value={
                  weatherData
                    ? `UV ${weatherData.weather.uvIndex}`
                    : envData
                    ? `UV ${envData.uv}`
                    : "--"
                }
                unit={
                  weatherData
                    ? weatherData.weather.weatherDescription
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    : envData
                    ? envData.weather
                    : ""
                }
                gradient={["#FFD700", "#FFC300"]}
              />
            </View>
            <View style={styles.cardRow}>
              <InfoCard
                icon="walk-outline"
                label="Steps Today"
                value={pastStepCount > 0 ? pastStepCount : "--"}
                unit="steps"
                gradient={["#57C5FF", "#2E9AFE"]}
              />
              <InfoCard
                icon="water-outline"
                label="Humidity"
                value={weatherData ? `${weatherData.weather.humidity}%` : "--"}
                unit={weatherData && weatherData.weather.rain ? "🌧️ Rain" : ""}
                gradient={["#2196F3", "#1976D2"]}
              />
            </View>
            {/* Weather update status indicator */}
            {weatherData && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  backgroundColor: isDataStale ? "#FF9800" : "#4CAF50",
                  borderRadius: 12,
                  alignSelf: "center",
                }}
              >
                <Ionicons
                  name={
                    isDataStale ? "warning-outline" : "checkmark-circle-outline"
                  }
                  size={12}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "500",
                  }}
                >
                  {isDataStale
                    ? "Updating..."
                    : "Real-time data • Auto-refresh: 8min"}
                </Text>
              </View>
            )}
          </>
        )}
      </Animated.View>

      <WarningScroller warnings={warnings} />

      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsContainer}>
          {VISIBLE_QUICK_ACTIONS.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onPress={() => handleQuickAction(action.id)}
              style={styles.quickAction}
            />
          ))}
        </View>
      </Animated.View>

      {/* --- RESTORED SECTIONS --- */}
      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Health Modules
        </Text>
        <View style={styles.modulesGrid}>
          {Object.values(MODULES).map((module) => (
            <View key={module.id} style={styles.moduleGridItem}>
              {renderModuleCard({ item: module })}
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Daily Health Tips
        </Text>
        <View style={styles.tipsListContainer}>
          {dailyHealthTips.map((tip) => (
            <View
              key={tip.id}
              style={[
                styles.tipItemCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons
                name={tip.icon as any}
                size={22}
                color={colors.primary}
                style={styles.tipItemIcon}
              />
              <Text style={[styles.tipItemText, { color: colors.text }]}>
                {tip.title}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 60 },
  header: {
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appNameContainer: {
    alignItems: "flex-start",
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appNameUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#FBBF24",
    borderRadius: 2,
    marginTop: 6,
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  profileGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FBBF24",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  section: { paddingHorizontal: 20, marginTop: 32 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  quickAction: { flex: 1 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  modulesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  moduleGridItem: { width: (width - 64) / 2 },
  moduleCardContainer: { width: "100%" },
  moduleCard: {
    width: "100%",
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
  },
  moduleGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleContent: { alignItems: "center" },
  moduleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  moduleSubtitle: { fontSize: 12, textAlign: "center", opacity: 0.8 },
  tipsListContainer: {
    gap: 12,
  },
  tipItemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipItemIcon: {
    marginRight: 16,
  },
  tipItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
