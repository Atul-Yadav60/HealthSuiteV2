import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuth";
import { ConditionsService, ConditionItem } from "../../services/ConditionsService";

const SEVERITY_COLORS = {
  mild: "#4CAF50",
  moderate: "#FF9800",
  severe: "#FF5722",
  critical: "#D32F2F",
};

const STATUS_COLORS = {
  active: "#FF5722",
  managed: "#FF9800",
  resolved: "#4CAF50",
  monitoring: "#2196F3",
};

const CATEGORY_ICONS = {
  chronic: "pulse-outline",
  acute: "flash-outline",
  mental_health: "heart-outline",
  genetic: "code-working-outline",
  autoimmune: "shield-outline",
  other: "help-circle-outline",
};

export default function ConditionsScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConditions();
  }, [user]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConditions();
    setRefreshing(false);
  };

  const handleDeleteCondition = (condition: ConditionItem) => {
    Alert.alert(
      "Delete Condition",
      `Are you sure you want to delete "${condition.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ConditionsService.deleteCondition(condition.id);
              setConditions(prev => prev.filter(c => c.id !== condition.id));
              Alert.alert("Success", "Condition deleted successfully");
            } catch (error) {
              console.error("Error deleting condition:", error);
              Alert.alert("Error", "Failed to delete condition");
            }
          },
        },
      ]
    );
  };

  const renderConditionItem = ({ item }: { item: ConditionItem }) => (
    <TouchableOpacity
      style={[styles.conditionCard, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/health-screens/edit-condition?id=${item.id}`)}
    >
      <View style={styles.conditionHeader}>
        <View style={styles.conditionInfo}>
          <View style={styles.conditionTitleRow}>
            <Ionicons
              name={CATEGORY_ICONS[item.category] as any}
              size={24}
              color={colors.primary}
              style={styles.categoryIcon}
            />
            <Text style={[styles.conditionName, { color: colors.text }]}>
              {item.name}
            </Text>
          </View>
          <View style={styles.badgesRow}>
            <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[item.severity] + "20" }]}>
              <Text style={[styles.badgeText, { color: SEVERITY_COLORS[item.severity] }]}>
                {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteCondition(item)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {item.description && (
        <Text style={[styles.conditionDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.symptoms && item.symptoms.length > 0 && (
        <View style={styles.symptomsContainer}>
          <Text style={[styles.symptomsLabel, { color: colors.text }]}>
            Symptoms ({item.symptoms.length}):
          </Text>
          <View style={styles.symptomsList}>
            {item.symptoms.slice(0, 3).map((symptom, index) => (
              <View key={index} style={[styles.symptomChip, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.symptomText, { color: colors.primary }]}>
                  {symptom}
                </Text>
              </View>
            ))}
            {item.symptoms.length > 3 && (
              <View style={[styles.symptomChip, { backgroundColor: colors.textSecondary + "20" }]}>
                <Text style={[styles.symptomText, { color: colors.textSecondary }]}>
                  +{item.symptoms.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {item.medications && item.medications.length > 0 && (
        <View style={styles.medicationsContainer}>
          <Text style={[styles.medicationsLabel, { color: colors.text }]}>
            Medications ({item.medications.length}):
          </Text>
          <View style={styles.medicationsList}>
            {item.medications.slice(0, 2).map((medication, index) => (
              <View key={index} style={styles.medicationItem}>
                <Ionicons name="medical" size={14} color={colors.primary} />
                <Text style={[styles.medicationText, { color: colors.text }]} numberOfLines={1}>
                  {medication}
                </Text>
              </View>
            ))}
            {item.medications.length > 2 && (
              <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                +{item.medications.length - 2} more medications
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.conditionFooter}>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          Added: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Health Conditions Yet
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Keep track of your health conditions to better manage your health journey.
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/health-screens/add-condition")}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Your First Condition</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Health Conditions</Text>
        <TouchableOpacity
          style={styles.addHeaderButton}
          onPress={() => router.push("/health-screens/add-condition")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {conditions.length > 0 && (
          <View style={styles.statsCard}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Health Overview
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {conditions.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Conditions
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: STATUS_COLORS.active }]}>
                  {conditions.filter(c => c.status === 'active').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Active
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: STATUS_COLORS.managed }]}>
                  {conditions.filter(c => c.status === 'managed').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Managed
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: STATUS_COLORS.resolved }]}>
                  {conditions.filter(c => c.status === 'resolved').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Resolved
                </Text>
              </View>
            </View>
          </View>
        )}

        <FlatList
          data={conditions}
          renderItem={renderConditionItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={loading ? null : renderEmptyState}
          contentContainerStyle={conditions.length === 0 ? styles.emptyContainer : styles.listContainer}
        />
      </View>
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
  addHeaderButton: {
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
  content: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
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
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  conditionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 8,
  },
  categoryIcon: {
    marginRight: 8,
  },
  conditionName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
  },
  conditionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  symptomsContainer: {
    marginBottom: 12,
  },
  symptomsLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  symptomsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  symptomChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: "500",
  },
  medicationsContainer: {
    marginBottom: 12,
  },
  medicationsLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  medicationsList: {
    gap: 4,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  medicationText: {
    fontSize: 14,
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  conditionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  dateText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});