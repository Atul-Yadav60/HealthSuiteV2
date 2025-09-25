import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import DefaultColors, { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import { MedicationService } from "@/services/MedicationService";
import { scheduleMedicationReminder } from "@/services/NotificationService";

// Enhanced medication form fields
const FREQUENCY_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "Weekly",
  "Every other day",
];

const MEAL_TIMING_OPTIONS = [
  { value: "anytime", label: "Anytime" },
  { value: "before", label: "Before meals" },
  { value: "with", label: "With meals" },
  { value: "after", label: "After meals" },
];

const COMMON_SIDE_EFFECTS = [
  "Nausea",
  "Drowsiness",
  "Dizziness",
  "Headache",
  "Upset stomach",
  "Fatigue",
  "Dry mouth",
  "Insomnia",
  "Constipation",
  "Diarrhea",
  "Rash",
  "Weight gain",
  "Weight loss",
  "Blurred vision",
  "Mood changes",
];

export default function AddMedicationScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;
  const { user } = useAuth();

  // Basic medication info
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [mealTiming, setMealTiming] = useState<
    "before" | "with" | "after" | "anytime"
  >("anytime");

  // Additional details
  const [instructions, setInstructions] = useState("");
  const [prescribingDoctor, setPrescribingDoctor] = useState("");
  const [refillReminder, setRefillReminder] = useState(false);
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>([]);
  const [customSideEffect, setCustomSideEffect] = useState("");

  // Dates
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Loading and modal states
  const [loading, setLoading] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showMealTimingModal, setShowMealTimingModal] = useState(false);
  const [showSideEffectsModal, setShowSideEffectsModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleSaveMedication = async () => {
    if (!user?.id) {
      Alert.alert("Authentication Error", "Please log in to add medications.");
      return;
    }

    if (!medicationName.trim()) {
      Alert.alert("Missing Information", "Please enter the medication name.");
      return;
    }

    if (!dosage.trim()) {
      Alert.alert("Missing Information", "Please enter the dosage.");
      return;
    }

    setLoading(true);
    try {
      const medicationSchedule =
        await MedicationService.createMedicationSchedule(user.id, {
          medication_name: medicationName.trim(),
          dosage: dosage.trim(),
          frequency,
          meal_timing: mealTiming,
          instructions: instructions.trim() || undefined,
          prescribing_doctor: prescribingDoctor.trim() || undefined,
          refill_reminder: refillReminder,
          side_effects:
            selectedSideEffects.length > 0 ? selectedSideEffects : undefined,
          start_date: startDate?.toISOString().split("T")[0],
          end_date: endDate?.toISOString().split("T")[0],
        });

      if (medicationSchedule) {
        Alert.alert(
          "Success! 💊",
          `${medicationName} has been added to your medication schedule.`,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );

        // Reset form
        setMedicationName("");
        setDosage("");
        setFrequency("Once daily");
        setMealTiming("anytime");
        setInstructions("");
        setPrescribingDoctor("");
        setRefillReminder(false);
        setSelectedSideEffects([]);
        setStartDate(new Date());
        setEndDate(null);
      } else {
        Alert.alert("Error", "Failed to save medication. Please try again.");
      }
    } catch (error: any) {
      console.error("Error saving medication:", error);
      Alert.alert("Error", "Failed to save medication: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSideEffectToggle = (sideEffect: string) => {
    setSelectedSideEffects((prev) =>
      prev.includes(sideEffect)
        ? prev.filter((effect) => effect !== sideEffect)
        : [...prev, sideEffect]
    );
  };

  const handleAddCustomSideEffect = () => {
    if (
      customSideEffect.trim() &&
      !selectedSideEffects.includes(customSideEffect.trim())
    ) {
      setSelectedSideEffects((prev) => [...prev, customSideEffect.trim()]);
      setCustomSideEffect("");
    }
  };

  const handleStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Not set";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <LinearGradient colors={["#2066c1ff", "#1a5bb8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Add Medication 💊</Text>
            <Text style={styles.headerSubtitle}>
              Set up your medication schedule
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons
              name="close-circle"
              size={28}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.form}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Basic Information */}
          <GlassCard style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Basic Information
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              Medication Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.outline,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="e.g., Metformin, Lisinopril"
              placeholderTextColor={colors.onSurfaceVariant}
              value={medicationName}
              onChangeText={setMedicationName}
              autoCapitalize="words"
              returnKeyType="next"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: colors.text }]}>Dosage *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.outline,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="e.g., 500mg, 2 tablets, 10ml"
              placeholderTextColor={colors.onSurfaceVariant}
              value={dosage}
              onChangeText={setDosage}
              returnKeyType="next"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Frequency *
            </Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={() => setShowFrequencyModal(true)}
            >
              <Text style={[styles.selectButtonText, { color: colors.text }]}>
                {frequency}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.text }]}>
              Meal Timing
            </Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={() => setShowMealTimingModal(true)}
            >
              <Text style={[styles.selectButtonText, { color: colors.text }]}>
                {MEAL_TIMING_OPTIONS.find(
                  (option) => option.value === mealTiming
                )?.label || "Anytime"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </GlassCard>

          {/* Duration */}
          <GlassCard style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Duration
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              Start Date
            </Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.selectButtonText, { color: colors.text }]}>
                {formatDate(startDate)}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.text }]}>
              End Date (Optional)
            </Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.selectButtonText, { color: colors.text }]}>
                {formatDate(endDate)}
              </Text>
            </TouchableOpacity>
            {endDate && (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setEndDate(null)}
              >
                <Text style={[styles.clearDateText, { color: colors.primary }]}>
                  Clear end date
                </Text>
              </TouchableOpacity>
            )}
          </GlassCard>

          {/* Additional Details */}
          <GlassCard style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Additional Details
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              Prescribing Doctor
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.outline,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="e.g., Dr. Smith"
              placeholderTextColor={colors.onSurfaceVariant}
              value={prescribingDoctor}
              onChangeText={setPrescribingDoctor}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Special Instructions
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.outline,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="e.g., Take with food, avoid alcohol"
              placeholderTextColor={colors.onSurfaceVariant}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
            />

            <TouchableOpacity
              style={styles.refillReminderRow}
              onPress={() => setRefillReminder(!refillReminder)}
            >
              <View style={styles.refillReminderContent}>
                <Ionicons
                  name="notifications"
                  size={20}
                  color={
                    refillReminder ? colors.primary : colors.onSurfaceVariant
                  }
                />
                <View style={styles.refillReminderText}>
                  <Text
                    style={[styles.refillReminderTitle, { color: colors.text }]}
                  >
                    Refill Reminders
                  </Text>
                  <Text
                    style={[
                      styles.refillReminderSubtitle,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Get notified when it's time to refill
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: refillReminder
                      ? colors.primary
                      : colors.surfaceVariant,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: "white",
                      transform: [{ translateX: refillReminder ? 20 : 2 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.text }]}>
              Known Side Effects
            </Text>
            {selectedSideEffects.length > 0 && (
              <View style={styles.selectedSideEffectsContainer}>
                <Text style={[styles.selectedLabel, { color: colors.text }]}>
                  Selected ({selectedSideEffects.length}):
                </Text>
                <View style={styles.selectedSideEffects}>
                  {selectedSideEffects.map((effect, index) => (
                    <View
                      key={index}
                      style={[
                        styles.sideEffectChip,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sideEffectChipText,
                          { color: colors.primary },
                        ]}
                      >
                        {effect}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleSideEffectToggle(effect)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={() => setShowSideEffectsModal(true)}
            >
              <Ionicons name="medical" size={20} color={colors.primary} />
              <Text style={[styles.selectButtonText, { color: colors.text }]}>
                Select Known Side Effects
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footer}>
          <GradientButton
            title={loading ? "Saving..." : "Save Medication"}
            onPress={handleSaveMedication}
            loading={loading}
            disabled={loading || !medicationName.trim() || !dosage.trim()}
          />
        </View>
      </View>

      {/* Frequency Modal */}
      <Modal
        visible={showFrequencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Frequency
              </Text>
              <TouchableOpacity
                onPress={() => setShowFrequencyModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        frequency === option
                          ? colors.primary + "20"
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setFrequency(option);
                    setShowFrequencyModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          frequency === option ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                  {frequency === option && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Meal Timing Modal */}
      <Modal
        visible={showMealTimingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMealTimingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Meal Timing
              </Text>
              <TouchableOpacity
                onPress={() => setShowMealTimingModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {MEAL_TIMING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        mealTiming === option.value
                          ? colors.primary + "20"
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setMealTiming(option.value as any);
                    setShowMealTimingModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          mealTiming === option.value
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {mealTiming === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Side Effects Modal */}
      <Modal
        visible={showSideEffectsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSideEffectsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Side Effects
              </Text>
              <TouchableOpacity
                onPress={() => setShowSideEffectsModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.sideEffectsGrid}>
                {COMMON_SIDE_EFFECTS.map((effect) => (
                  <TouchableOpacity
                    key={effect}
                    style={[
                      styles.sideEffectOption,
                      {
                        backgroundColor: selectedSideEffects.includes(effect)
                          ? colors.primary + "20"
                          : colors.surfaceVariant,
                        borderColor: selectedSideEffects.includes(effect)
                          ? colors.primary
                          : "transparent",
                      },
                    ]}
                    onPress={() => handleSideEffectToggle(effect)}
                  >
                    <Text
                      style={[
                        styles.sideEffectOptionText,
                        {
                          color: selectedSideEffects.includes(effect)
                            ? colors.primary
                            : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {effect}
                    </Text>
                    {selectedSideEffects.includes(effect) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.customSideEffectContainer}>
                <Text
                  style={[styles.customSideEffectLabel, { color: colors.text }]}
                >
                  Add Custom Side Effect
                </Text>
                <View style={styles.customSideEffectInputContainer}>
                  <TextInput
                    style={[
                      styles.customSideEffectInput,
                      {
                        backgroundColor: colors.surfaceVariant,
                        color: colors.text,
                        borderColor: colors.outline,
                      },
                    ]}
                    placeholder="Enter side effect..."
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={customSideEffect}
                    onChangeText={setCustomSideEffect}
                    onSubmitEditing={handleAddCustomSideEffect}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addSideEffectButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleAddCustomSideEffect}
                    disabled={!customSideEffect.trim()}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalDoneButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setShowSideEffectsModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>
                Done ({selectedSideEffects.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
          minimumDate={startDate || new Date()}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 18,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  form: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 48,
    gap: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  clearDateButton: {
    alignSelf: "flex-start",
    marginTop: -8,
    marginBottom: 8,
  },
  clearDateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  refillReminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 16,
  },
  refillReminderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  refillReminderText: {
    flex: 1,
  },
  refillReminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  refillReminderSubtitle: {
    fontSize: 14,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  selectedSideEffectsContainer: {
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  selectedSideEffects: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sideEffectChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  sideEffectChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
    backgroundColor: "transparent",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalDoneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  modalDoneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  // Side Effects Modal
  sideEffectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  sideEffectOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  sideEffectOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  customSideEffectContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  customSideEffectLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  customSideEffectInputContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  customSideEffectInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  addSideEffectButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
