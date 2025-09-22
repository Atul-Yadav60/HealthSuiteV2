import { Ionicons } from "@expo/vector-icons";
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
} from "react-native";

import { GradientButton } from "@/components/ui/GradientButton";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  fetchAndScheduleMedications,
  cleanupExpiredMedications,
} from "@/services/NotificationService";

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

export default function MedPlannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedications = useCallback(async () => {
    const testUserID = "511e52f8-0977-43e0-a7a4-b8cdb1c49eba";

    if (!testUserID || testUserID === "YOUR_TEST_USER_ID_HERE") {
      Alert.alert(
        "Configuration Error",
        "Please set your Test User ID in the medication planner"
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Loading medications for user:", testUserID);

      // Use the enhanced fetch function that includes cleanup
      const upcomingMedications = await fetchAndScheduleMedications(testUserID);
      setMedications(upcomingMedications);
    } catch (error: any) {
      console.error("Error loading medications:", error);
      Alert.alert("Error", "Failed to fetch medications: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

              // Refresh the list
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

  const manualCleanup = async () => {
    const testUserID = "511e52f8-0977-43e0-a7a4-b8cdb1c49eba";

    try {
      const cleanedCount = await cleanupExpiredMedications(testUserID);
      if (cleanedCount > 0) {
        Alert.alert(
          "Cleanup Complete",
          `Removed ${cleanedCount} expired medication(s)`
        );
        await loadMedications(); // Refresh the list
      } else {
        Alert.alert("No Cleanup Needed", "No expired medications found");
      }
    } catch (error: any) {
      Alert.alert("Error", `Cleanup failed: ${error.message}`);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

    let timeLabel = "";

    if (diffMins < 0) {
      timeLabel = `${Math.abs(diffMins)} min ago`;
    } else if (diffMins < 60) {
      timeLabel = `in ${diffMins} min`;
    } else if (diffHours < 24) {
      timeLabel = `in ${diffHours}h ${diffMins % 60}m`;
    } else {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        timeLabel = "Today";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        timeLabel = "Tomorrow";
      } else {
        timeLabel = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }
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

  const renderMedicationItem = ({ item }: { item: Medication }) => {
    const now = new Date();
    const futureTimes =
      item.schedule?.times?.filter((t) => {
        const medicationTime = new Date(t);
        return medicationTime.getTime() > now.getTime() - 60 * 60 * 1000; // Include past hour
      }) || [];

    const nextTime = futureTimes
      .map((t) => new Date(t))
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return (
      <View
        style={[
          styles.medicationItem,
          { backgroundColor: colors.surface, borderColor: colors.outline },
        ]}
      >
        <View style={styles.medicationHeader}>
          <View style={styles.medicationMainInfo}>
            <Ionicons
              name="medkit-outline"
              size={32}
              color={colors.primary}
              style={styles.medIcon}
            />
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

        <View style={styles.medicationSchedule}>
          <Text style={[styles.scheduleTitle, { color: colors.text }]}>
            All Scheduled Times:
          </Text>
          {futureTimes.length > 0 ? (
            futureTimes.map((time, index) => {
              const timeDate = new Date(time);
              const statusColor = getStatusColor(time);
              const isPastDue = timeDate.getTime() < now.getTime();

              return (
                <View key={index} style={styles.scheduleItem}>
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text style={[styles.scheduleText, { color: statusColor }]}>
                    {formatDateTime(time)}
                    {isPastDue && " (Missed)"}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text
              style={[
                styles.noRemindersText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              All reminders have expired
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.outline }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            Medication Planner
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {medications.length} active medication
            {medications.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={manualCleanup}
          style={[styles.cleanupButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[styles.loadingText, { color: colors.onSurfaceVariant }]}
          >
            Loading medications...
          </Text>
        </View>
      ) : medications.length === 0 ? (
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
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="medkit-outline"
              size={80}
              color={colors.onSurfaceVariant}
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
              Add your first medication to get started with smart reminders and
              automatic cleanup.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
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
      )}

      <View style={[styles.footer, { borderTopColor: colors.outline }]}>
        <GradientButton
          title="Add New Medication"
          onPress={() => router.push("/add-medication")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flex: 1,
  },
  title: { fontSize: 28, fontWeight: "bold" },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  cleanupButton: {
    padding: 12,
    borderRadius: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContent: { padding: 24 },
  emptyStateContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 24,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    maxWidth: "90%",
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    borderTopWidth: 1,
  },
  medicationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  medicationMainInfo: {
    flexDirection: "row",
    flex: 1,
  },
  medIcon: { marginRight: 16, marginTop: 4 },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: 18, fontWeight: "bold" },
  medicationDosage: { fontSize: 14, marginTop: 4 },
  nextTimeText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  medicationSchedule: {
    paddingLeft: 48,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  scheduleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  noRemindersText: {
    fontSize: 13,
    fontStyle: "italic",
    marginLeft: 16,
  },
});
