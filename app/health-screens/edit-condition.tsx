import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
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

const CATEGORIES = [
  { value: "chronic", label: "Chronic", icon: "pulse" },
  { value: "acute", label: "Acute", icon: "flash" },
  { value: "mental_health", label: "Mental Health", icon: "heart" },
  { value: "genetic", label: "Genetic", icon: "code-working" },
  { value: "autoimmune", label: "Autoimmune", icon: "shield" },
  { value: "other", label: "Other", icon: "help-circle" },
];

const SEVERITIES = [
  { value: "mild", label: "Mild", color: "#4CAF50" },
  { value: "moderate", label: "Moderate", color: "#FF9800" },
  { value: "severe", label: "Severe", color: "#FF5722" },
  { value: "critical", label: "Critical", color: "#D32F2F" },
];

const STATUSES = [
  { value: "active", label: "Active", color: "#FF5722" },
  { value: "managed", label: "Managed", color: "#FF9800" },
  { value: "resolved", label: "Resolved", color: "#4CAF50" },
  { value: "monitoring", label: "Monitoring", color: "#2196F3" },
];

const COMMON_SYMPTOMS = [
  "Pain",
  "Fatigue",
  "Nausea",
  "Headache",
  "Dizziness",
  "Fever",
  "Cough",
  "Shortness of breath",
  "Chest pain",
  "Joint pain",
  "Muscle pain",
  "Sleep problems",
  "Anxiety",
  "Depression",
  "Memory issues",
  "Concentration problems",
  "Skin rash",
  "Swelling",
  "Weight loss",
  "Weight gain",
  "Loss of appetite",
  "Digestive issues",
  "Vision problems",
  "Hearing problems",
];

export default function EditConditionScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();
  const { id } = useLocalSearchParams();

  const [condition, setCondition] = useState<ConditionItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ConditionItem["category"]>("other");
  const [severity, setSeverity] = useState<ConditionItem["severity"]>("mild");
  const [status, setStatus] = useState<ConditionItem["status"]>("active");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [notes, setNotes] = useState("");

  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [newSymptom, setNewSymptom] = useState("");
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [newMedication, setNewMedication] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadCondition(id);
    } else {
      Alert.alert("Error", "Invalid condition ID", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [id]);

  const loadCondition = async (conditionId: string) => {
    try {
      setLoading(true);
      const conditionData = await ConditionsService.getConditionById(
        conditionId
      );
      if (conditionData) {
        setCondition(conditionData);
        setName(conditionData.name);
        setDescription(conditionData.description || "");
        setCategory(conditionData.category);
        setSeverity(conditionData.severity);
        setStatus(conditionData.status);
        setSymptoms(conditionData.symptoms || []);
        setMedications(conditionData.medications || []);
        setTreatmentPlan(conditionData.treatment_plan || "");
        setNotes(conditionData.notes || "");
      } else {
        Alert.alert("Error", "Condition not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error loading condition:", error);
      Alert.alert("Error", "Failed to load condition", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymptom = (symptom: string) => {
    if (symptom.trim() && !symptoms.includes(symptom.trim())) {
      setSymptoms([...symptoms, symptom.trim()]);
    }
    setNewSymptom("");
  };

  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleAddMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication("");
      setShowMedicationModal(false);
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setMedications(medications.filter((m) => m !== medication));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a condition name");
      return;
    }

    if (!condition) {
      Alert.alert("Error", "No condition data available");
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        name: name.trim(),
        description: description.trim() || null,
        category,
        severity,
        status,
        symptoms: symptoms.length > 0 ? symptoms : null,
        medications: medications.length > 0 ? medications : null,
        treatment_plan: treatmentPlan.trim() || null,
        notes: notes.trim() || null,
      };

      await ConditionsService.updateCondition(condition.id, updatedData);
      Alert.alert("Success", "Condition updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating condition:", error);
      Alert.alert("Error", "Failed to update condition. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!condition) return;

    Alert.alert(
      "Delete Condition",
      `Are you sure you want to delete "${condition.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ConditionsService.deleteCondition(condition.id);
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
          <Text style={styles.loadingText}>Loading condition...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!condition) {
    return null;
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Condition</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Basic Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Condition Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter condition name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your condition..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Classification
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.optionButton,
                    category === cat.value && styles.optionButtonActive,
                    {
                      backgroundColor:
                        category === cat.value
                          ? colors.primary
                          : colors.background,
                    },
                  ]}
                  onPress={() =>
                    setCategory(cat.value as ConditionItem["category"])
                  }
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={
                      category === cat.value ? "#fff" : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: category === cat.value ? "#fff" : colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Severity</Text>
            <View style={styles.optionsRow}>
              {SEVERITIES.map((sev) => (
                <TouchableOpacity
                  key={sev.value}
                  style={[
                    styles.severityButton,
                    severity === sev.value && styles.severityButtonActive,
                    {
                      backgroundColor:
                        severity === sev.value ? sev.color : colors.background,
                      borderColor: sev.color,
                    },
                  ]}
                  onPress={() =>
                    setSeverity(sev.value as ConditionItem["severity"])
                  }
                >
                  <Text
                    style={[
                      styles.severityText,
                      { color: severity === sev.value ? "#fff" : sev.color },
                    ]}
                  >
                    {sev.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={styles.optionsRow}>
              {STATUSES.map((stat) => (
                <TouchableOpacity
                  key={stat.value}
                  style={[
                    styles.statusButton,
                    status === stat.value && styles.statusButtonActive,
                    {
                      backgroundColor:
                        status === stat.value ? stat.color : colors.background,
                      borderColor: stat.color,
                    },
                  ]}
                  onPress={() =>
                    setStatus(stat.value as ConditionItem["status"])
                  }
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: status === stat.value ? "#fff" : stat.color },
                    ]}
                  >
                    {stat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Symptoms
          </Text>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowSymptomModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Symptom</Text>
          </TouchableOpacity>

          {symptoms.length > 0 && (
            <View style={styles.chipContainer}>
              {symptoms.map((symptom, index) => (
                <View
                  key={index}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text style={[styles.chipText, { color: colors.primary }]}>
                    {symptom}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSymptom(symptom)}
                  >
                    <Ionicons name="close" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Medications
          </Text>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowMedicationModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Medication</Text>
          </TouchableOpacity>

          {medications.length > 0 && (
            <View style={styles.medicationsList}>
              {medications.map((medication, index) => (
                <View
                  key={index}
                  style={[
                    styles.medicationItem,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Ionicons name="medical" size={20} color={colors.primary} />
                  <Text style={[styles.medicationText, { color: colors.text }]}>
                    {medication}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveMedication(medication)}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Additional Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Treatment Plan
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={treatmentPlan}
              onChangeText={setTreatmentPlan}
              placeholder="Describe your treatment plan..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Symptom Modal */}
      <Modal visible={showSymptomModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add Symptom
              </Text>
              <TouchableOpacity onPress={() => setShowSymptomModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Common Symptoms
              </Text>
              <ScrollView
                style={styles.symptomGrid}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.symptomRow}>
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <TouchableOpacity
                      key={symptom}
                      style={[
                        styles.symptomOption,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() => {
                        handleAddSymptom(symptom);
                        setShowSymptomModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.symptomOptionText,
                          { color: colors.text },
                        ]}
                      >
                        {symptom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Custom Symptom
              </Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.background, color: colors.text },
                  ]}
                  value={newSymptom}
                  onChangeText={setNewSymptom}
                  placeholder="Enter custom symptom"
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity
                  style={[
                    styles.modalAddButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    handleAddSymptom(newSymptom);
                    setShowSymptomModal(false);
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Medication Modal */}
      <Modal visible={showMedicationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add Medication
              </Text>
              <TouchableOpacity onPress={() => setShowMedicationModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Medication Name
              </Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.background, color: colors.text },
                  ]}
                  value={newMedication}
                  onChangeText={setNewMedication}
                  placeholder="Enter medication name"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                />
                <TouchableOpacity
                  style={[
                    styles.modalAddButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddMedication}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
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
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    gap: 6,
    minWidth: 100,
  },
  optionButtonActive: {
    borderColor: "transparent",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  severityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    minWidth: 80,
  },
  severityButtonActive: {
    borderColor: "transparent",
  },
  severityText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    minWidth: 80,
  },
  statusButtonActive: {
    borderColor: "transparent",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  medicationsList: {
    gap: 8,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  medicationText: {
    fontSize: 16,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalSection: {
    marginBottom: 20,
  },
  symptomGrid: {
    maxHeight: 200,
  },
  symptomRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  symptomOptionText: {
    fontSize: 14,
  },
  customInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  modalInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalAddButton: {
    padding: 12,
    borderRadius: 8,
  },
});
