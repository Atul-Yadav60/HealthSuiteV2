import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuth";
import { ThemedText } from "../../components/ThemedText";
import { DocumentUploadModal } from "../../components/DocumentUploadModal";

interface HealthRecord {
  id: string;
  user_id: string;
  display_name: string;
  file_name: string;
  category:
    | "lab"
    | "prescription"
    | "imaging"
    | "doctor_notes"
    | "insurance"
    | "general";
  file_size?: number;
  created_at: string;
  is_favorite: boolean;
  file_type: string;
  mime_type?: string;
  file_path: string;
  storage_bucket: string;
  is_active: boolean;
  updated_at: string;
}

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
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recentRecords, setRecentRecords] = useState<HealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const fetchRecentRecords = async () => {
    if (!user) return;

    try {
      setLoadingRecords(true);

      // For now, show mock data since database might not be ready
      // TODO: Replace with actual service call when database is connected

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock recent records data
      const mockRecords: HealthRecord[] = [
        {
          id: "mock-1",
          user_id: user.id,
          display_name: "Blood Test Results - September 2025",
          file_name: "blood_test_sep_2025.pdf",
          category: "lab",
          file_size: 2048576, // 2MB
          created_at: new Date().toISOString(),
          is_favorite: true,
          file_type: "pdf",
          mime_type: "application/pdf",
          file_path: `${user.id}/mock-file-1.pdf`,
          storage_bucket: "health-records",
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          id: "mock-2",
          user_id: user.id,
          display_name: "Prescription - Medication Refill",
          file_name: "prescription_refill.jpg",
          category: "prescription",
          file_size: 1024000, // 1MB
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          is_favorite: false,
          file_type: "jpg",
          mime_type: "image/jpeg",
          file_path: `${user.id}/mock-file-2.jpg`,
          storage_bucket: "health-records",
          is_active: true,
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setRecentRecords(mockRecords);
    } catch (error) {
      console.error("Error fetching recent records:", error);
      setRecentRecords([]); // Set empty array on error
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecentRecords();
  }, [user]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRecentRecords().finally(() => {
      setRefreshing(false);
    });
  }, [user]);

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "book":
        Alert.alert(
          "Coming Soon",
          "Appointment booking feature will be available soon!"
        );
        break;
      case "records":
        router.push("/health-screens/health-records");
        break;
      case "upload":
        setShowUploadModal(true);
        break;
      default:
        Alert.alert("Coming Soon", `${actionId} feature coming soon!`);
    }
  };

  const handleUploadSuccess = () => {
    fetchRecentRecords(); // Refresh the recent records
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "Unknown size";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      lab: "flask-outline",
      prescription: "medical-outline",
      imaging: "scan-outline",
      doctor_notes: "document-text-outline",
      insurance: "shield-outline",
      general: "folder-outline",
    };
    return iconMap[category] || "document-outline";
  };

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
              onPress={() => handleQuickAction(action.id)}
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
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Records
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push("/health-screens/health-records")}
            style={styles.viewAllButton}
          >
            <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </View>

        {loadingRecords ? (
          <View style={styles.loadingContainer}>
            <ThemedText
              style={[styles.loadingText, { color: colors.textSecondary }]}
            >
              Loading recent records...
            </ThemedText>
          </View>
        ) : recentRecords.length > 0 ? (
          <View style={styles.cardsGrid}>
            {recentRecords.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={[styles.recordCard, { backgroundColor: colors.card }]}
                onPress={() =>
                  router.push(`/health-screens/record-details/${record.id}`)
                }
              >
                <View style={styles.recordHeader}>
                  <Ionicons
                    name={getCategoryIcon(record.category) as any}
                    size={24}
                    color="#6366F1"
                  />
                  <View style={styles.recordInfo}>
                    <ThemedText
                      style={[styles.recordTitle, { color: colors.text }]}
                    >
                      {record.display_name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.recordSubtitle,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {record.category.charAt(0).toUpperCase() +
                        record.category.slice(1)}{" "}
                      • {formatFileSize(record.file_size)}
                    </ThemedText>
                    <ThemedText
                      style={[styles.recordDate, { color: colors.primary }]}
                    >
                      {new Date(record.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  {record.is_favorite && (
                    <Ionicons name="heart" size={16} color="#EF4444" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-outline"
              size={48}
              color={colors.textSecondary}
            />
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No recent records
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Upload your first health document to get started
            </ThemedText>
          </View>
        )}
      </View>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
