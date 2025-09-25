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
  TouchableOpacity,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { GlassCard } from "../../components/ui/GlassCard";
import GradientButton from "../../components/ui/GradientButton";
import { TextInput } from "react-native-gesture-handler";

const ALLERGY_CATEGORIES = [
  { id: "food", label: "Food", icon: "restaurant-outline" },
  { id: "medication", label: "Medication", icon: "medical-outline" },
  { id: "environmental", label: "Environmental", icon: "leaf-outline" },
  { id: "other", label: "Other", icon: "help-circle-outline" },
];

const SEVERITY_LEVELS = [
  {
    id: "mild",
    label: "Mild",
    color: "#4CAF50",
    description: "Minor discomfort, manageable",
  },
  {
    id: "moderate",
    label: "Moderate",
    color: "#FF9800",
    description: "Noticeable symptoms, requires attention",
  },
  {
    id: "severe",
    label: "Severe",
    color: "#FF5722",
    description: "Significant symptoms, medical attention needed",
  },
  {
    id: "life-threatening",
    label: "Life-Threatening",
    color: "#D32F2F",
    description: "Emergency medical attention required",
  },
];

const COMMON_REACTIONS = [
  "Hives",
  "Itching",
  "Swelling",
  "Rash",
  "Difficulty breathing",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Runny nose",
  "Sneezing",
  "Watery eyes",
  "Coughing",
  "Wheezing",
  "Dizziness",
  "Anaphylaxis",
];

export default function EditAllergyScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [allergy, setAllergy] = useState<AllergyItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "food" as AllergyItem["category"],
    severity: "mild" as AllergyItem["severity"],
    reactions: [] as string[],
    notes: "",
    first_reaction_date: "",
    last_reaction_date: "",
  });
  const [customReaction, setCustomReaction] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllergy();
  }, [user, id]);

  const loadAllergy = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const allergies = await AllergiesService.getUserAllergies(user.id);
      const foundAllergy = allergies.find((a) => a.id === id);

      if (foundAllergy) {
        setAllergy(foundAllergy);
        setFormData({
          name: foundAllergy.name,
          category: foundAllergy.category,
          severity: foundAllergy.severity,
          reactions: foundAllergy.reactions,
          notes: foundAllergy.notes || "",
          first_reaction_date: foundAllergy.first_reaction_date || "",
          last_reaction_date: foundAllergy.last_reaction_date || "",
        });
      } else {
        Alert.alert("Error", "Allergy not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error loading allergy:", error);
      Alert.alert("Error", "Failed to load allergy");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !allergy) {
      Alert.alert("Error", "User not authenticated or allergy not loaded");
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter the allergy name");
      return;
    }

    if (formData.reactions.length === 0) {
      Alert.alert("Error", "Please select at least one reaction");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        ...formData,
        name: formData.name.trim(),
        notes: formData.notes.trim(),
      };

      await AllergiesService.updateAllergy(user.id, allergy.id, updatedData);

      Alert.alert("Success", "Allergy updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating allergy:", error);
      Alert.alert("Error", "Failed to update allergy");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Allergy",
      "Are you sure you want to delete this allergy? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user || !allergy) return;

            try {
              await AllergiesService.deleteAllergy(user.id, allergy.id);
              Alert.alert("Success", "Allergy deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error("Error deleting allergy:", error);
              Alert.alert("Error", "Failed to delete allergy");
            }
          },
        },
      ]
    );
  };

  const toggleReaction = (reaction: string) => {
    setFormData((prev) => ({
      ...prev,
      reactions: prev.reactions.includes(reaction)
        ? prev.reactions.filter((r) => r !== reaction)
        : [...prev.reactions, reaction],
    }));
  };

  const addCustomReaction = () => {
    if (
      customReaction.trim() &&
      !formData.reactions.includes(customReaction.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        reactions: [...prev.reactions, customReaction.trim()],
      }));
      setCustomReaction("");
    }
  };

  const removeReaction = (reaction: string) => {
    setFormData((prev) => ({
      ...prev,
      reactions: prev.reactions.filter((r) => r !== reaction),
    }));
  };

  if (loading) {
    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading allergy...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Edit Allergy
          </ThemedText>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </ThemedView>

        {/* Allergy Name */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Allergy Name *
            </ThemedText>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="e.g., Peanuts, Penicillin, Pollen"
              placeholderTextColor="#999"
            />
          </View>
        </GlassCard>

        {/* Category Selection */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Category *
            </ThemedText>
            <View style={styles.categoryGrid}>
              {ALLERGY_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    formData.category === category.id &&
                      styles.categoryOptionActive,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      category: category.id as AllergyItem["category"],
                    }))
                  }
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={
                      formData.category === category.id
                        ? "#fff"
                        : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      formData.category === category.id &&
                        styles.categoryLabelActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Severity Selection */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Severity Level *
            </ThemedText>
            <View style={styles.severityList}>
              {SEVERITY_LEVELS.map((severity) => (
                <TouchableOpacity
                  key={severity.id}
                  style={[
                    styles.severityOption,
                    formData.severity === severity.id &&
                      styles.severityOptionActive,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      severity: severity.id as AllergyItem["severity"],
                    }))
                  }
                >
                  <View style={styles.severityContent}>
                    <View style={styles.severityHeader}>
                      <View
                        style={[
                          styles.severityIndicator,
                          { backgroundColor: severity.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.severityLabel,
                          formData.severity === severity.id &&
                            styles.severityLabelActive,
                        ]}
                      >
                        {severity.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.severityDescription,
                        formData.severity === severity.id &&
                          styles.severityDescriptionActive,
                      ]}
                    >
                      {severity.description}
                    </Text>
                  </View>
                  {formData.severity === severity.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Reactions Selection */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Common Reactions *
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Select all reactions you experience
            </ThemedText>

            <View style={styles.reactionsGrid}>
              {COMMON_REACTIONS.map((reaction) => (
                <TouchableOpacity
                  key={reaction}
                  style={[
                    styles.reactionChip,
                    formData.reactions.includes(reaction) &&
                      styles.reactionChipActive,
                  ]}
                  onPress={() => toggleReaction(reaction)}
                >
                  <Text
                    style={[
                      styles.reactionChipText,
                      formData.reactions.includes(reaction) &&
                        styles.reactionChipTextActive,
                    ]}
                  >
                    {reaction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Reaction Input */}
            <View style={styles.customReactionContainer}>
              <TextInput
                style={styles.customReactionInput}
                value={customReaction}
                onChangeText={setCustomReaction}
                placeholder="Add custom reaction"
                placeholderTextColor="#999"
                onSubmitEditing={addCustomReaction}
              />
              <TouchableOpacity
                style={styles.addReactionButton}
                onPress={addCustomReaction}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Selected Reactions */}
            {formData.reactions.length > 0 && (
              <View style={styles.selectedReactionsContainer}>
                <ThemedText style={styles.selectedReactionsLabel}>
                  Selected Reactions ({formData.reactions.length}):
                </ThemedText>
                <View style={styles.selectedReactionsGrid}>
                  {formData.reactions.map((reaction) => (
                    <View key={reaction} style={styles.selectedReactionChip}>
                      <Text style={styles.selectedReactionText}>
                        {reaction}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeReaction(reaction)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#FF5722"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Optional Fields */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Additional Information
            </ThemedText>

            <View style={styles.optionalField}>
              <ThemedText style={styles.fieldLabel}>
                Notes (optional)
              </ThemedText>
              <TextInput
                style={styles.textArea}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Any additional notes about this allergy..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.datesContainer}>
              <View style={styles.dateField}>
                <ThemedText style={styles.fieldLabel}>
                  First Reaction Date
                </ThemedText>
                <TextInput
                  style={styles.dateInput}
                  value={formData.first_reaction_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_reaction_date: text,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.dateField}>
                <ThemedText style={styles.fieldLabel}>
                  Last Reaction Date
                </ThemedText>
                <TextInput
                  style={styles.dateInput}
                  value={formData.last_reaction_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_reaction_date: text,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <GradientButton
            title={saving ? "Updating..." : "Update Allergy"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />

          <TouchableOpacity
            style={styles.deleteActionButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteActionText}>Delete This Allergy</Text>
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 87, 34, 0.3)",
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  formSection: {
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  textInput: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryOption: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  categoryLabelActive: {
    color: "#fff",
  },
  severityList: {
    gap: 12,
  },
  severityOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 2,
    borderColor: "transparent",
  },
  severityOptionActive: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderColor: colors.primary,
  },
  severityContent: {
    flex: 1,
  },
  severityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  severityLabelActive: {
    color: colors.primary,
  },
  severityDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 24,
  },
  severityDescriptionActive: {
    opacity: 1,
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  reactionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  reactionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reactionChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  reactionChipTextActive: {
    color: "#fff",
  },
  customReactionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  customReactionInput: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  addReactionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  selectedReactionsContainer: {
    marginTop: 16,
  },
  selectedReactionsLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  selectedReactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedReactionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  selectedReactionText: {
    fontSize: 12,
    color: "#4CAF50",
    marginRight: 6,
    fontWeight: "500",
  },
  optionalField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.8,
  },
  textArea: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    minHeight: 80,
    textAlignVertical: "top",
  },
  datesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButton: {
    marginBottom: 16,
  },
  deleteActionButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 87, 34, 0.1)",
    borderWidth: 1,
    borderColor: "#FF5722",
    alignItems: "center",
  },
  deleteActionText: {
    color: "#FF5722",
    fontSize: 16,
    fontWeight: "600",
  },
});
