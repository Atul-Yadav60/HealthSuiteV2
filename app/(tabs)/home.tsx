// File: app/(tabs)/home.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-native";

// Import our new hooks and components
import { useBLE } from "@/contexts/BLEContext";
import { useLocation } from "@/hooks/useLocation";
import { EnvironmentalData, fetchEnvironmentalData } from "@/services/api";
import { InfoCard } from "../../components/ui/InfoCard";
import { WarningScroller } from "../../components/ui/WarningScroller";

// Import existing UI components
import { GlassCard } from "../../components/ui/GlassCard";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import { MOCK_DATA, MODULES, QUICK_ACTIONS } from "../../constants/AppConfig";
import Colors, { gradients, moduleColors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

const { width } = Dimensions.get("window");

// Define the shape of a warning object for our scroller
type Warning = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // --- Data Hooks ---
  const { connectedDevice, heartRate } = useBLE();
  const { location, loading: locationLoading } = useLocation();
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // --- Animation & UI Hooks ---
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Effect to fetch data once location is available
  useEffect(() => {
    const loadApiData = async () => {
      if (location) {
        try {
          setDataLoading(true);
          const env = await fetchEnvironmentalData(location);
          setEnvData(env);
        } catch (error) {
          console.error("Failed to load home screen API data:", error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    if (!locationLoading) {
      loadApiData();
    }
  }, [location, locationLoading]);

  // Effect to start UI animations
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

  // Memoized calculation to generate warnings based on the fetched data
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

  // --- Navigation Handlers ---
  const handleQuickAction = (actionId: string) => {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (action) router.push(`/modules/${action.module}`);
  };

  const handleModulePress = (moduleId: string) => {
    router.push(`/modules/${moduleId}`);
  };

  // --- Render Functions ---
  const renderHealthTip = ({ item }: { item: any }) => (
    <Animated.View
      style={[
        styles.tipCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <GlassCard style={styles.tipContent} gradient>
        <View style={styles.tipHeader}>
          <View
            style={[styles.tipIcon, { backgroundColor: colors.primary + "20" }]}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.tipCategory, { color: colors.primary }]}>
            {item.category}
          </Text>
        </View>
        <Text
          style={[styles.tipTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.tipDescription, { color: colors.onSurfaceVariant }]}
          numberOfLines={3}
        >
          {item.description}
        </Text>
      </GlassCard>
    </Animated.View>
  );

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

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {MOCK_DATA.healthTips.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor:
                index === currentTipIndex
                  ? colors.primary
                  : colors.onSurfaceVariant,
              width: index === currentTipIndex ? 24 : 8,
              transform: [{ scale: index === currentTipIndex ? 1.2 : 1 }],
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
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
              Good morning, {MOCK_DATA.user.name} ✨
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
        {locationLoading || dataLoading ? (
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
                label="Temp & AQI"
                value={envData ? `${envData.temp}°c / ${envData.aqi}` : "--"}
                gradient={["#FFA500", "#FF8C00"]}
              />
            </View>
            <View style={styles.cardRow}>
              <InfoCard
                icon="sunny-outline"
                label="UV & Weather"
                value={envData ? `${envData.uv} / ${envData.weather}` : "N/A"}
                gradient={["#FFD700", "#FFC300"]}
              />
              <InfoCard
                icon="walk-outline"
                label="Steps Today"
                value={4521} // Mocked for now
                unit="steps"
                gradient={["#57C5FF", "#2E9AFE"]}
              />
            </View>
          </>
        )}
      </Animated.View>

      <WarningScroller warnings={warnings} />

      {/* --- Rest of the UI components --- */}
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
            <Animated.View
              key={action.id}
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <QuickActionButton
                actionId={action.id}
                onPress={() => handleQuickAction(action.id)}
                style={styles.quickAction}
              />
            </Animated.View>
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
        <View style={styles.carouselHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Daily Health Tips
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={carouselRef}
          data={MOCK_DATA.healthTips}
          renderItem={renderHealthTip}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={width - 48}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / (width - 48)
            );
            setCurrentTipIndex(index);
          }}
          contentContainerStyle={styles.carouselContent}
        />
        {renderPaginationDots()}
      </Animated.View>

      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Activity
        </Text>
        <GlassCard style={styles.activityCard} gradient>
          <View style={styles.activityItem}>
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="camera" size={20} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                Skin scan completed
              </Text>
              <Text
                style={[
                  styles.activityTime,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                2 hours ago
              </Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: colors.secondary + "20" },
              ]}
            >
              <Ionicons name="heart" size={20} color={colors.secondary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                Mood check-in
              </Text>
              <Text
                style={[
                  styles.activityTime,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Yesterday
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </ScrollView>
  );
}

// All styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1 },
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
  quickActionsContainer: { flexDirection: "row", gap: 16 },
  quickAction: { flex: 1 },
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
  carouselHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  seeAllText: { fontSize: 14, fontWeight: "600" },
  carouselContent: { paddingRight: 24 },
  tipCard: { width: width - 48, marginRight: 16 },
  tipContent: { padding: 24 },
  tipHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipCategory: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 28,
  },
  tipDescription: { fontSize: 16, lineHeight: 24 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  paginationDot: { height: 8, borderRadius: 4 },
  activityCard: { padding: 20 },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  activityTime: { fontSize: 14, opacity: 0.7 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
