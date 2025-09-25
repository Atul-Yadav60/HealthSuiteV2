import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import { GradientButton } from "../../components/ui/GradientButton";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchAndScheduleMedications,
  cleanupExpiredMedications,
} from "../../services/NotificationService";

const { width } = Dimensions.get("window");

// --- Medication Interface ---
interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: {
    type: string;
    times: string[];
  };
  created_at?: string;
}

// Simple Card component for this screen
const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default function MedPlannerScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;
  const { session, user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Load Medications (with cleanup) ---
  const loadMedications = useCallback(async () => {
    if (!user?.id) {
      console.log("No authenticated user found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Loading medications for user:", user.id);
      const upcomingMedications = await fetchAndScheduleMedications(user.id);

      // Debug logging to see what we actually get
      console.log("Raw upcomingMedications:", upcomingMedications);
      console.log("Type of upcomingMedications:", typeof upcomingMedications);
      console.log("Is array:", Array.isArray(upcomingMedications));

      // Ensure we always have an array, even if the API returns null/undefined
      const safeMedications = Array.isArray(upcomingMedications)
        ? upcomingMedications
        : [];

      // Validate each medication has the expected structure
      const validatedMedications = safeMedications
        .filter((med) => {
          return med && typeof med === "object" && med.id && med.name;
        })
        .map((med) => ({
          ...med,
          schedule: med.schedule || { type: "", times: [] },
        }));

      console.log("Validated medications:", validatedMedications);
      setMedications(validatedMedications);
    } catch (error: any) {
      console.error("Error loading medications:", error);
      Alert.alert("Error", "Failed to fetch medications: " + error.message);
      // Set empty array on error to prevent map errors
      setMedications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedications();
    setRefreshing(false);
  }, [loadMedications]);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications])
  );

  // --- Delete medication handler ---
  const deleteMedication = async (
    medicationId: string,
    medicationName: string
  ) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete "${medicationName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { supabase } = require("@/lib/supabase");
              const { error } = await supabase
                .from("medications")
                .delete()
                .eq("id", medicationId);
              if (error) throw error;
              await loadMedications();
              Alert.alert("Success", "Medication deleted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                `Failed to delete medication: ${error.message}`
              );
            }
          },
        },
      ]
    );
  };

  // --- Manual cleanup handler ---
  const manualCleanup = async () => {
    const testUserID = "511e52f8-0977-43e0-a7a4-b8cdb1c49eba";
    try {
      const cleanedCount = await cleanupExpiredMedications(testUserID);
      if (cleanedCount > 0) {
        Alert.alert(
          "Cleanup Complete",
          `Removed ${cleanedCount} expired medication(s)`
        );
        await loadMedications();
      } else {
        Alert.alert("No Cleanup Needed", "No expired medications found");
      }
    } catch (error: any) {
      Alert.alert("Error", `Cleanup failed: ${error.message}`);
    }
  };

  // --- Schedule formatting ---
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    let timeLabel = "";
    if (diffMins < 0) timeLabel = `${Math.abs(diffMins)} min ago`;
    else if (diffMins < 60) timeLabel = `in ${diffMins} min`;
    else if (diffHours < 24) timeLabel = `in ${diffHours}h ${diffMins % 60}m`;
    else {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === today.toDateString()) timeLabel = "Today";
      else if (date.toDateString() === tomorrow.toDateString())
        timeLabel = "Tomorrow";
      else
        timeLabel = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
    }
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${timeString} (${timeLabel})`;
  };

  const getStatusColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 0) return colors.error; // Past due
    if (diffMins <= 10) return colors.warning || "#FFA500"; // Due soon
    return colors.success || "#10B981"; // Future
  };

  // --- Render for medication cards ---
  const renderMedicationItem = ({ item }: { item: Medication }) => {
    console.log("Rendering medication item:", item);

    if (!item || typeof item !== "object") {
      console.error("Invalid medication item:", item);
      return null;
    }

    const now = new Date();
    // Add extra safety checks for schedule and times
    const scheduleTimes = item.schedule?.times;
    console.log(
      "Schedule times:",
      scheduleTimes,
      "Type:",
      typeof scheduleTimes,
      "IsArray:",
      Array.isArray(scheduleTimes)
    );

    const futureTimes = Array.isArray(scheduleTimes)
      ? scheduleTimes.filter((t) => {
          try {
            const medicationTime = new Date(t);
            return medicationTime.getTime() > now.getTime() - 60 * 60 * 1000;
          } catch (error) {
            console.error("Invalid time format:", t);
            return false;
          }
        })
      : [];

    console.log("Future times:", futureTimes);

    const nextTime =
      futureTimes.length > 0
        ? futureTimes
            .map((t) => {
              try {
                return new Date(t);
              } catch (error) {
                console.error("Error parsing time:", t);
                return null;
              }
            })
            .filter(Boolean)
            .sort((a, b) => a!.getTime() - b!.getTime())[0]
        : null;

    return (
      <Card style={styles.medicationCard}>
        <View style={styles.medicationHeader}>
          <View style={styles.medicationMainInfo}>
            <View
              style={[
                styles.medIconContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="medkit" size={24} color="white" />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={[styles.medicationName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text
                style={[
                  styles.medicationDosage,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {item.dosage || "No dosage specified"}
              </Text>
              {nextTime && (
                <Text
                  style={[
                    styles.nextTimeText,
                    { color: getStatusColor(nextTime.toISOString()) },
                  ]}
                >
                  Next: {formatDateTime(nextTime.toISOString())}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => deleteMedication(item.id, item.name)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {futureTimes &&
          futureTimes.length > 0 &&
          Array.isArray(futureTimes) && (
            <View style={styles.medicationSchedule}>
              <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                Upcoming Times
              </Text>
              {futureTimes.slice(0, 3).map((time, index) => {
                try {
                  const timeDate = new Date(time);
                  const statusColor = getStatusColor(time);
                  const isPastDue = timeDate.getTime() < now.getTime();
                  return (
                    <View key={index} style={styles.scheduleItem}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: statusColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.scheduleText,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {formatDateTime(time)}
                        {isPastDue && " (Missed)"}
                      </Text>
                    </View>
                  );
                } catch (error) {
                  console.error("Error rendering schedule item:", error);
                  return null;
                }
              })}
              {futureTimes.length > 3 && (
                <Text
                  style={[
                    styles.moreTimesText,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  +{futureTimes.length - 3} more times
                </Text>
              )}
            </View>
          )}
      </Card>
    );
  };

  // --- Main UI ---
  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <LinearGradient colors={["#2066c1ff", "#1a5bb8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Medications</Text>
            <Text style={styles.headerSubtitle}>
              {(medications && medications.length) || 0} active medication
              {((medications && medications.length) || 0) !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            onPress={manualCleanup}
            style={styles.cleanupButton}
          >
            <Ionicons name="refresh-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Medication List / Loading / Empty State */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[styles.loadingText, { color: colors.onSurfaceVariant }]}
            >
              Loading medications...
            </Text>
          </View>
        ) : !medications || medications.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.centered}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            <Card style={styles.emptyStateCard}>
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name="medkit-outline"
                  size={64}
                  color={colors.onSurfaceVariant}
                  style={styles.emptyStateIcon}
                />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  No Active Medications
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtitle,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Add your first medication to get started with smart reminders
                  and automatic tracking.
                </Text>
              </View>
            </Card>
          </ScrollView>
        ) : Array.isArray(medications) && medications.length > 0 ? (
          <FlatList
            data={medications.filter(
              (med) => med && typeof med === "object" && med.id
            )}
            renderItem={renderMedicationItem}
            keyExtractor={(item) => item.id || `${Date.now()}-${Math.random()}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <View style={styles.centered}>
            <Text
              style={[styles.loadingText, { color: colors.onSurfaceVariant }]}
            >
              Error loading medications
            </Text>
          </View>
        )}

        {/* Footer - Add Medication */}
        <View style={styles.footer} pointerEvents="box-none">
          <GradientButton
            title="Add New Medication"
            onPress={() => router.push("/add-medication")}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 18,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cleanupButton: {
    padding: 8,
    borderRadius: 8,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 18,
    paddingBottom: 100,
  },
  emptyStateCard: {
    alignItems: "center",
    width: "100%",
  },
  emptyStateContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 95 : 75, // Position above tab bar
    left: 18,
    right: 18,
    zIndex: 1, // Above other elements to be clickable
    backgroundColor: "transparent",
  },
  medicationCard: {
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  medicationMainInfo: {
    flexDirection: "row",
    flex: 1,
  },
  medIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    marginBottom: 8,
  },
  nextTimeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  medicationSchedule: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.1)",
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  scheduleText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  moreTimesText: {
    fontSize: 12,
    fontStyle: "italic",
    marginLeft: 20,
    marginTop: 4,
  },
});
