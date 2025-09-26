import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuth";
import { DocumentUploadModal } from "../../components/DocumentUploadModal";

interface HealthRecord {
  id: string;
  user_id: string;
  file_name: string;
  display_name: string;
  file_type: string;
  file_size?: number;
  mime_type?: string;
  file_path: string;
  storage_bucket: string;
  category:
    | "lab"
    | "prescription"
    | "imaging"
    | "doctor_notes"
    | "insurance"
    | "general";
  description?: string;
  record_date?: string;
  provider_name?: string;
  provider_type?: "doctor" | "hospital" | "lab" | "pharmacy";
  is_active: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface HealthRecordStats {
  total: number;
  byCategory: Record<string, number>;
  recentUploads: number;
  totalSize: number;
}

const CATEGORIES = [
  { id: "all", label: "All", color: "#6B7280" },
  { id: "lab", label: "Lab Results", color: "#10B981" },
  { id: "prescription", label: "Prescriptions", color: "#6366F1" },
  { id: "imaging", label: "Imaging", color: "#8B5CF6" },
  { id: "doctor_notes", label: "Doctor Notes", color: "#EC4899" },
  { id: "insurance", label: "Insurance", color: "#F59E0B" },
  { id: "general", label: "General", color: "#06B6D4" },
];

export default function HealthRecordsScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [stats, setStats] = useState<HealthRecordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock data generator
  const generateMockRecords = (): HealthRecord[] => {
    const categories: Array<HealthRecord["category"]> = [
      "lab",
      "prescription",
      "imaging",
      "doctor_notes",
      "insurance",
      "general",
    ];
    const providers = [
      "City Medical Center",
      "LabCorp",
      "CVS Pharmacy",
      "Dr. Smith Clinic",
      "Radiology Plus",
    ];
    const providerTypes: Array<HealthRecord["provider_type"]> = [
      "doctor",
      "hospital",
      "lab",
      "pharmacy",
    ];

    return Array.from({ length: 15 }, (_, i) => ({
      id: `record_${i + 1}`,
      user_id: user?.id || "mock_user",
      file_name: `document_${i + 1}.pdf`,
      display_name:
        [
          "Blood Test Results",
          "Prescription - Lisinopril",
          "X-Ray Report",
          "Annual Physical Notes",
          "Insurance Card",
          "Vaccination Record",
          "MRI Brain Scan",
          "Allergy Test Results",
          "Prescription - Metformin",
          "Cardiology Report",
          "Lab Work - Lipid Panel",
          "Emergency Room Visit",
          "Prescription - Albuterol",
          "Dermatology Consultation",
          "Dental X-Rays",
        ][i] || `Health Document ${i + 1}`,
      file_type: "pdf",
      file_size: Math.floor(Math.random() * 2000000) + 100000, // 100KB to 2MB
      mime_type: "application/pdf",
      file_path: `/documents/document_${i + 1}.pdf`,
      storage_bucket: "health-documents",
      category: categories[i % categories.length],
      description: `Mock health document for testing - ${i + 1}`,
      record_date: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      provider_name: providers[i % providers.length],
      provider_type: providerTypes[i % providerTypes.length],
      is_active: true,
      is_favorite: Math.random() > 0.7,
      created_at: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
  };

  const calculateMockStats = (records: HealthRecord[]): HealthRecordStats => {
    const byCategory: Record<string, number> = {};
    let totalSize = 0;
    let recentUploads = 0;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    records.forEach((record) => {
      byCategory[record.category] = (byCategory[record.category] || 0) + 1;
      totalSize += record.file_size || 0;
      if (new Date(record.created_at) > oneWeekAgo) {
        recentUploads++;
      }
    });

    return {
      total: records.length,
      byCategory,
      recentUploads,
      totalSize,
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const allMockRecords = generateMockRecords();

      // Filter by category if needed
      const filteredRecords =
        selectedCategory === "all"
          ? allMockRecords
          : allMockRecords.filter(
              (record) => record.category === selectedCategory
            );

      const mockStats = calculateMockStats(allMockRecords);

      setRecords(filteredRecords);
      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching health records:", error);
      Alert.alert("Error", "Failed to load health records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, selectedCategory]);

  const handleUploadSuccess = () => {
    // Refresh the list after successful upload
    fetchData();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => {
      setRefreshing(false);
    });
  }, [user, selectedCategory]);

  const handleRecordPress = async (record: HealthRecord) => {
    try {
      // Mock file opening - in a real app this would get a signed URL and open the file
      Alert.alert("Mock File View", `Would open: ${record.display_name}`, [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error getting file URL:", error);
      Alert.alert("Error", "Failed to open file");
    }
  };

  const handleToggleFavorite = async (record: HealthRecord) => {
    try {
      // Mock favorite toggle - update local state
      setRecords((prevRecords) =>
        prevRecords.map((r) =>
          r.id === record.id ? { ...r, is_favorite: !r.is_favorite } : r
        )
      );
      Alert.alert(
        "Success",
        `${record.is_favorite ? "Removed from" : "Added to"} favorites`
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  const handleDeleteRecord = (record: HealthRecord) => {
    Alert.alert(
      "Delete Record",
      `Are you sure you want to delete "${record.display_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Mock delete - remove from local state
              setRecords((prevRecords) =>
                prevRecords.filter((r) => r.id !== record.id)
              );
              Alert.alert("Success", "Record deleted successfully");
            } catch (error) {
              console.error("Error deleting record:", error);
              Alert.alert("Error", "Failed to delete record");
            }
          },
        },
      ]
    );
  };

  const filteredRecords = records.filter(
    (record) =>
      record.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.provider_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <LinearGradient colors={["#06B6D4", "#0891B2"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Health Records</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Records
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: "#10B981" }]}>
                {stats.recentUploads}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                This Week
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
                {(stats.totalSize / 1024 / 1024).toFixed(1)}MB
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Size
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search records..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.surface },
                  selectedCategory === category.id && {
                    backgroundColor: category.color,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: colors.text },
                    selectedCategory === category.id && { color: "#fff" },
                  ]}
                >
                  {category.label}
                  {stats &&
                    category.id !== "all" &&
                    stats.byCategory[category.id] &&
                    ` (${stats.byCategory[category.id]})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Records List */}
        <ScrollView
          style={styles.recordsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Loading health records...
              </Text>
            </View>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={[styles.recordCard, { backgroundColor: colors.card }]}
                onPress={() => handleRecordPress(record)}
              >
                <View style={styles.recordHeader}>
                  <View style={styles.recordIconContainer}>
                    <Ionicons
                      name={getCategoryIcon(record.category) as any}
                      size={24}
                      color={
                        CATEGORIES.find((c) => c.id === record.category)
                          ?.color || "#6366F1"
                      }
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={[styles.recordTitle, { color: colors.text }]}>
                      {record.display_name}
                    </Text>
                    <Text
                      style={[
                        styles.recordSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {record.category.charAt(0).toUpperCase() +
                        record.category.slice(1)}{" "}
                      • {formatFileSize(record.file_size)}
                    </Text>
                    {record.provider_name && (
                      <Text
                        style={[
                          styles.recordProvider,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {record.provider_name}
                      </Text>
                    )}
                    <Text
                      style={[styles.recordDate, { color: colors.primary }]}
                    >
                      {new Date(record.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.recordActions}>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorite(record)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name={record.is_favorite ? "heart" : "heart-outline"}
                        size={20}
                        color={
                          record.is_favorite ? "#EF4444" : colors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteRecord(record)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {record.description && (
                  <Text
                    style={[
                      styles.recordDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {record.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? "No matching records found"
                  : "No health records yet"}
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Upload your first health document to get started"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setShowUploadModal(true)}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.uploadButtonText}>Upload Document</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={() => {
          fetchData(); // Refresh the data
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesScroll: {
    marginBottom: 12,
    maxHeight: 35,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 6,
    alignItems: "center",
    height: 40,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryChipText: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 16,
    textAlignVertical: "center",
  },
  recordsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
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
  recordProvider: {
    fontSize: 14,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  recordDescription: {
    fontSize: 14,
    marginTop: 8,
    paddingLeft: 52,
  },
  recordActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 24,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
    gap: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
