import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { InfoCard } from "../../components/ui/InfoCard";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import Colors, { gradients } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

const { width } = Dimensions.get("window");

// Simplified health data
const HEALTH_METRICS = {
  bloodPressure: "120/80",
  steps: "8,542",
  heartRate: "72",
  weight: "68 kg",
};

// Quick health actions
const HEALTH_ACTIONS = [
  {
    id: "symptoms",
    title: "Log Symptoms",
    icon: "medical-outline",
    color: "#10B981",
  },
  {
    id: "medications",
    title: "Medications",
    icon: "medical-outline",
    color: "#6366F1",
  },
  {
    id: "appointments",
    title: "Appointments",
    icon: "calendar-outline",
    color: "#EC4899",
  },
];

// Health categories - simplified
const HEALTH_CATEGORIES = [
  {
    id: "records",
    title: "Health Records",
    subtitle: "Medical history & documents",
    icon: "folder-outline",
    count: "5 files",
    color: "#8B5CF6",
  },
  {
    id: "allergies",
    title: "Allergies",
    subtitle: "Known allergies & reactions",
    icon: "warning-outline",
    count: "3 items",
    color: "#F59E0B",
  },
  {
    id: "conditions",
    title: "Conditions",
    subtitle: "Ongoing health conditions",
    icon: "medical-outline",
    count: "2 active",
    color: "#EF4444",
  },
];

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleQuickAction = (actionId: string) => {
    router.push("/health/coming-soon");
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push("/health/coming-soon");
  };

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
      {/* Header with Gradient */}
      <LinearGradient
        colors={gradients.premium}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              My Health 🏥
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Track your wellness journey
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Health Metrics Cards */}
      <View style={styles.section}>
        <View style={styles.cardRow}>
          <InfoCard
            icon="heart-outline"
            label="Heart Rate"
            value={HEALTH_METRICS.heartRate}
            unit="bpm"
            gradient={["#FF5757", "#FF2E2E"]}
          />
          <InfoCard
            icon="pulse-outline"
            label="Blood Pressure"
            value={HEALTH_METRICS.bloodPressure}
            gradient={["#6366F1", "#8B5CF6"]}
          />
        </View>
        <View style={styles.cardRow}>
          <InfoCard
            icon="walk-outline"
            label="Steps Today"
            value={HEALTH_METRICS.steps}
            unit="steps"
            gradient={["#10B981", "#34D399"]}
          />
          <InfoCard
            icon="scale-outline"
            label="Weight"
            value={HEALTH_METRICS.weight}
            gradient={["#EC4899", "#F472B6"]}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsContainer}>
          {HEALTH_ACTIONS.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onPress={() => handleQuickAction(action.id)}
              style={styles.quickAction}
            />
          ))}
        </View>
      </View>

      {/* Health Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Health Categories
        </Text>
        <View style={styles.categoriesContainer}>
          {HEALTH_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: colors.card }]}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={category.color}
                  />
                </View>
                <Text style={[styles.categoryCount, { color: colors.primary }]}>
                  {category.count}
                </Text>
              </View>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {category.title}
              </Text>
              <Text
                style={[
                  styles.categorySubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {category.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  header: {
    paddingTop: 60,
    paddingBottom: 60,
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
  section: { paddingHorizontal: 18, marginTop: 32 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
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
  quickAction: { flex: 1 },
  categoriesContainer: { gap: 16 },
  categoryCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
});
