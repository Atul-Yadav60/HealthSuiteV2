import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DefaultColors, { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import { AllergiesService, AllergyItem } from "@/services/AllergiesService";

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

export default function AddAllergyScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
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
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated");
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

      const allergyData = {
        ...formData,
        name: formData.name.trim(),
        notes: formData.notes.trim(),
      };

      await AllergiesService.createAllergy(user.id, allergyData);

      Alert.alert("Success", "Allergy added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error adding allergy:", error);
      Alert.alert("Error", "Failed to add allergy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Allergy</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Allergy Name */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Allergy Name *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="e.g., Peanuts, Penicillin, Pollen"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Category *
            </Text>
            <View style={styles.categoryGrid}>
              {ALLERGY_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    { backgroundColor: colors.surface },
                    formData.category === category.id && {
                      backgroundColor: colors.primary,
                    },
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
                      {
                        color:
                          formData.category === category.id
                            ? "#fff"
                            : colors.text,
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity Selection */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Severity Level *
            </Text>
            <View style={styles.severityList}>
              {SEVERITY_LEVELS.map((severity) => (
                <TouchableOpacity
                  key={severity.id}
                  style={[
                    styles.severityOption,
                    { backgroundColor: colors.surface },
                    formData.severity === severity.id && {
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
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
                          { color: colors.text },
                          formData.severity === severity.id && {
                            color: colors.primary,
                          },
                        ]}
                      >
                        {severity.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.severityDescription,
                        { color: colors.textSecondary },
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

          {/* Reactions Selection */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Common Reactions *
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Select all reactions you experience
            </Text>

            <View style={styles.reactionsGrid}>
              {COMMON_REACTIONS.map((reaction) => (
                <TouchableOpacity
                  key={reaction}
                  style={[
                    styles.reactionChip,
                    { backgroundColor: colors.surface },
                    formData.reactions.includes(reaction) && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleReaction(reaction)}
                >
                  <Text
                    style={[
                      styles.reactionChipText,
                      { color: colors.text },
                      formData.reactions.includes(reaction) && {
                        color: "#fff",
                      },
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
                style={[
                  styles.customReactionInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={customReaction}
                onChangeText={setCustomReaction}
                placeholder="Add custom reaction"
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={addCustomReaction}
              />
              <TouchableOpacity
                style={[
                  styles.addReactionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={addCustomReaction}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Selected Reactions */}
            {formData.reactions.length > 0 && (
              <View style={styles.selectedReactionsContainer}>
                <Text
                  style={[
                    styles.selectedReactionsLabel,
                    { color: colors.text },
                  ]}
                >
                  Selected Reactions ({formData.reactions.length}):
                </Text>
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

          {/* Optional Fields */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Additional Information
            </Text>

            <View style={styles.optionalField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Notes (optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Any additional notes about this allergy..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.datesContainer}>
              <View style={styles.dateField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  First Reaction Date
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  value={formData.first_reaction_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_reaction_date: text,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.dateField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Last Reaction Date
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  value={formData.last_reaction_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_reaction_date: text,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Adding..." : "Add Allergy"}
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  formCard: {
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
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    marginBottom: 16,
    fontSize: 14,
  },
  textInput: {
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
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
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
    borderWidth: 1,
    borderColor: "transparent",
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
  severityDescription: {
    fontSize: 14,
    marginLeft: 24,
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
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  reactionChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  customReactionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  customReactionInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  addReactionButton: {
    padding: 12,
    borderRadius: 8,
  },
  selectedReactionsContainer: {
    marginTop: 16,
  },
  selectedReactionsLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
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
  },
  textArea: {
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
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
