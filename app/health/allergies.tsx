import React, { useState, useEffect } from "react";
import DefaultColors, { Colors } from "../../constants/Colors";
import {
  AllergiesService,
  Allergy,
  AllergyItem,
} from "../../services/AllergiesService";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Text,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { GlassCard } from "../../components/ui/GlassCard";
import GradientButton from "../../components/ui/GradientButton";

const SEVERITY_COLORS = {
  mild: "#4CAF50",
  moderate: "#FF9800",
  severe: "#FF5722",
  "life-threatening": "#D32F2F",
};

const CATEGORY_ICONS = {
  food: "restaurant-outline",
  medication: "medical-outline",
  environmental: "leaf-outline",
  other: "help-circle-outline",
};

export default function AllergiesScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<AllergyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All", icon: "list-outline" },
    { id: "food", label: "Food", icon: "restaurant-outline" },
    { id: "medication", label: "Medication", icon: "medical-outline" },
    { id: "environmental", label: "Environmental", icon: "leaf-outline" },
    { id: "other", label: "Other", icon: "help-circle-outline" },
  ];

  useEffect(() => {
    loadAllergies();
  }, [user]);

  const loadAllergies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userAllergies = await AllergiesService.getUserAllergies(user.id);
      setAllergies(userAllergies);
    } catch (error) {
      console.error("Error loading allergies:", error);
      Alert.alert("Error", "Failed to load allergies");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllergies();
    setRefreshing(false);
  };

  const handleDeleteAllergy = (allergyId: string) => {
    Alert.alert(
      "Delete Allergy",
      "Are you sure you want to delete this allergy?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AllergiesService.deleteAllergy(user!.id, allergyId);
              await loadAllergies();
            } catch (error) {
              console.error("Error deleting allergy:", error);
              Alert.alert("Error", "Failed to delete allergy");
            }
          },
        },
      ]
    );
  };

  const filteredAllergies =
    selectedCategory === "all"
      ? allergies
      : allergies.filter((allergy) => allergy.category === selectedCategory);

  const getSeverityBadgeColor = (severity: string) => {
    return (
      SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || "#757575"
    );
  };

  const formatReactions = (reactions: string[]) => {
    if (!reactions.length) return "No reactions recorded";
    return (
      reactions.slice(0, 3).join(", ") +
      (reactions.length > 3 ? ` +${reactions.length - 3} more` : "")
    );
  };

  const renderAllergyCard = (allergy: AllergyItem) => (
    <GlassCard key={allergy.id} style={styles.allergyCard}>
      <View style={styles.allergyHeader}>
        <View style={styles.allergyInfo}>
          <View style={styles.allergyTitleRow}>
            <Ionicons
              name={CATEGORY_ICONS[allergy.category] as any}
              size={20}
              color={colors.primary}
            />
            <ThemedText type="subtitle" style={styles.allergyName}>
              {allergy.name}
            </ThemedText>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityBadgeColor(allergy.severity) },
              ]}
            >
              <Text style={styles.severityText}>
                {allergy.severity.toUpperCase()}
              </Text>
            </View>
          </View>
          <ThemedText style={styles.categoryText}>
            {allergy.category.charAt(0).toUpperCase() +
              allergy.category.slice(1)}{" "}
            Allergy
          </ThemedText>
        </View>

        <View style={styles.allergyActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/health/edit-allergy?id=${allergy.id}`)}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAllergy(allergy.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF5722" />
          </TouchableOpacity>
        </View>
      </View>

      {allergy.reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          <ThemedText style={styles.reactionsLabel}>
            Common Reactions:
          </ThemedText>
          <ThemedText style={styles.reactionsText}>
            {formatReactions(allergy.reactions)}
          </ThemedText>
        </View>
      )}

      {allergy.notes && (
        <View style={styles.notesContainer}>
          <ThemedText style={styles.notesLabel}>Notes:</ThemedText>
          <ThemedText style={styles.notesText}>{allergy.notes}</ThemedText>
        </View>
      )}

      {(allergy.first_reaction_date || allergy.last_reaction_date) && (
        <View style={styles.datesContainer}>
          {allergy.first_reaction_date && (
            <View style={styles.dateItem}>
              <ThemedText style={styles.dateLabel}>First Reaction:</ThemedText>
              <ThemedText style={styles.dateText}>
                {new Date(allergy.first_reaction_date).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
          {allergy.last_reaction_date && (
            <View style={styles.dateItem}>
              <ThemedText style={styles.dateLabel}>Last Reaction:</ThemedText>
              <ThemedText style={styles.dateText}>
                {new Date(allergy.last_reaction_date).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </GlassCard>
  );

  const renderEmptyState = () => (
    <GlassCard style={styles.emptyStateCard}>
      <View style={styles.emptyStateContainer}>
        <Ionicons
          name="medical-outline"
          size={64}
          color={colors.primary}
          style={styles.emptyStateIcon}
        />
        <ThemedText type="subtitle" style={styles.emptyStateTitle}>
          No Allergies Recorded
        </ThemedText>
        <ThemedText style={styles.emptyStateText}>
          {selectedCategory === "all"
            ? "Start by adding your known allergies to keep track of reactions and manage your health safely."
            : `No allergies found in the ${selectedCategory} category.`}
        </ThemedText>
        <GradientButton
          title="Add First Allergy"
          onPress={() => router.push("/health/add-allergy")}
          style={styles.emptyStateButton}
        />
      </View>
    </GlassCard>
  );

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
            My Allergies
          </ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/health/add-allergy")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </ThemedView>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={
                    selectedCategory === category.id ? "#fff" : colors.primary
                  }
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Statistics Overview */}
        {allergies.length > 0 && (
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {filteredAllergies.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  {selectedCategory === "all"
                    ? "Total Allergies"
                    : `${selectedCategory} Allergies`}
                </ThemedText>
              </View>

              {selectedCategory === "all" && (
                <>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statNumber}>
                      {
                        allergies.filter(
                          (a) =>
                            a.severity === "severe" ||
                            a.severity === "life-threatening"
                        ).length
                      }
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Severe</ThemedText>
                  </View>

                  <View style={styles.statItem}>
                    <ThemedText style={styles.statNumber}>
                      {allergies.filter((a) => a.category === "food").length}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Food</ThemedText>
                  </View>
                </>
              )}
            </View>
          </GlassCard>
        )}

        {/* Allergies List */}
        <View style={styles.allergiesContainer}>
          {loading ? (
            <GlassCard style={styles.loadingCard}>
              <ThemedText>Loading allergies...</ThemedText>
            </GlassCard>
          ) : filteredAllergies.length > 0 ? (
            filteredAllergies.map(renderAllergyCard)
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Quick Add Button */}
        {allergies.length > 0 && (
          <View style={styles.quickAddContainer}>
            <GradientButton
              title="Add New Allergy"
              onPress={() => router.push("/health/add-allergy")}
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
  categoriesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  categoryChipActive: {
    backgroundColor: colors.primary || "#007AFF",
  },
  categoryChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.primary || "#007AFF",
    fontWeight: "500",
  },
  categoryChipTextActive: {
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
  allergiesContainer: {
    paddingHorizontal: 20,
  },
  allergyCard: {
    marginBottom: 16,
    padding: 16,
  },
  allergyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  allergyInfo: {
    flex: 1,
  },
  allergyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  allergyName: {
    marginLeft: 8,
    marginRight: 12,
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 28,
  },
  allergyActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  reactionsContainer: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 8,
  },
  reactionsLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
    marginBottom: 4,
  },
  reactionsText: {
    fontSize: 14,
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  dateItem: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 10,
    opacity: 0.6,
  },
  dateText: {
    fontSize: 12,
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
