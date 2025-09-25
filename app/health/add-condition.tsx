import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import GlassCard from "../../components/ui/GlassCard";
import GradientButton from "../../components/ui/GradientButton";
import DefaultColors, { Colors } from "../../constants/Colors";
import {
  ConditionsService,
  ConditionUpdate,
} from "../../services/ConditionsService";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import { TextInput } from "react-native-gesture-handler";

const CONDITION_CATEGORIES = [
  {
    id: "chronic",
    label: "Chronic",
    icon: "time-outline",
    description: "Long-term conditions requiring ongoing management",
  },
  {
    id: "acute",
    label: "Acute",
    icon: "flash-outline",
    description: "Short-term conditions with rapid onset",
  },
  {
    id: "mental-health",
    label: "Mental Health",
    icon: "happy-outline",
    description: "Mental and emotional health conditions",
  },
  {
    id: "other",
    label: "Other",
    icon: "help-circle-outline",
    description: "Other health conditions not listed above",
  },
];

const SEVERITY_LEVELS = [
  {
    id: "mild",
    label: "Mild",
    color: "#4CAF50",
    description: "Minimal impact on daily activities",
  },
  {
    id: "moderate",
    label: "Moderate",
    color: "#FF9800",
    description: "Some impact on daily activities",
  },
  {
    id: "severe",
    label: "Severe",
    color: "#FF5722",
    description: "Significant impact on daily activities",
  },
];

const STATUS_OPTIONS = [
  {
    id: "active",
    label: "Active",
    color: "#FF5722",
    description: "Currently experiencing symptoms",
  },
  {
    id: "managed",
    label: "Managed",
    color: "#FF9800",
    description: "Under control with treatment",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    color: "#2196F3",
    description: "Keeping watch, no active symptoms",
  },
  {
    id: "resolved",
    label: "Resolved",
    color: "#4CAF50",
    description: "No longer experiencing this condition",
  },
];

const COMMON_SYMPTOMS = [
  "Pain",
  "Fatigue",
  "Headache",
  "Nausea",
  "Dizziness",
  "Fever",
  "Difficulty breathing",
  "Chest pain",
  "Joint pain",
  "Muscle aches",
  "Insomnia",
  "Anxiety",
  "Depression",
  "Memory issues",
  "Concentration problems",
  "Digestive issues",
  "Skin rash",
  "Swelling",
  "Vision problems",
  "Hearing problems",
];

const COMMON_TRIGGERS = [
  "Stress",
  "Weather changes",
  "Physical activity",
  "Certain foods",
  "Allergens",
  "Lack of sleep",
  "Hormonal changes",
  "Dehydration",
  "Bright lights",
  "Loud noises",
  "Strong smells",
  "Temperature changes",
  "Travel",
  "Illness",
  "Medication changes",
];

export default function AddConditionScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    condition_name: "",
    category: "chronic" as ConditionUpdate["category"],
    status: "active" as ConditionUpdate["status"],
    severity: "mild" as ConditionUpdate["severity"],
    description: "",
    symptoms: [] as string[],
    triggers: [] as string[],
    medications: [] as string[],
    notes: "",
    diagnosed_date: "",
    last_flare_date: "",
    next_appointment: "",
    doctor_name: "",
  });

  const [customSymptom, setCustomSymptom] = useState("");
  const [customTrigger, setCustomTrigger] = useState("");
  const [customMedication, setCustomMedication] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!formData.condition_name.trim()) {
      Alert.alert("Error", "Please enter the condition name");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    try {
      setSaving(true);

      const conditionData = {
        ...formData,
        user_id: user.id,
        condition_name: formData.condition_name.trim(),
        description: formData.description.trim(),
        notes: formData.notes.trim(),
        doctor_name: formData.doctor_name.trim(),
      };

      await ConditionsService.createCondition(conditionData);

      Alert.alert("Success", "Condition added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving condition:", error);
      Alert.alert("Error", "Failed to save condition");
    } finally {
      setSaving(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const toggleTrigger = (trigger: string) => {
    setFormData((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter((t) => t !== trigger)
        : [...prev.triggers, trigger],
    }));
  };

  const addCustomSymptom = () => {
    if (
      customSymptom.trim() &&
      !formData.symptoms.includes(customSymptom.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        symptoms: [...prev.symptoms, customSymptom.trim()],
      }));
      setCustomSymptom("");
    }
  };

  const addCustomTrigger = () => {
    if (
      customTrigger.trim() &&
      !formData.triggers.includes(customTrigger.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        triggers: [...prev.triggers, customTrigger.trim()],
      }));
      setCustomTrigger("");
    }
  };

  const addCustomMedication = () => {
    if (
      customMedication.trim() &&
      !formData.medications.includes(customMedication.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        medications: [...prev.medications, customMedication.trim()],
      }));
      setCustomMedication("");
    }
  };

  const removeItem = (array: string[], item: string) => {
    return array.filter((i) => i !== item);
  };

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
            Add Condition
          </ThemedText>
          <View style={styles.spacer} />
        </ThemedView>

        {/* Basic Information */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>

            <View style={styles.inputField}>
              <ThemedText style={styles.fieldLabel}>
                Condition Name *
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={formData.condition_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, condition_name: text }))
                }
                placeholder="e.g., Diabetes Type 2, Migraine, Anxiety"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputField}>
              <ThemedText style={styles.fieldLabel}>Description *</ThemedText>
              <TextInput
                style={styles.textArea}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Describe your condition, how it affects you..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </GlassCard>

        {/* Category Selection */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Category *
            </ThemedText>
            <View style={styles.optionsGrid}>
              {CONDITION_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.optionCard,
                    formData.category === category.id &&
                      styles.optionCardActive,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      category: category.id as ConditionUpdate["category"],
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
                      styles.optionLabel,
                      formData.category === category.id &&
                        styles.optionLabelActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      formData.category === category.id &&
                        styles.optionDescriptionActive,
                    ]}
                  >
                    {category.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Status and Severity */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Current Status *
            </ThemedText>
            <View style={styles.statusList}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusOption,
                    formData.status === status.id && styles.statusOptionActive,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: status.id as ConditionUpdate["status"],
                    }))
                  }
                >
                  <View style={styles.statusContent}>
                    <View style={styles.statusHeader}>
                      <View
                        style={[
                          styles.statusIndicator,
                          { backgroundColor: status.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusLabel,
                          formData.status === status.id &&
                            styles.statusLabelActive,
                        ]}
                      >
                        {status.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.statusDescription,
                        formData.status === status.id &&
                          styles.statusDescriptionActive,
                      ]}
                    >
                      {status.description}
                    </Text>
                  </View>
                  {formData.status === status.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

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
                      severity: severity.id as ConditionUpdate["severity"],
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

        {/* Symptoms */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Symptoms
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Select symptoms you experience with this condition
            </ThemedText>

            <View style={styles.tagsGrid}>
              {COMMON_SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.tagChip,
                    formData.symptoms.includes(symptom) && styles.tagChipActive,
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      formData.symptoms.includes(symptom) &&
                        styles.tagChipTextActive,
                    ]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={customSymptom}
                onChangeText={setCustomSymptom}
                placeholder="Add custom symptom"
                placeholderTextColor="#999"
                onSubmitEditing={addCustomSymptom}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addCustomSymptom}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {formData.symptoms.length > 0 && (
              <View style={styles.selectedContainer}>
                <ThemedText style={styles.selectedLabel}>
                  Selected Symptoms ({formData.symptoms.length}):
                </ThemedText>
                <View style={styles.selectedGrid}>
                  {formData.symptoms.map((symptom) => (
                    <View key={symptom} style={styles.selectedChip}>
                      <Text style={styles.selectedText}>{symptom}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            symptoms: removeItem(prev.symptoms, symptom),
                          }))
                        }
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

        {/* Triggers */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Triggers (Optional)
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              What triggers or worsens your symptoms?
            </ThemedText>

            <View style={styles.tagsGrid}>
              {COMMON_TRIGGERS.map((trigger) => (
                <TouchableOpacity
                  key={trigger}
                  style={[
                    styles.tagChip,
                    formData.triggers.includes(trigger) && styles.tagChipActive,
                  ]}
                  onPress={() => toggleTrigger(trigger)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      formData.triggers.includes(trigger) &&
                        styles.tagChipTextActive,
                    ]}
                  >
                    {trigger}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={customTrigger}
                onChangeText={setCustomTrigger}
                placeholder="Add custom trigger"
                placeholderTextColor="#999"
                onSubmitEditing={addCustomTrigger}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addCustomTrigger}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {formData.triggers.length > 0 && (
              <View style={styles.selectedContainer}>
                <ThemedText style={styles.selectedLabel}>
                  Selected Triggers ({formData.triggers.length}):
                </ThemedText>
                <View style={styles.selectedGrid}>
                  {formData.triggers.map((trigger) => (
                    <View key={trigger} style={styles.selectedChip}>
                      <Text style={styles.selectedText}>{trigger}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            triggers: removeItem(prev.triggers, trigger),
                          }))
                        }
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

        {/* Medications */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Medications (Optional)
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              List medications you take for this condition
            </ThemedText>

            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={customMedication}
                onChangeText={setCustomMedication}
                placeholder="Add medication name"
                placeholderTextColor="#999"
                onSubmitEditing={addCustomMedication}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addCustomMedication}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {formData.medications.length > 0 && (
              <View style={styles.selectedContainer}>
                <ThemedText style={styles.selectedLabel}>
                  Current Medications ({formData.medications.length}):
                </ThemedText>
                <View style={styles.selectedGrid}>
                  {formData.medications.map((medication) => (
                    <View key={medication} style={styles.selectedChip}>
                      <Text style={styles.selectedText}>{medication}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            medications: removeItem(
                              prev.medications,
                              medication
                            ),
                          }))
                        }
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

        {/* Additional Information */}
        <GlassCard style={styles.formCard}>
          <View style={styles.formSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Additional Information
            </ThemedText>

            <View style={styles.inputField}>
              <ThemedText style={styles.fieldLabel}>
                Doctor/Specialist Name
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={formData.doctor_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, doctor_name: text }))
                }
                placeholder="Dr. Smith, Cardiology Specialist"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputField}>
              <ThemedText style={styles.fieldLabel}>Notes</ThemedText>
              <TextInput
                style={styles.textArea}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Any additional notes about this condition..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.datesRow}>
              <View style={styles.dateField}>
                <ThemedText style={styles.fieldLabel}>
                  Diagnosed Date
                </ThemedText>
                <TextInput
                  style={styles.dateInput}
                  value={formData.diagnosed_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, diagnosed_date: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.dateField}>
                <ThemedText style={styles.fieldLabel}>
                  Next Appointment
                </ThemedText>
                <TextInput
                  style={styles.dateInput}
                  value={formData.next_appointment}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, next_appointment: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <GradientButton
            title={saving ? "Saving..." : "Save Condition"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
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
  spacer: {
    width: 40,
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
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  inputField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.8,
  },
  textInput: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
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
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
  optionLabelActive: {
    color: "#fff",
  },
  optionDescription: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 14,
  },
  optionDescriptionActive: {
    color: "#fff",
    opacity: 0.9,
  },
  statusList: {
    gap: 12,
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 2,
    borderColor: "transparent",
  },
  statusOptionActive: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderColor: colors.primary,
  },
  statusContent: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusLabelActive: {
    color: colors.primary,
  },
  statusDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 24,
  },
  statusDescriptionActive: {
    opacity: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 20,
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
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  tagChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagChipTextActive: {
    color: "#fff",
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  selectedContainer: {
    marginTop: 16,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  selectedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  selectedText: {
    fontSize: 12,
    color: "#4CAF50",
    marginRight: 6,
    fontWeight: "500",
  },
  datesRow: {
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
  saveContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButton: {
    marginTop: 10,
  },
});
