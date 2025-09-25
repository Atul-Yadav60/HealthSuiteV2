import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { ThemedText } from "../../components/ThemedText";

// Mock Data for Appointments & Records
const APPOINTMENTS = [
  {
    id: "a1",
    doctor: "Dr. Sharma",
    type: "Consultation",
    date: "Sep 24, 2025",
    time: "10:30 AM",
    status: "Upcoming",
  },
  {
    id: "a2",
    doctor: "LabCorp",
    type: "Blood Test",
    date: "Sep 25, 2025",
    time: "9:00 AM",
    status: "Upcoming",
  },
  {
    id: "a3",
    doctor: "Dr. Mehta",
    type: "Follow-up",
    date: "Sep 15, 2025",
    time: "2:00 PM",
    status: "Completed",
  },
];

const RECORDS = [
  {
    id: "r1",
    name: "Blood Test Report",
    date: "Sep 25, 2025",
    type: "Lab",
    status: "Ready",
  },
  {
    id: "r2",
    name: "Consultation Notes",
    date: "Sep 24, 2025",
    type: "Doctor",
    status: "Ready",
  },
];

// Quick Actions for appointments and records
const QUICK_ACTIONS = [
  {
    id: "book",
    title: "Book Appointment",
    icon: "add-circle-outline",
    color: "#10B981",
  },
  {
    id: "records",
    title: "View Records",
    icon: "document-text-outline",
    color: "#6366F1",
  },
  {
    id: "upload",
    title: "Upload Document",
    icon: "cloud-upload-outline",
    color: "#F59E0B",
  },
];

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={["#2066c1ff", "#1a5ba8"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ThemedText style={[styles.greeting, { color: "white" }]}>
          Appointments & Records
        </ThemedText>
        <ThemedText
          style={[styles.subtitle, { color: "rgba(255,255,255,0.9)" }]}
        >
          Manage your healthcare
        </ThemedText>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </ThemedText>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onPress={() => alert(`${action.title} coming soon!`)}
              style={styles.quickAction}
            />
          ))}
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Upcoming Appointments
        </ThemedText>
        <View style={styles.cardsGrid}>
          {APPOINTMENTS.filter((apt) => apt.status === "Upcoming").map(
            (appt) => (
              <View
                key={appt.id}
                style={[
                  styles.appointmentCard,
                  { backgroundColor: colors.card },
                ]}
              >
                <View style={styles.appointmentHeader}>
                  <Ionicons name="person-outline" size={24} color="#10B981" />
                  <View style={styles.appointmentInfo}>
                    <ThemedText
                      style={[styles.appointmentTitle, { color: colors.text }]}
                    >
                      {appt.doctor}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.appointmentSubtitle,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {appt.type} • {appt.date}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.appointmentTime,
                        { color: colors.primary },
                      ]}
                    >
                      {appt.time}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )
          )}
        </View>
      </View>

      {/* Recent Records */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Records
        </ThemedText>
        <View style={styles.cardsGrid}>
          {RECORDS.map((record) => (
            <View
              key={record.id}
              style={[styles.recordCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.recordHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#6366F1"
                />
                <View style={styles.recordInfo}>
                  <ThemedText
                    style={[styles.recordTitle, { color: colors.text }]}
                  >
                    {record.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.recordSubtitle,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {record.type}
                  </ThemedText>
                  <ThemedText
                    style={[styles.recordDate, { color: colors.primary }]}
                  >
                    {record.date}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 30 },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  greeting: {
    paddingTop: 12,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  quickActionsContainer: {
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  quickAction: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardsGrid: {
    gap: 12,
  },
  appointmentCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  appointmentSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: "600",
  },
  recordCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: "600",
  },
});
