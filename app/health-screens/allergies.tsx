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
import DefaultColors, { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import { AllergiesService, AllergyItem } from "@/services/AllergiesService";

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

  const handleDeleteAllergy = (allergyId: string, allergyName: string) => {
    Alert.alert(
      "Delete Allergy",
      `Are you sure you want to delete "${allergyName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AllergiesService.deleteAllergy(user!.id, allergyId);
              await loadAllergies(); // Refresh the list
            } catch (error) {
              console.error("Error deleting allergy:", error);
              Alert.alert("Error", "Failed to delete allergy");
            }
          },
        },
      ]
    );
  };

  const renderAllergyItem = ({ item }: { item: AllergyItem }) => (
    <View
      style={[
        styles.allergyCard,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <View style={styles.allergyHeader}>
        <View style={styles.allergyTitleRow}>
          <Ionicons
            name={CATEGORY_ICONS[item.category] as any}
            size={24}
            color={colors.primary}
            style={styles.categoryIcon}
          />
          <Text style={[styles.allergyName, { color: colors.text }]}>
            {item.name}
          </Text>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: SEVERITY_COLORS[item.severity] },
            ]}
          >
            <Text style={styles.severityText}>{item.severity}</Text>
          </View>
        </View>
        <View style={styles.allergyActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              router.push(`/health-screens/edit-allergy?id=${item.id}`)
            }
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FF5722" }]}
            onPress={() => handleDeleteAllergy(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.allergyDetails}>
        <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
          Category:{" "}
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>

        {item.reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            <Text
              style={[styles.reactionsLabel, { color: colors.textSecondary }]}
            >
              Reactions:
            </Text>
            <View style={styles.reactionsGrid}>
              {item.reactions.slice(0, 3).map((reaction, index) => (
                <View
                  key={index}
                  style={[
                    styles.reactionChip,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.reactionText, { color: colors.text }]}>
                    {reaction}
                  </Text>
                </View>
              ))}
              {item.reactions.length > 3 && (
                <Text
                  style={[
                    styles.moreReactions,
                    { color: colors.textSecondary },
                  ]}
                >
                  +{item.reactions.length - 3} more
                </Text>
              )}
            </View>
          </View>
        )}

        {item.notes && (
          <Text
            style={[styles.notes, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            Notes: {item.notes}
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="medical-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Allergies Recorded
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Track your allergies to stay safe and informed
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/health-screens/add-allergy")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Your First Allergy</Text>
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
        <Text style={styles.title}>My Allergies</Text>
        <TouchableOpacity
          style={styles.addHeaderButton}
          onPress={() => router.push("/health-screens/add-allergy")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {allergies.length === 0 && !loading ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={allergies}
            keyExtractor={(item) => item.id}
            renderItem={renderAllergyItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#667eea"
                colors={["#667eea"]}
              />
            }
          />
        )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  addHeaderButton: {
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  allergyCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allergyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  allergyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  allergyName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  severityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  allergyActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  allergyDetails: {
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  reactionsContainer: {
    gap: 6,
  },
  reactionsLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  reactionChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reactionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreReactions: {
    fontSize: 12,
    fontStyle: "italic",
  },
  notes: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
