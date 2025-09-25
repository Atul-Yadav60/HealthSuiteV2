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
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuth";
import {
  ConditionsService,
  ConditionItem,
} from "../../services/ConditionsService";

const CONDITION_CATEGORIES = [
  { id: "chronic", label: "Chronic", icon: "timer-outline" },
  { id: "acute", label: "Acute", icon: "flash-outline" },
  { id: "mental_health", label: "Mental Health", icon: "brain-outline" },
  { id: "genetic", label: "Genetic", icon: "dna-outline" },
  { id: "autoimmune", label: "Autoimmune", icon: "shield-outline" },
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

const COMMON_SYMPTOMS = [
  "Fatigue",
  "Pain",
  "Fever",
  "Headache",
  "Nausea",
  "Dizziness",
  "Shortness of breath",
  "Chest pain",
  "Swelling",
  "Inflammation",
  "Joint pain",
  "Muscle weakness",
  "Insomnia",
  "Depression",
  "Anxiety",
  "Rash",
  "Weight changes",
  "Cognitive issues",
];

const STATUS_OPTIONS = [
  {
    id: "active",
    label: "Active",
    color: "#D32F2F",
    description: "Currently experiencing symptoms",
  },
  {
    id: "managed",
    label: "Managed",
    color: "#FF9800",
    description: "Under treatment with symptoms controlled",
  },
  {
    id: "resolved",
    label: "Resolved",
    color: "#4CAF50",
    description: "No longer experiencing symptoms",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    color: "#2196F3",
    description: "Watching for changes or recurrence",
  },
];

export default function AddConditionScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    category: "chronic" as ConditionItem["category"],
    severity: "mild" as ConditionItem["severity"],
    status: "active" as ConditionItem["status"],
    symptoms: [] as string[],
    medications: [] as string[],
    notes: "",
    diagnosis_date: "",
    onset_date: "",
    treatment_plan: "",
    doctor_name: "",
  });

  const [customSymptom, setCustomSymptom] = useState("");
  const [customMedication, setCustomMedication] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
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

  const removeSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.filter((s) => s !== symptom),
    }));
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

  const removeMedication = (medication: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m !== medication),
    }));
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter the condition name");
      return;
    }

    try {
      setSaving(true);

      const conditionData = {
        ...formData,
        name: formData.name.trim(),
        notes: formData.notes.trim() || undefined,
        diagnosis_date: formData.diagnosis_date.trim() || undefined,
        onset_date: formData.onset_date.trim() || undefined,
        treatment_plan: formData.treatment_plan.trim() || undefined,
        doctor_name: formData.doctor_name.trim() || undefined,
      };

      await ConditionsService.createCondition(user.id, conditionData);

      Alert.alert("Success", "Condition added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error adding condition:", error);
      Alert.alert("Error", "Failed to add condition");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Condition</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Condition Name */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Condition Name *
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
              placeholder="e.g., Diabetes, Asthma, Hypertension"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Category *
            </Text>
            <View style={styles.categoryGrid}>
              {CONDITION_CATEGORIES.map((category) => (
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
                      category: category.id as ConditionItem["category"],
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
                      severity: severity.id as ConditionItem["severity"],
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

          {/* Status Selection */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Status *
            </Text>
            <View style={styles.severityList}>
              {STATUS_OPTIONS.map((statusOption) => (
                <TouchableOpacity
                  key={statusOption.id}
                  style={[
                    styles.severityOption,
                    { backgroundColor: colors.surface },
                    formData.status === statusOption.id && {
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: statusOption.id as ConditionItem["status"],
                    }))
                  }
                >
                  <View style={styles.severityContent}>
                    <View style={styles.severityHeader}>
                      <View
                        style={[
                          styles.severityIndicator,
                          { backgroundColor: statusOption.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.severityLabel,
                          { color: colors.text },
                          formData.status === statusOption.id && {
                            color: colors.primary,
                          },
                        ]}
                      >
                        {statusOption.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.severityDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {statusOption.description}
                    </Text>
                  </View>
                  {formData.status === statusOption.id && (
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

          {/* Symptoms Selection */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Symptoms
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Select all symptoms you experience
            </Text>

            <View style={styles.reactionsGrid}>
              {COMMON_SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.reactionChip,
                    { backgroundColor: colors.surface },
                    formData.symptoms.includes(symptom) && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text
                    style={[
                      styles.reactionChipText,
                      { color: colors.text },
                      formData.symptoms.includes(symptom) && {
                        color: "#fff",
                      },
                    ]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Symptom Input */}
            <View style={styles.customReactionContainer}>
              <TextInput
                style={[
                  styles.customReactionInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={customSymptom}
                onChangeText={setCustomSymptom}
                placeholder="Add custom symptom"
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={addCustomSymptom}
              />
              <TouchableOpacity
                style={[
                  styles.addReactionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={addCustomSymptom}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Selected Symptoms */}
            {formData.symptoms.length > 0 && (
              <View style={styles.selectedReactionsContainer}>
                <Text
                  style={[
                    styles.selectedReactionsLabel,
                    { color: colors.text },
                  ]}
                >
                  Selected Symptoms ({formData.symptoms.length}):
                </Text>
                <View style={styles.selectedReactionsGrid}>
                  {formData.symptoms.map((symptom) => (
                    <View key={symptom} style={styles.selectedReactionChip}>
                      <Text style={styles.selectedReactionText}>{symptom}</Text>
                      <TouchableOpacity onPress={() => removeSymptom(symptom)}>
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

          {/* Medications */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Medications
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Add medications for this condition
            </Text>

            <View style={styles.customReactionContainer}>
              <TextInput
                style={[
                  styles.customReactionInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={customMedication}
                onChangeText={setCustomMedication}
                placeholder="Add medication (e.g., Metformin 500mg)"
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={addCustomMedication}
              />
              <TouchableOpacity
                style={[
                  styles.addReactionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={addCustomMedication}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Selected Medications */}
            {formData.medications.length > 0 && (
              <View style={styles.selectedReactionsContainer}>
                <Text
                  style={[
                    styles.selectedReactionsLabel,
                    { color: colors.text },
                  ]}
                >
                  Medications ({formData.medications.length}):
                </Text>
                <View style={styles.selectedReactionsGrid}>
                  {formData.medications.map((medication) => (
                    <View key={medication} style={styles.selectedReactionChip}>
                      <Text style={styles.selectedReactionText}>
                        {medication}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeMedication(medication)}
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
                Treatment Plan (optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.treatment_plan}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, treatment_plan: text }))
                }
                placeholder="Describe the treatment plan for this condition..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.optionalField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Doctor Name (optional)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.doctor_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, doctor_name: text }))
                }
                placeholder="Enter your doctor's name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

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
                placeholder="Any additional notes about this condition..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.datesContainer}>
              <View style={styles.dateField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Diagnosis Date
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  value={formData.diagnosis_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      diagnosis_date: text,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.dateField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Onset Date
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  value={formData.onset_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      onset_date: text,
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
                {saving ? "Adding..." : "Add Condition"}
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
