import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
  TextInput,
} from "react-native";
import { InfoCard } from "../../components/ui/InfoCard";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { ThemedText } from "../../components/ThemedText";
import DefaultColors, { gradients, Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function SymptoCareScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "light"] || Colors;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Refreshed", "Latest SymptoCare.AI features loaded!");
    }, 1500);
  }, []);

  const coreFeatures = [
    {
      id: "symptom-analysis",
      title: "Symptom Analysis",
      icon: "search-outline",
      gradient: ["#10B981", "#059669"],
      description: "AI-powered analysis of your symptoms with medical insights",
      value: "Smart",
      unit: "Analysis",
    },
    {
      id: "specialist-recommendation",
      title: "Specialist Recommendation",
      icon: "person-outline",
      gradient: ["#3B82F6", "#1D4ED8"],
      description: "Find the right medical specialist based on your symptoms",
      value: "Expert",
      unit: "Match",
    },
    {
      id: "urgency-assessment",
      title: "Urgency Assessment",
      icon: "alert-circle-outline",
      gradient: ["#F59E0B", "#D97706"],
      description: "Determine how quickly you need medical attention",
      value: "Priority",
      unit: "Level",
    },
  ];

  const quickActions = [
    {
      id: "analyze-symptoms",
      icon: "medical-outline",
      label: "Analyze",
      gradient: ["#10B981", "#059669"],
      onPress: () => handleAnalyzeSymptoms(),
    },
    {
      id: "find-specialist",
      icon: "people-outline",
      label: "Find Doctor",
      gradient: ["#3B82F6", "#1D4ED8"],
      onPress: () =>
        Alert.alert("Coming Soon", "Specialist finder will be available soon!"),
    },
    {
      id: "emergency-guide",
      icon: "warning-outline",
      label: "Emergency",
      gradient: ["#EF4444", "#DC2626"],
      onPress: () => handleEmergencyGuide(),
    },
  ];

  const commonSymptoms = [
    { id: 1, name: "Headache", icon: "head-outline", severity: "mild" },
    { id: 2, name: "Fever", icon: "thermometer-outline", severity: "moderate" },
    { id: 3, name: "Cough", icon: "medical-outline", severity: "mild" },
    { id: 4, name: "Chest Pain", icon: "heart-outline", severity: "severe" },
    {
      id: 5,
      name: "Shortness of Breath",
      icon: "fitness-outline",
      severity: "severe",
    },
    { id: 6, name: "Nausea", icon: "restaurant-outline", severity: "moderate" },
    { id: 7, name: "Dizziness", icon: "reload-outline", severity: "moderate" },
    { id: 8, name: "Fatigue", icon: "battery-dead-outline", severity: "mild" },
  ];

  const handleAnalyzeSymptoms = () => {
    if (!symptoms.trim()) {
      Alert.alert("Input Required", "Please describe your symptoms first.");
      return;
    }

    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      const mockResult = {
        symptoms: symptoms,
        possibleConditions: [
          { name: "Common Cold", probability: 65, urgency: "Low" },
          { name: "Viral Infection", probability: 45, urgency: "Low" },
          { name: "Allergic Reaction", probability: 30, urgency: "Moderate" },
        ],
        recommendedSpecialist: "General Practitioner",
        urgencyLevel: "Low",
        recommendations: [
          "Rest and stay hydrated",
          "Monitor symptoms for 24-48 hours",
          "Consider over-the-counter medication if needed",
          "Seek medical attention if symptoms worsen",
        ],
      };
      setAnalysisResult(mockResult);
      setAnalyzing(false);
    }, 3000);
  };

  const handleEmergencyGuide = () => {
    Alert.alert(
      "Emergency Situations",
      "Call emergency services (911) immediately if you experience:\n\n• Chest pain or pressure\n• Difficulty breathing\n• Severe bleeding\n• Loss of consciousness\n• Severe head injury\n• Signs of stroke\n• Severe allergic reaction",
      [
        { text: "Call 911", style: "destructive" },
        { text: "Understood", style: "default" },
      ]
    );
  };

  const handleSymptomSelect = (symptom: (typeof commonSymptoms)[0]) => {
    const currentSymptoms = symptoms
      ? symptoms + ", " + symptom.name.toLowerCase()
      : symptom.name.toLowerCase();
    setSymptoms(currentSymptoms);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "#10B981";
      case "moderate":
        return "#F59E0B";
      case "severe":
        return "#EF4444";
      default:
        return colors.primary;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
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
        colors={["#10B981", "#059669"]} // Green gradient for SymptoCare branding
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>SymptoCare.AI 🩺</Text>
            <Text style={styles.subtitle}>
              Intelligent symptom analysis & specialist matching
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Feature Stats Cards */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.cardRow}>
          <InfoCard
            icon="search-outline"
            label="Analysis"
            value="AI"
            unit="Powered"
            gradient={["#10B981", "#059669"]}
          />
          <InfoCard
            icon="people-outline"
            label="Specialists"
            value="1000+"
            unit="Available"
            gradient={["#3B82F6", "#1D4ED8"]}
          />
        </View>
        <View style={styles.cardRow}>
          <InfoCard
            icon="alert-circle-outline"
            label="Urgency"
            value="Real-time"
            unit="Assessment"
            gradient={["#F59E0B", "#D97706"]}
          />
          <InfoCard
            icon="medical-outline"
            label="Accuracy"
            value="95%"
            unit="Reliable"
            gradient={["#8B5CF6", "#7C3AED"]}
          />
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={action.gradient}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={action.icon as any} size={28} color="white" />
                <Text style={styles.quickActionText}>{action.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Symptom Input Section */}
      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Describe Your Symptoms
        </Text>
        <GlassCard>
          <TextInput
            style={[
              styles.symptomInput,
              {
                color: colors.text,
                borderColor: colors.outline,
              },
            ]}
            placeholder="Describe what you're feeling... (e.g., headache, fever, fatigue)"
            placeholderTextColor={colors.onSurfaceVariant}
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={4}
          />
          <GradientButton
            title="Analyze Symptoms"
            onPress={handleAnalyzeSymptoms}
            loading={analyzing}
            icon="search-outline"
            style={styles.analyzeButton}
          />
        </GlassCard>
      </Animated.View>

      {/* Common Symptoms */}
      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Common Symptoms
        </Text>
        <View style={styles.symptomsGrid}>
          {commonSymptoms.map((symptom) => (
            <TouchableOpacity
              key={symptom.id}
              style={[
                styles.symptomCard,
                { borderColor: getSeverityColor(symptom.severity) + "30" },
              ]}
              onPress={() => handleSymptomSelect(symptom)}
            >
              <Ionicons
                name={symptom.icon as any}
                size={24}
                color={getSeverityColor(symptom.severity)}
              />
              <Text style={[styles.symptomName, { color: colors.text }]}>
                {symptom.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Analysis Results */}
      {analysisResult && (
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Analysis Results
          </Text>
          <GlassCard>
            <View style={styles.resultHeader}>
              <Ionicons name="medical" size={32} color={colors.primary} />
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                AI Analysis Complete
              </Text>
            </View>

            <View style={styles.resultSection}>
              <Text style={[styles.resultSubtitle, { color: colors.text }]}>
                Possible Conditions
              </Text>
              {analysisResult.possibleConditions.map(
                (condition: any, index: number) => (
                  <View key={index} style={styles.conditionRow}>
                    <View style={styles.conditionInfo}>
                      <Text
                        style={[styles.conditionName, { color: colors.text }]}
                      >
                        {condition.name}
                      </Text>
                      <Text
                        style={[
                          styles.conditionUrgency,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        Urgency: {condition.urgency}
                      </Text>
                    </View>
                    <View style={styles.probabilityContainer}>
                      <Text
                        style={[
                          styles.probabilityText,
                          { color: colors.primary },
                        ]}
                      >
                        {condition.probability}%
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            <View style={styles.resultSection}>
              <Text style={[styles.resultSubtitle, { color: colors.text }]}>
                Recommended Specialist
              </Text>
              <View style={styles.specialistCard}>
                <Ionicons
                  name="person-circle"
                  size={40}
                  color={colors.primary}
                />
                <Text style={[styles.specialistName, { color: colors.text }]}>
                  {analysisResult.recommendedSpecialist}
                </Text>
              </View>
            </View>

            <View style={styles.resultSection}>
              <Text style={[styles.resultSubtitle, { color: colors.text }]}>
                Recommendations
              </Text>
              {analysisResult.recommendations.map(
                (rec: string, index: number) => (
                  <View key={index} style={styles.recommendationRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success || "#10B981"}
                    />
                    <Text
                      style={[
                        styles.recommendationText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {rec}
                    </Text>
                  </View>
                )
              )}
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Safety Notice */}
      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[styles.safetyNotice, { borderColor: colors.warning }]}>
          <Ionicons
            name="warning-outline"
            size={24}
            color={colors.warning}
            style={styles.safetyIcon}
          />
          <View style={styles.safetyContent}>
            <Text style={[styles.safetyTitle, { color: colors.warning }]}>
              Medical Disclaimer
            </Text>
            <Text
              style={[styles.safetyText, { color: colors.onSurfaceVariant }]}
            >
              SymptoCare.AI provides informational analysis only and should not
              replace professional medical diagnosis. Always consult qualified
              healthcare providers for medical concerns.
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  symptomInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  analyzeButton: {
    marginTop: 4,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  symptomCard: {
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  symptomName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resultSection: {
    marginBottom: 20,
  },
  resultSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  conditionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 15,
    fontWeight: "600",
  },
  conditionUrgency: {
    fontSize: 13,
    marginTop: 2,
  },
  probabilityContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  probabilityText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  specialistCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    gap: 12,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: "600",
  },
  recommendationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  safetyNotice: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
  },
  safetyIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
