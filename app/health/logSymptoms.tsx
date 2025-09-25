import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  RefreshControl,
  Modal,
} from "react-native";
import { SimpleSlider } from "../../components/ui/CustomSlider";
import { GlassCard } from "../../components/ui/GlassCard";
import { InfoCard } from "../../components/ui/InfoCard";
import DefaultColors, { gradients, Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuth";
import { SymptomLogService } from "../../services/SymptomLogService";
import { SymptomLog, ConditionUpdate } from "../../types/symptomLogs";

// Symptom categories
const SYMPTOM_CATEGORIES = [
  {
    id: "pain",
    title: "Pain",
    icon: "bandage",
    color: "#EF4444",
    symptoms: [
      "Headache",
      "Back Pain",
      "Joint Pain",
      "Muscle Pain",
      "Chest Pain",
    ],
  },
  {
    id: "respiratory",
    title: "Respiratory",
    icon: "fitness",
    color: "#06B6D4",
    symptoms: [
      "Cough",
      "Shortness of Breath",
      "Sore Throat",
      "Congestion",
      "Wheezing",
    ],
  },
  {
    id: "digestive",
    title: "Digestive",
    icon: "nutrition",
    color: "#10B981",
    symptoms: [
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Constipation",
      "Stomach Pain",
    ],
  },
  {
    id: "mental",
    title: "Mental Health",
    icon: "happy",
    color: "#8B5CF6",
    symptoms: [
      "Anxiety",
      "Depression",
      "Stress",
      "Mood Swings",
      "Sleep Issues",
    ],
  },
  {
    id: "neurological",
    title: "Neurological",
    icon: "flash",
    color: "#F59E0B",
    symptoms: ["Dizziness", "Fatigue", "Memory Issues", "Numbness", "Tingling"],
  },
  {
    id: "skin",
    title: "Skin",
    icon: "eye",
    color: "#EC4899",
    symptoms: ["Rash", "Itching", "Dryness", "Swelling", "Bruising"],
  },
];

// Common triggers for quick selection
const COMMON_TRIGGERS = [
  "Stress",
  "Weather",
  "Exercise",
  "Food",
  "Sleep",
  "Medication",
  "Hormones",
  "Work",
  "Travel",
  "Allergies",
  "Alcohol",
  "Caffeine",
];

// Common locations for body parts
const BODY_LOCATIONS = [
  "Head",
  "Neck",
  "Chest",
  "Back",
  "Abdomen",
  "Arms",
  "Legs",
  "Joints",
  "Muscles",
  "Eyes",
  "Throat",
  "Skin",
  "General",
];

// Duration options in minutes
const DURATION_OPTIONS = [
  { label: "< 15 min", value: 10 },
  { label: "15-30 min", value: 22 },
  { label: "30-60 min", value: 45 },
  { label: "1-2 hours", value: 90 },
  { label: "2-4 hours", value: 180 },
  { label: "4+ hours", value: 300 },
  { label: "All day", value: 1440 },
];

// Recent symptoms for quick logging - now loaded from database
const DEFAULT_RECENT_SYMPTOMS = [
  "Headache",
  "Fatigue",
  "Nausea",
  "Back Pain",
  "Anxiety",
  "Cough",
];

export default function LogSymptomsScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "light"] || Colors;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">(
    "Mild"
  );
  const [painScale, setPainScale] = useState<number>(1);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  const [location, setLocation] = useState<string>("");
  const [duration, setDuration] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [recentSymptoms, setRecentSymptoms] = useState<string[]>(
    DEFAULT_RECENT_SYMPTOMS
  );
  const [ongoingConditions, setOngoingConditions] = useState<ConditionUpdate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showTriggersModal, setShowTriggersModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load user data when component mounts
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Load recent symptoms and ongoing conditions in parallel
      const [recentSymptomsData, conditionsData] = await Promise.all([
        SymptomLogService.getRecentSymptoms(user.id),
        SymptomLogService.getUserConditions(user.id),
      ]);

      // Use recent symptoms from database, fallback to defaults if empty
      setRecentSymptoms(
        recentSymptomsData.length > 0
          ? recentSymptomsData
          : DEFAULT_RECENT_SYMPTOMS
      );
      setOngoingConditions(conditionsData);
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert(
        "Error",
        "Failed to load your symptom history. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, [user?.id]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = () => {
    if (
      customSymptom.trim() &&
      !selectedSymptoms.includes(customSymptom.trim())
    ) {
      setSelectedSymptoms((prev) => [...prev, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const handleTriggerToggle = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleAddCustomTrigger = () => {
    if (
      customTrigger.trim() &&
      !selectedTriggers.includes(customTrigger.trim())
    ) {
      setSelectedTriggers((prev) => [...prev, customTrigger.trim()]);
      setCustomTrigger("");
    }
  };

  const getPainScaleColor = (scale: number) => {
    if (scale <= 3) return "#10B981"; // Green for mild
    if (scale <= 6) return "#F59E0B"; // Yellow for moderate
    return "#EF4444"; // Red for severe
  };

  const getPainScaleLabel = (scale: number) => {
    if (scale <= 3) return "Mild";
    if (scale <= 6) return "Moderate";
    return "Severe";
  };

  const getDurationLabel = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    const option = DURATION_OPTIONS.find((opt) => opt.value === minutes);
    return option ? option.label : `${minutes} minutes`;
  };

  const handleLogSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert(
        "No Symptoms",
        "Please select or add at least one symptom to log."
      );
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "Please log in to save your symptoms.");
      return;
    }

    try {
      setIsLoading(true);

      const symptomLog = await SymptomLogService.createSymptomLog(user.id, {
        symptoms: selectedSymptoms,
        severity,
        pain_scale: painScale,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
        location: location.trim() || undefined,
        duration_minutes: duration || undefined,
        notes: notes.trim() || undefined,
      });

      if (symptomLog) {
        Alert.alert(
          "Symptoms Logged Successfully! ✅",
          `Logged ${
            selectedSymptoms.length
          } symptom(s) with ${severity.toLowerCase()} severity at ${SymptomLogService.formatLogDate(
            symptomLog.created_at
          )}.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setSelectedSymptoms([]);
                setSeverity("Mild");
                setPainScale(1);
                setSelectedTriggers([]);
                setLocation("");
                setDuration(null);
                setNotes("");
                // Navigate back or reload data
                router.back();
              },
            },
          ]
        );

        // Reload recent symptoms to reflect the new data
        await loadUserData();
      } else {
        Alert.alert("Error", "Failed to save your symptoms. Please try again.");
      }
    } catch (error) {
      console.error("Error logging symptoms:", error);
      Alert.alert(
        "Error",
        "Failed to save your symptoms. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConditionUpdate = async (conditionName: string) => {
    if (!user?.id) {
      Alert.alert("Error", "Please log in to update your conditions.");
      return;
    }

    // For now, show an alert with options. In a full implementation,
    // you'd navigate to a condition update screen
    Alert.alert(
      `Update ${conditionName}`,
      "How would you like to update this condition?",
      [
        {
          text: "Log as Symptom",
          onPress: () => {
            if (!selectedSymptoms.includes(conditionName)) {
              setSelectedSymptoms((prev) => [...prev, conditionName]);
            }
          },
        },
        {
          text: "Update Status",
          onPress: () => {
            // This would navigate to a condition update screen
            Alert.alert(
              "Coming Soon",
              "Condition status updates will be available in the next update!"
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={gradients.premium}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.greetingContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={[styles.greeting, { color: "white" }]}>
                Log Symptoms 📝
              </Text>
              <Text
                style={[styles.subtitle, { color: "rgba(255,255,255,0.8)" }]}
              >
                Track your health and symptoms
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Log Recent Symptoms */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Quick Log
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}
            >
              Recently logged symptoms
            </Text>
            <View style={styles.quickSymptoms}>
              {recentSymptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.symptomChip,
                    {
                      backgroundColor: selectedSymptoms.includes(symptom)
                        ? colors.primary + "20"
                        : colors.surfaceVariant,
                      borderColor: selectedSymptoms.includes(symptom)
                        ? colors.primary
                        : "transparent",
                    },
                  ]}
                  onPress={() => handleSymptomToggle(symptom)}
                >
                  <Text
                    style={[
                      styles.symptomChipText,
                      {
                        color: selectedSymptoms.includes(symptom)
                          ? colors.primary
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {symptom}
                  </Text>
                  {selectedSymptoms.includes(symptom) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Symptom Categories */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Symptom Categories
            </Text>
            <View style={styles.categoriesGrid}>
              {SYMPTOM_CATEGORIES.map((category, index) => (
                <View key={category.id} style={styles.categoryRow}>
                  {index % 2 === 0 ? (
                    <View style={styles.cardRow}>
                      <InfoCard
                        icon={category.icon}
                        label={category.title}
                        value={category.symptoms.length.toString()}
                        unit="symptoms"
                        gradient={[category.color, category.color + "80"]}
                        onPress={() => {
                          // Show symptoms list for this category
                          Alert.alert(
                            category.title,
                            `Available symptoms:\n${category.symptoms.join(
                              ", "
                            )}`
                          );
                        }}
                      />
                      {SYMPTOM_CATEGORIES[index + 1] && (
                        <InfoCard
                          icon={SYMPTOM_CATEGORIES[index + 1].icon}
                          label={SYMPTOM_CATEGORIES[index + 1].title}
                          value={SYMPTOM_CATEGORIES[
                            index + 1
                          ].symptoms.length.toString()}
                          unit="symptoms"
                          gradient={[
                            SYMPTOM_CATEGORIES[index + 1].color,
                            SYMPTOM_CATEGORIES[index + 1].color + "80",
                          ]}
                          onPress={() => {
                            Alert.alert(
                              SYMPTOM_CATEGORIES[index + 1].title,
                              `Available symptoms:\n${SYMPTOM_CATEGORIES[
                                index + 1
                              ].symptoms.join(", ")}`
                            );
                          }}
                        />
                      )}
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Add Custom Symptom */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Add Custom Symptom
            </Text>
            <View style={styles.customSymptomContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderColor: colors.outline,
                  },
                ]}
                placeholder="Enter symptom name..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={customSymptom}
                onChangeText={setCustomSymptom}
                onSubmitEditing={handleAddCustomSymptom}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCustomSymptom}
                disabled={!customSymptom.trim()}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* Severity Selection */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Severity Level
            </Text>
            <View style={styles.severityContainer}>
              {(["Mild", "Moderate", "Severe"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityButton,
                    {
                      backgroundColor:
                        severity === level
                          ? colors.primary + "20"
                          : colors.surfaceVariant,
                      borderColor:
                        severity === level ? colors.primary : "transparent",
                    },
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text
                    style={[
                      styles.severityText,
                      {
                        color:
                          severity === level
                            ? colors.primary
                            : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Pain Scale */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Pain Scale (1-10)
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}
            >
              Rate your pain level from 1 (minimal) to 10 (severe)
            </Text>
            <View style={styles.painScaleContainer}>
              <View style={styles.painScaleHeader}>
                <Text
                  style={[
                    styles.painScaleValue,
                    { color: getPainScaleColor(painScale) },
                  ]}
                >
                  {painScale}
                </Text>
                <Text
                  style={[
                    styles.painScaleLabel,
                    { color: getPainScaleColor(painScale) },
                  ]}
                >
                  {getPainScaleLabel(painScale)}
                </Text>
              </View>
              <SimpleSlider
                min={1}
                max={10}
                value={painScale}
                step={1}
                onValueChange={setPainScale}
                trackColor={colors.surfaceVariant}
                thumbColor={getPainScaleColor(painScale)}
                width={280}
                height={40}
              />
              <View style={styles.painScaleLabels}>
                <Text
                  style={[
                    styles.scaleEndLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  1 - No Pain
                </Text>
                <Text
                  style={[
                    styles.scaleEndLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  10 - Worst Pain
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Triggers */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Possible Triggers
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}
            >
              What might have caused or worsened your symptoms?
            </Text>

            {selectedTriggers.length > 0 && (
              <View style={styles.selectedTriggersContainer}>
                <Text
                  style={[styles.selectedTriggersLabel, { color: colors.text }]}
                >
                  Selected ({selectedTriggers.length}):
                </Text>
                <View style={styles.selectedTriggers}>
                  {selectedTriggers.map((trigger) => (
                    <View
                      key={trigger}
                      style={[
                        styles.selectedTriggerChip,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectedTriggerText,
                          { color: colors.primary },
                        ]}
                      >
                        {trigger}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleTriggerToggle(trigger)}
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
                { backgroundColor: colors.surfaceVariant },
              ]}
              onPress={() => setShowTriggersModal(true)}
            >
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={[styles.selectButtonText, { color: colors.text }]}>
                Select Triggers
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Location */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Location
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}
            >
              Where on your body are you experiencing symptoms?
            </Text>

            <View style={styles.locationContainer}>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  { backgroundColor: colors.surfaceVariant },
                ]}
                onPress={() => setShowLocationModal(true)}
              >
                <Ionicons name="body" size={20} color={colors.primary} />
                <Text style={[styles.selectButtonText, { color: colors.text }]}>
                  {location || "Select Location"}
                </Text>
              </TouchableOpacity>

              {location && (
                <View
                  style={[
                    styles.selectedLocationChip,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectedLocationText,
                      { color: colors.primary },
                    ]}
                  >
                    {location}
                  </Text>
                  <TouchableOpacity onPress={() => setLocation("")}>
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </GlassCard>

        {/* Duration */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Duration
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}
            >
              How long have you been experiencing these symptoms?
            </Text>

            <TouchableOpacity
              style={[
                styles.selectButton,
                { backgroundColor: colors.surfaceVariant },
              ]}
              onPress={() => setShowDurationModal(true)}
            >
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={[styles.selectButtonText, { color: colors.text }]}>
                {getDurationLabel(duration)}
              </Text>
            </TouchableOpacity>

            {duration && (
              <View
                style={[
                  styles.selectedDurationChip,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.selectedDurationText,
                    { color: colors.primary },
                  ]}
                >
                  Duration: {getDurationLabel(duration)}
                </Text>
                <TouchableOpacity onPress={() => setDuration(null)}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Ongoing Conditions */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Ongoing Conditions
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}
            >
              Update your existing conditions
            </Text>
            {ongoingConditions.length > 0 ? (
              ongoingConditions.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  style={[
                    styles.conditionCard,
                    { backgroundColor: colors.surfaceVariant },
                  ]}
                  onPress={() =>
                    handleConditionUpdate(condition.condition_name)
                  }
                >
                  <View style={styles.conditionInfo}>
                    <View
                      style={[
                        styles.conditionDot,
                        {
                          backgroundColor:
                            condition.severity === "Mild"
                              ? "#10B981"
                              : condition.severity === "Moderate"
                              ? "#F59E0B"
                              : "#EF4444",
                        },
                      ]}
                    />
                    <View style={styles.conditionText}>
                      <Text
                        style={[styles.conditionName, { color: colors.text }]}
                      >
                        {condition.condition_name}
                      </Text>
                      <Text
                        style={[
                          styles.conditionDetails,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {condition.severity} • Last updated{" "}
                        {SymptomLogService.formatLogDate(condition.updated_at)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="medical"
                  size={32}
                  color={colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  No ongoing conditions recorded yet
                </Text>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Notes */}
        <GlassCard animated={true}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Additional Notes
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.text,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="Add any additional details about your symptoms..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </GlassCard>

        {/* Selected Symptoms Summary */}
        {selectedSymptoms.length > 0 && (
          <GlassCard animated={true}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Selected Symptoms ({selectedSymptoms.length})
              </Text>
              <View style={styles.selectedSymptoms}>
                {selectedSymptoms.map((symptom) => (
                  <View
                    key={symptom}
                    style={[
                      styles.selectedSymptomChip,
                      { backgroundColor: colors.primary + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectedSymptomText,
                        { color: colors.primary },
                      ]}
                    >
                      {symptom}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleSymptomToggle(symptom)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>
        )}

        {/* Log Button */}
        <TouchableOpacity
          style={[
            styles.logButton,
            {
              backgroundColor:
                selectedSymptoms.length > 0
                  ? colors.primary
                  : colors.surfaceVariant,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleLogSymptoms}
          disabled={selectedSymptoms.length === 0 || isLoading}
        >
          <Text
            style={[
              styles.logButtonText,
              {
                color:
                  selectedSymptoms.length > 0
                    ? "white"
                    : colors.onSurfaceVariant,
              },
            ]}
          >
            {isLoading
              ? "Saving..."
              : `Log ${selectedSymptoms.length} Symptom${
                  selectedSymptoms.length !== 1 ? "s" : ""
                }`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Triggers Modal */}
      <Modal
        visible={showTriggersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTriggersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Triggers
              </Text>
              <TouchableOpacity
                onPress={() => setShowTriggersModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.triggersGrid}>
                {COMMON_TRIGGERS.map((trigger) => (
                  <TouchableOpacity
                    key={trigger}
                    style={[
                      styles.triggerOption,
                      {
                        backgroundColor: selectedTriggers.includes(trigger)
                          ? colors.primary + "20"
                          : colors.surfaceVariant,
                        borderColor: selectedTriggers.includes(trigger)
                          ? colors.primary
                          : "transparent",
                      },
                    ]}
                    onPress={() => handleTriggerToggle(trigger)}
                  >
                    <Text
                      style={[
                        styles.triggerOptionText,
                        {
                          color: selectedTriggers.includes(trigger)
                            ? colors.primary
                            : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {trigger}
                    </Text>
                    {selectedTriggers.includes(trigger) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.customTriggerContainer}>
                <Text
                  style={[styles.customTriggerLabel, { color: colors.text }]}
                >
                  Add Custom Trigger
                </Text>
                <View style={styles.customTriggerInputContainer}>
                  <TextInput
                    style={[
                      styles.customTriggerInput,
                      {
                        backgroundColor: colors.surfaceVariant,
                        color: colors.text,
                        borderColor: colors.outline,
                      },
                    ]}
                    placeholder="Enter custom trigger..."
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={customTrigger}
                    onChangeText={setCustomTrigger}
                    onSubmitEditing={handleAddCustomTrigger}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addTriggerButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleAddCustomTrigger}
                    disabled={!customTrigger.trim()}
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
              onPress={() => setShowTriggersModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>
                Done ({selectedTriggers.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Location
              </Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.locationsGrid}>
                {BODY_LOCATIONS.map((bodyLocation) => (
                  <TouchableOpacity
                    key={bodyLocation}
                    style={[
                      styles.locationOption,
                      {
                        backgroundColor:
                          location === bodyLocation
                            ? colors.primary + "20"
                            : colors.surfaceVariant,
                        borderColor:
                          location === bodyLocation
                            ? colors.primary
                            : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setLocation(bodyLocation);
                      setShowLocationModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.locationOptionText,
                        {
                          color:
                            location === bodyLocation
                              ? colors.primary
                              : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {bodyLocation}
                    </Text>
                    {location === bodyLocation && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Duration Modal */}
      <Modal
        visible={showDurationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Duration
              </Text>
              <TouchableOpacity
                onPress={() => setShowDurationModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.durationOptions}>
                {DURATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.durationOption,
                      {
                        backgroundColor:
                          duration === option.value
                            ? colors.primary + "20"
                            : colors.surfaceVariant,
                        borderColor:
                          duration === option.value
                            ? colors.primary
                            : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setDuration(option.value);
                      setShowDurationModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.durationOptionText,
                        {
                          color:
                            duration === option.value
                              ? colors.primary
                              : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {duration === option.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    alignItems: "center",
    gap: 16,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    padding: 18,
    gap: 24,
  },
  cardContent: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  quickSymptoms: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  symptomChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryRow: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  customSymptomContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  severityContainer: {
    flexDirection: "row",
    gap: 12,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  severityText: {
    fontSize: 16,
    fontWeight: "600",
  },
  conditionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  conditionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  conditionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  conditionText: {
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  conditionDetails: {
    fontSize: 14,
  },
  notesInput: {
    height: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  selectedSymptoms: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedSymptomChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  selectedSymptomText: {
    fontSize: 14,
    fontWeight: "500",
  },
  logButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  // Pain Scale Styles
  painScaleContainer: {
    gap: 16,
  },
  painScaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  painScaleValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  painScaleLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  painScaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scaleEndLabel: {
    fontSize: 12,
  },
  // Button Styles
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Triggers Styles
  selectedTriggersContainer: {
    marginBottom: 16,
  },
  selectedTriggersLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  selectedTriggers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTriggerChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  selectedTriggerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Location Styles
  locationContainer: {
    gap: 12,
  },
  selectedLocationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    alignSelf: "flex-start",
  },
  selectedLocationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Duration Styles
  selectedDurationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  selectedDurationText: {
    fontSize: 14,
    fontWeight: "500",
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
  // Triggers Modal Styles
  triggersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  triggerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  triggerOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  customTriggerContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  customTriggerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  customTriggerInputContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  customTriggerInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  addTriggerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  // Location Modal Styles
  locationsGrid: {
    gap: 12,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Duration Modal Styles
  durationOptions: {
    gap: 12,
  },
  durationOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  durationOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
