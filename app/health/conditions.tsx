import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { GlassCard } from "../../components/ui/GlassCard";
import GradientButton from "../../components/ui/GradientButton";
import DefaultColors, { Colors } from "../../constants/Colors";
import {
  ConditionsService,
  ConditionUpdate,
} from "../../services/ConditionsService";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";

const STATUS_COLORS = {
  active: "#FF5722",
  managed: "#FF9800",
  resolved: "#4CAF50",
  monitoring: "#2196F3",
};

const SEVERITY_COLORS = {
  mild: "#4CAF50",
  moderate: "#FF9800",
  severe: "#FF5722",
};

const CATEGORY_ICONS = {
  chronic: "time-outline",
  acute: "flash-outline",
  "mental-health": "happy-outline",
  other: "help-circle-outline",
};

const STATUS_LABELS = {
  active: "Active",
  managed: "Managed",
  resolved: "Resolved",
  monitoring: "Monitoring",
};

export default function ConditionsScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
  const [conditions, setConditions] = useState<ConditionUpdate[]>([]);
  const [filteredConditions, setFilteredConditions] = useState<
    ConditionUpdate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    { id: "all", label: "All", icon: "list-outline" },
    { id: "active", label: "Active", icon: "warning-outline" },
    { id: "managed", label: "Managed", icon: "checkmark-circle-outline" },
    { id: "chronic", label: "Chronic", icon: "time-outline" },
    { id: "acute", label: "Acute", icon: "flash-outline" },
    { id: "mental-health", label: "Mental Health", icon: "happy-outline" },
  ];

  useEffect(() => {
    loadConditions();
  }, [user]);

  useEffect(() => {
    filterConditions();
  }, [conditions, selectedFilter, searchQuery]);

  const loadConditions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userConditions = await ConditionsService.getUserConditions(user.id);
      setConditions(userConditions);
    } catch (error) {
      console.error("Error loading conditions:", error);
      Alert.alert("Error", "Failed to load conditions");
    } finally {
      setLoading(false);
    }
  };

  const filterConditions = () => {
    let filtered = [...conditions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (condition) =>
          condition.condition_name.toLowerCase().includes(query) ||
          condition.description.toLowerCase().includes(query) ||
          (condition.symptoms &&
            condition.symptoms.some((symptom) =>
              symptom.toLowerCase().includes(query)
            ))
      );
    }

    // Apply status/category filter
    if (selectedFilter !== "all") {
      if (
        ["active", "managed", "resolved", "monitoring"].includes(selectedFilter)
      ) {
        filtered = filtered.filter(
          (condition) => condition.status === selectedFilter
        );
      } else {
        filtered = filtered.filter(
          (condition) => condition.category === selectedFilter
        );
      }
    }

    setFilteredConditions(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConditions();
    setRefreshing(false);
  };

  const handleDeleteCondition = (conditionId: string) => {
    Alert.alert(
      "Delete Condition",
      "Are you sure you want to delete this condition?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ConditionsService.deleteCondition(user!.id, conditionId);
              await loadConditions();
            } catch (error) {
              console.error("Error deleting condition:", error);
              Alert.alert("Error", "Failed to delete condition");
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = (
    conditionId: string,
    newStatus: ConditionUpdate["status"]
  ) => {
    Alert.alert(
      "Update Status",
      `Change status to ${STATUS_LABELS[newStatus]}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              await ConditionsService.updateConditionStatus(
                user!.id,
                conditionId,
                newStatus
              );
              await loadConditions();
            } catch (error) {
              console.error("Error updating status:", error);
              Alert.alert("Error", "Failed to update status");
            }
          },
        },
      ]
    );
  };

  const handleLogFlareUp = (conditionId: string, conditionName: string) => {
    Alert.prompt(
      "Log Flare-up",
      `Record a flare-up for ${conditionName}. Add any notes:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log",
          onPress: async (notes) => {
            try {
              await ConditionsService.logFlareUp(
                user!.id,
                conditionId,
                undefined,
                notes
              );
              await loadConditions();
              Alert.alert("Success", "Flare-up logged successfully");
            } catch (error) {
              console.error("Error logging flare-up:", error);
              Alert.alert("Error", "Failed to log flare-up");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const formatSymptoms = (symptoms: string[] | undefined) => {
    if (!symptoms || symptoms.length === 0) return "No symptoms recorded";
    return (
      symptoms.slice(0, 3).join(", ") +
      (symptoms.length > 3 ? ` +${symptoms.length - 3} more` : "")
    );
  };

  const formatMedications = (medications: string[] | undefined) => {
    if (!medications || medications.length === 0) return "No medications";
    return (
      medications.slice(0, 2).join(", ") +
      (medications.length > 2 ? ` +${medications.length - 2} more` : "")
    );
  };

  const getDaysFromDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderConditionCard = (condition: ConditionUpdate) => {
    const lastFlareDays = getDaysFromDate(condition.last_flare_date);
    const diagnosedDays = getDaysFromDate(condition.diagnosed_date);

    return (
      <GlassCard key={condition.id} style={styles.conditionCard}>
        <View style={styles.conditionHeader}>
          <View style={styles.conditionInfo}>
            <View style={styles.conditionTitleRow}>
              <Ionicons
                name={CATEGORY_ICONS[condition.category] as any}
                size={20}
                color={(DefaultColors[colorScheme] || Colors).primary}
              />
              <ThemedText type="subtitle" style={styles.conditionName}>
                {condition.condition_name}
              </ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLORS[condition.status] },
                ]}
              >
                <Text style={styles.statusText}>
                  {STATUS_LABELS[condition.status].toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.conditionMetaRow}>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: CATEGORY_ICONS[condition.category]
                      ? (DefaultColors[colorScheme] || Colors).primary
                      : "#666",
                  },
                ]}
              >
                {condition.category.replace("-", " ").charAt(0).toUpperCase() +
                  condition.category.replace("-", " ").slice(1)}
              </Text>
              <View
                style={[
                  styles.severityIndicator,
                  { backgroundColor: SEVERITY_COLORS[condition.severity] },
                ]}
              />
              <Text style={styles.severityText}>{condition.severity}</Text>
            </View>
          </View>

          <View style={styles.conditionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/health/edit-condition?id=${condition.id}`)
              }
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={(DefaultColors[colorScheme] || Colors).primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCondition(condition.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5722" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.conditionContent}>
          <ThemedText style={styles.descriptionText} numberOfLines={2}>
            {condition.description}
          </ThemedText>

          {condition.symptoms && condition.symptoms.length > 0 && (
            <View style={styles.symptomsContainer}>
              <ThemedText style={styles.symptomsLabel}>Symptoms:</ThemedText>
              <ThemedText style={styles.symptomsText}>
                {formatSymptoms(condition.symptoms)}
              </ThemedText>
            </View>
          )}

          {condition.medications && condition.medications.length > 0 && (
            <View style={styles.medicationsContainer}>
              <ThemedText style={styles.medicationsLabel}>
                Medications:
              </ThemedText>
              <ThemedText style={styles.medicationsText}>
                {formatMedications(condition.medications)}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.conditionFooter}>
          <View style={styles.datesContainer}>
            {diagnosedDays !== null && (
              <View style={styles.dateItem}>
                <ThemedText style={styles.dateLabel}>Diagnosed</ThemedText>
                <ThemedText style={styles.dateValue}>
                  {diagnosedDays === 0 ? "Today" : `${diagnosedDays} days ago`}
                </ThemedText>
              </View>
            )}
            {lastFlareDays !== null && (
              <View style={styles.dateItem}>
                <ThemedText style={styles.dateLabel}>Last Flare</ThemedText>
                <ThemedText
                  style={[
                    styles.dateValue,
                    lastFlareDays <= 7 && styles.recentFlare,
                  ]}
                >
                  {lastFlareDays === 0 ? "Today" : `${lastFlareDays} days ago`}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.quickActions}>
            {condition.status === "active" && (
              <>
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.flareButton]}
                  onPress={() =>
                    handleLogFlareUp(condition.id, condition.condition_name)
                  }
                >
                  <Ionicons name="warning-outline" size={16} color="#fff" />
                  <Text style={styles.quickActionText}>Log Flare</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.manageButton]}
                  onPress={() => handleStatusChange(condition.id, "managed")}
                >
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Text style={styles.quickActionText}>Managed</Text>
                </TouchableOpacity>
              </>
            )}
            {condition.status === "managed" && (
              <TouchableOpacity
                style={[styles.quickActionButton, styles.resolveButton]}
                onPress={() => handleStatusChange(condition.id, "resolved")}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="#fff"
                />
                <Text style={styles.quickActionText}>Resolved</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </GlassCard>
    );
  };

  const renderEmptyState = () => (
    <GlassCard style={styles.emptyStateCard}>
      <View style={styles.emptyStateContainer}>
        <Ionicons
          name="medical-outline"
          size={64}
          color={(DefaultColors[colorScheme] || Colors).primary}
          style={styles.emptyStateIcon}
        />
        <ThemedText type="subtitle" style={styles.emptyStateTitle}>
          No Conditions Found
        </ThemedText>
        <ThemedText style={styles.emptyStateText}>
          {selectedFilter === "all"
            ? "Start by adding your health conditions to track symptoms, medications, and monitor your progress."
            : `No conditions found${
                searchQuery ? ` for "${searchQuery}"` : ""
              } in ${selectedFilter} category.`}
        </ThemedText>
        <GradientButton
          title="Add First Condition"
          onPress={() => router.push("/health/add-condition")}
          style={styles.emptyStateButton}
        />
      </View>
    </GlassCard>
  );

  const getStatsData = () => {
    const active = conditions.filter((c) => c.status === "active").length;
    const managed = conditions.filter((c) => c.status === "managed").length;
    const chronic = conditions.filter((c) => c.category === "chronic").length;

    return { active, managed, chronic };
  };

  const stats = getStatsData();

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            My Conditions
          </ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/health/add-condition")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </ThemedView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conditions, symptoms..."
              placeholderTextColor="#666"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={
                    selectedFilter === filter.id
                      ? "#fff"
                      : (DefaultColors[colorScheme] || Colors).primary
                  }
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter.id && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Statistics Overview */}
        {conditions.length > 0 && (
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {filteredConditions.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  {selectedFilter === "all" ? "Total" : "Filtered"}
                </ThemedText>
              </View>

              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: "#FF5722" }]}>
                  {stats.active}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Active</ThemedText>
              </View>

              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: "#FF9800" }]}>
                  {stats.managed}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Managed</ThemedText>
              </View>

              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: "#2196F3" }]}>
                  {stats.chronic}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Chronic</ThemedText>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Conditions List */}
        <View style={styles.conditionsContainer}>
          {loading ? (
            <GlassCard style={styles.loadingCard}>
              <ThemedText>Loading conditions...</ThemedText>
            </GlassCard>
          ) : filteredConditions.length > 0 ? (
            filteredConditions.map(renderConditionCard)
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Quick Add Button */}
        {conditions.length > 0 && (
          <View style={styles.quickAddContainer}>
            <GradientButton
              title="Add New Condition"
              onPress={() => router.push("/health/add-condition")}
              style={styles.quickAddButton}
            />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
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
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  filterChipActive: {
    backgroundColor: Colors.primary || "#007AFF",
  },
  filterChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.primary || "#007AFF",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary || "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  conditionsContainer: {
    paddingHorizontal: 20,
  },
  conditionCard: {
    marginBottom: 16,
    padding: 16,
  },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  conditionName: {
    marginLeft: 8,
    marginRight: 12,
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  conditionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 28,
  },
  categoryText: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 12,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: "capitalize",
  },
  conditionActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  conditionContent: {
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  symptomsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  symptomsLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
    width: 70,
  },
  symptomsText: {
    fontSize: 12,
    flex: 1,
  },
  medicationsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  medicationsLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
    width: 70,
  },
  medicationsText: {
    fontSize: 12,
    flex: 1,
  },
  conditionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  datesContainer: {
    flexDirection: "row",
    gap: 16,
  },
  dateItem: {
    alignItems: "flex-start",
  },
  dateLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: "500",
  },
  recentFlare: {
    color: "#FF5722",
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  flareButton: {
    backgroundColor: "#FF5722",
  },
  manageButton: {
    backgroundColor: "#FF9800",
  },
  resolveButton: {
    backgroundColor: "#4CAF50",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  emptyStateCard: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
  },
  emptyStateIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyStateTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  quickAddContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickAddButton: {
    marginHorizontal: 20,
  },
  loadingCard: {
    padding: 40,
    alignItems: "center",
  },
});
