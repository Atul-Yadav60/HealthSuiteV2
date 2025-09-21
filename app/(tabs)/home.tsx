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
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";

// --- Hooks and Services ---
import { useAuth } from "../../hooks/useAuth";
import { useBLE } from "../../contexts/BLEContext";
import { useLocation } from "../../hooks/useLocation";
import { fetchEnvironmentalData } from "../../services/api";
import { useColorScheme } from "../../hooks/useColorScheme";

// --- UI Components and Constants ---
import { InfoCard } from "../../components/ui/InfoCard";
import { WarningScroller } from "../../components/ui/WarningScroller";
import { GlassCard } from "../../components/ui/GlassCard";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import { MOCK_DATA, MODULES, QUICK_ACTIONS } from "../../constants/AppConfig";
import Colors, { gradients, moduleColors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

// Define the shape of our data and warnings
type EnvironmentalData = {
  aqi: number;
  co: number;
  o3: number;
  pm2_5: number;
  [key: string]: any; // Allow other properties
};

type Warning = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // --- State Management ---
  const { session, loading: authLoading } = useAuth();
  const { connectedDevice, heartRate } = useBLE();
  const { location, loading: locationLoading } = useLocation();

  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Animation & UI State ---
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // --- Data Fetching Logic ---
  const loadApiData = useCallback(async () => {
    // Guard clauses: only fetch if logged in and location is available
    if (!session || !location) {
      if (!session) setError("Please log in to view your health data.");
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      setError(null);
      const data = await fetchEnvironmentalData();
      setEnvData(data);
    } catch (err) {
      console.error("Failed to load home screen API data:", err);
      setError("Failed to fetch environmental data.");
    } finally {
      setDataLoading(false);
    }
  }, [session, location]); // Dependencies for the callback

  // Effect to trigger data loading when auth and location are ready
  useEffect(() => {
    if (!authLoading && !locationLoading) {
      loadApiData();
    }
  }, [authLoading, locationLoading, loadApiData]);

  // Handler for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadApiData().then(() => setRefreshing(false));
  }, [loadApiData]);

  // Effect to start UI animations on component mount
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

  // Memoized calculation to generate warnings based on fetched data
  const warnings = useMemo((): Warning[] => {
    const newWarnings: Warning[] = [];
    if (!envData) return [];
    if (envData.aqi >= 4) {
      // AQI 4 is 'Poor'
      newWarnings.push({
        id: "aqi",
        icon: "cloud-outline",
        message: `Poor Air Quality (AQI: ${envData.aqi}). Limit outdoor activity.`,
      });
    }
    if (envData.pm2_5 > 35) {
      // High PM2.5 concentration
      newWarnings.push({
        id: "pm25",
        icon: "warning-outline",
        message: "High PM2.5 levels. Consider wearing a mask.",
      });
    }
    if (envData.o3 > 180) {
      // High Ozone concentration
      newWarnings.push({
        id: "o3",
        icon: "shield-outline",
        message: "High Ozone levels detected.",
      });
    }
    return newWarnings;
  }, [envData]);

  // --- Navigation Handlers ---
  const handleQuickAction = (actionId: string) => {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (action) router.push(action.module as any);
  };

  const handleModulePress = (moduleId: string) => {
    router.push(`/modules/${moduleId}`);
  };

  // --- Render Functions ---
  // (renderHealthTip, renderModuleCard, etc. would go here, same as your provided code)
  // To keep the response concise, these detailed render functions are omitted,
  // but they should be copied over from your provided file.
  // For this example, we'll focus on the main return block and its logic.

  // Main loading state while checking auth or location
  if (authLoading || locationLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.subtitle, { color: colors.text }]}>
          {authLoading ? "Authenticating..." : "Getting location..."}
        </Text>
      </View>
    );
  }

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
        colors={gradients.premium}
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
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good morning, {session?.user?.email?.split("@")[0] || "Guest"} ✨
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Ready to take care of your health today?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Image
              source={{ uri: MOCK_DATA.user.avatar }}
              style={styles.avatar}
            />
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
        ) : error ? (
          <View style={[styles.infoCardError, { height: 250 }]}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
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
                icon="leaf-outline"
                label="AQI / O₃"
                value={
                  envData ? `${envData.aqi} / ${envData.o3.toFixed(0)}` : "--"
                }
                unit="μg/m³"
                gradient={["#FFA500", "#FF8C00"]}
              />
            </View>
            <View style={styles.cardRow}>
              <InfoCard
                icon="warning-outline"
                label="CO / PM2.5"
                value={
                  envData
                    ? `${envData.co.toFixed(0)} / ${envData.pm2_5.toFixed(0)}`
                    : "--"
                }
                unit="μg/m³"
                gradient={["#FFD700", "#FFC300"]}
              />
              <InfoCard
                icon="walk-outline"
                label="Steps Today"
                value={4521}
                unit="steps"
                gradient={["#57C5FF", "#2E9AFE"]}
              />
            </View>
          </>
        )}
      </Animated.View>

      <WarningScroller warnings={warnings} />

      {/* --- Other UI Sections (Quick Actions, Modules, Tips) --- */}
      {/* These sections would be included here, using the same structure from your provided code */}
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
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton
              key={action.id}
              actionId={action.id}
              onPress={() => handleQuickAction(action.id)}
              style={styles.quickAction}
            />
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

// NOTE: Please reuse the extensive stylesheet from your provided code.
// A simplified version is included here for completeness.
const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { justifyContent: "center", alignItems: "center" },
  contentContainer: { paddingBottom: 100 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, opacity: 0.9 },
  profileButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  avatar: { width: "100%", height: "100%" },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  infoCardError: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  quickAction: {
    flex: 1,
  },
});
