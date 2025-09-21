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
} from "react-native";

import { GradientButton } from "@/components/ui/GradientButton";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";
import { scheduleMedicationReminder } from "@/services/NotificationService";
import * as Notifications from "expo-notifications";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: {
    type: string;
    times: string[];
  };
}

export default function MedPlannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndScheduleMedications = useCallback(async () => {
    // --- DEVELOPMENT ONLY ---
    // PASTE YOUR TEST USER ID FROM THE SUPABASE DASHBOARD HERE
    const testUserID = "511e52f8-0977-43e0-a7a4-b8cdb1c49eba";
    // --- END DEVELOPMENT ONLY ---

    if (!testUserID) {
      Alert.alert(
        "Configuration Error",
        "Please set your Test User ID in app/(tabs)/medPlanner.tsx"
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", testUserID) // Use the Test User ID
        .order("created_at", { ascending: false });

      if (error) throw error;

      const upcomingMedications = (data || []).filter((med) =>
        med.schedule.times.some((time: string) => new Date(time) > new Date())
      );
      setMedications(upcomingMedications);

      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log(
        "Cleared old notifications. Rescheduling upcoming reminders..."
      );

      for (const med of upcomingMedications) {
        for (const time of med.schedule.times) {
          if (new Date(time) > new Date()) {
            await scheduleMedicationReminder(
              { name: med.name, dosage: med.dosage },
              new Date(time)
            );
          }
        }
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch medications: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAndScheduleMedications();
    }, [fetchAndScheduleMedications])
  );

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View
      style={[
        styles.medicationItem,
        { backgroundColor: colors.surface, borderColor: colors.outline },
      ]}
    >
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
          style={[styles.medicationDosage, { color: colors.onSurfaceVariant }]}
        >
          {item.dosage || "No dosage"}
        </Text>
      </View>
      <View style={styles.medicationSchedule}>
        {item.schedule.times
          .filter((t) => new Date(t) > new Date())
          .map((time, index) => (
            <Text
              key={index}
              style={[styles.scheduleText, { color: colors.onSurfaceVariant }]}
            >
              {new Date(time).toLocaleDateString()} at{" "}
              {new Date(time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.outline }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Medication Planner
        </Text>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : medications.length === 0 ? (
        <ScrollView contentContainerStyle={styles.centered}>
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="medkit-outline"
              size={80}
              color={colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No Upcoming Medications
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Tap 'Add Medication' to get started.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  footer: { padding: 24, paddingBottom: 40, borderTopWidth: 1 },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  medIcon: { marginRight: 16 },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: 18, fontWeight: "bold" },
  medicationDosage: { fontSize: 14, marginTop: 4 },
  medicationSchedule: { alignItems: "flex-end" },
  scheduleText: { fontSize: 12 },
});
