import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
  { id: "chronic", label: "Chronic", icon: "pulse-outline" },
  { id: "acute", label: "Acute", icon: "flash-outline" },
  { id: "mental_health", label: "Mental Health", icon: "heart-outline" },
  { id: "genetic", label: "Genetic", icon: "code-working-outline" },
  { id: "autoimmune", label: "Autoimmune", icon: "shield-outline" },
  { id: "other", label: "Other", icon: "help-circle-outline" },
];

const SEVERITY_LEVELS = [
  {
    id: "mild",
    label: "Mild",
    color: "#4CAF50",
    description: "Minor impact on daily activities",
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
  {
    id: "critical",
    label: "Critical",
    color: "#D32F2F",
    description: "Severe impact requiring immediate attention",
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
    description: "Under treatment/control",
  },
  {
    id: "resolved",
    label: "Resolved",
    color: "#4CAF50",
    description: "No longer active",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    color: "#2196F3",
    description: "Being monitored by healthcare provider",
  },
];

const COMMON_SYMPTOMS = [
  "Fatigue",
  "Pain",
  "Headaches",
  "Nausea",
  "Dizziness",
  "Shortness of breath",
  "Fever",
  "Swelling",
  "Weakness",
  "Joint pain",
  "Muscle aches",
  "Insomnia",
  "Anxiety",
  "Depression",
  "Memory issues",
  "Difficulty concentrating",
  "Appetite changes",
];

export default function EditConditionScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "chronic" as ConditionItem["category"],
    severity: "mild" as ConditionItem["severity"],
    status: "active" as ConditionItem["status"],
    description: "",
    symptoms: [] as string[],
    medications: [] as string[],
    notes: "",
    diagnosis_date: "",
    onset_date: "",
    last_flare_date: "",
    treatment_plan: "",
    doctor_name: "",
    next_appointment: "",
  });
  const [customSymptom, setCustomSymptom] = useState("");
  const [customMedication, setCustomMedication] = useState("");

  useEffect(() => {
    loadConditionData();
  }, []);

  const loadConditionData = async () => {
    if (!user || !id) {
      Alert.alert("Error", "Invalid condition ID or user not authenticated", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    try {
      const condition = await ConditionsService.getConditionById(
        id as string,
        user.id
      );

      if (!condition) {
        Alert.alert("Error", "Condition not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      setFormData({
        name: condition.name,
        category: condition.category,
        severity: condition.severity,
        status: condition.status,
        description: condition.description || "",
        symptoms: condition.symptoms || [],
        medications: condition.medications || [],
        notes: condition.notes || "",
        diagnosis_date: condition.diagnosis_date || "",
        onset_date: condition.onset_date || "",
        last_flare_date: condition.last_flare_date || "",
        treatment_plan: condition.treatment_plan || "",
        doctor_name: condition.doctor_name || "",
        next_appointment: condition.next_appointment || "",
      });
    } catch (error) {
      console.error("Error loading condition:", error);
      Alert.alert("Error", "Failed to load condition data", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
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

  const addMedication = () => {
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
    if (!user || !id) {
      Alert.alert("Error", "User not authenticated or invalid condition ID");
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
        description: formData.description.trim(),
        notes: formData.notes.trim(),
        treatment_plan: formData.treatment_plan.trim(),
        doctor_name: formData.doctor_name.trim(),
      };

      await ConditionsService.updateCondition(id as string, conditionData);

      Alert.alert("Success", "Health condition updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating condition:", error);
      Alert.alert("Error", "Failed to update condition");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id) {
      Alert.alert("Error", "User not authenticated or invalid condition ID");
      return;
    }

    Alert.alert(
      "Delete Condition",
      "Are you sure you want to delete this health condition? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ConditionsService.deleteCondition(id as string);
              Alert.alert("Success", "Condition deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error("Error deleting condition:", error);
              Alert.alert("Error", "Failed to delete condition");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading condition data...</Text>
        </View>
      </LinearGradient>
    );
  }

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
          <Text style={styles.title}>Edit Condition</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
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
              placeholder="e.g., Type 2 Diabetes, Hypertension, Anxiety"
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

          {/* Status Selection - More prominent for editing */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Status *
            </Text>
            <View style={styles.statusList}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusOption,
                    { backgroundColor: colors.surface },
                    formData.status === status.id && {
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: status.id as ConditionItem["status"],
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
                          { color: colors.text },
                          formData.status === status.id && {
                            color: colors.primary,
                          },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.statusDescription,
                        { color: colors.textSecondary },
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

          {/* Description */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Describe your condition, how it affects you..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Symptoms */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Symptoms
            </Text>

            <View style={styles.symptomsGrid}>
              {COMMON_SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.symptomChip,
                    { backgroundColor: colors.surface },
                    formData.symptoms.includes(symptom) && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text
                    style={[
                      styles.symptomChipText,
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

            <View style={styles.customInputContainer}>
              <TextInput
                style={[
                  styles.customInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={customSymptom}
                onChangeText={setCustomSymptom}
                placeholder="Add custom symptom"
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={addCustomSymptom}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={addCustomSymptom}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {formData.symptoms.length > 0 && (
              <View style={styles.selectedContainer}>
                <Text style={[styles.selectedLabel, { color: colors.text }]}>
                  Current Symptoms ({formData.symptoms.length}):
                </Text>
                <View style={styles.selectedGrid}>
                  {formData.symptoms.map((symptom) => (
                    <View key={symptom} style={styles.selectedChip}>
                      <Text style={styles.selectedText}>{symptom}</Text>
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

            <View style={styles.customInputContainer}>
              <TextInput
                style={[
                  styles.customInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={customMedication}
                onChangeText={setCustomMedication}
                placeholder="e.g., Metformin 500mg, Lisinopril 10mg"
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={addMedication}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={addMedication}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {formData.medications.length > 0 && (
              <View style={styles.selectedContainer}>
                <Text style={[styles.selectedLabel, { color: colors.text }]}>
                  Current Medications ({formData.medications.length}):
                </Text>
                <View style={styles.medicationsList}>
                  {formData.medications.map((medication, index) => (
                    <View key={index} style={styles.medicationItem}>
                      <Ionicons
                        name="medical"
                        size={16}
                        color={colors.primary}
                      />
                      <Text
                        style={[styles.medicationText, { color: colors.text }]}
                      >
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

          {/* Additional Information */}
          <View style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Additional Information
            </Text>

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
                    setFormData((prev) => ({ ...prev, diagnosis_date: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.dateField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Last Flare-up
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  value={formData.last_flare_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, last_flare_date: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.optionalField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Doctor/Specialist Name
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
                placeholder="Dr. Smith, Cardiologist"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.optionalField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Next Appointment
              </Text>
              <TextInput
                style={[
                  styles.dateInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.next_appointment}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, next_appointment: text }))
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.optionalField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Treatment Plan
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
                placeholder="Current treatment approach, goals..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.optionalField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Notes
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
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Updating..." : "Update Condition"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteConditionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5722" />
              <Text style={styles.deleteButtonText}>Delete Condition</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    color: "#fff", 
    fontSize: 16, 
    marginTop: 16 
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
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 87, 34, 0.3)",
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
    fontWeight: "600" 
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    minHeight: 100,
    textAlignVertical: "top",
  },
  categoryGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 12 
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
    fontWeight: "500" 
  },
  severityList: { 
    gap: 12 
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
    flex: 1 
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
    fontWeight: "600" 
  },
  severityDescription: { 
    fontSize: 14, 
    marginLeft: 24 
  },
  statusList: { 
    gap: 12 
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  statusContent: { 
    flex: 1 
  },
  statusHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 4 
  },
  statusIndicator: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 12 
  },
  statusLabel: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
  statusDescription: { 
    fontSize: 14, 
    marginLeft: 24 
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  symptomChipText: { 
    fontSize: 14, 
    fontWeight: "500" 
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  customInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  addButton: { 
    padding: 12, 
    borderRadius: 8 
  },
  selectedContainer: { 
    marginTop: 16 
  },
  selectedLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 8 
  },
  selectedGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8 
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
  medicationsList: { 
    gap: 8 
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  medicationText: { 
    flex: 1, 
    fontSize: 14, 
    marginLeft: 8, 
    fontWeight: "500" 
  },
  datesContainer: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 16 
  },
  dateField: { 
    flex: 1 
  },
  optionalField: { 
    marginBottom: 16 
  },
  fieldLabel: { 
    fontSize: 14, 
    fontWeight: "500", 
    marginBottom: 8 
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
    paddingBottom: 40 
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
    fontWeight: "600" 
  },
  deleteConditionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 87, 34, 0.1)",
    borderWidth: 1,
    borderColor: "#FF5722",
  },
  deleteButtonText: {
    color: "#FF5722",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  }
  });
  