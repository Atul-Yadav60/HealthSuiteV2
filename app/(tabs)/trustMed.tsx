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
} from "react-native";
import { InfoCard } from "../../components/ui/InfoCard";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import { GlassCard } from "../../components/ui/GlassCard";
import { ThemedText } from "../../components/ThemedText";
import DefaultColors, { gradients, Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function TrustMedScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "light"] || Colors;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

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
      Alert.alert("Refreshed", "Latest TrustMed.AI features loaded!");
    }, 1500);
  }, []);

  const mainFeatures = [
    {
      id: "prescription",
      title: "Prescription Verification",
      icon: "document-text-outline",
      gradient: ["#6366F1", "#4F46E5"],
      description:
        "Scan and verify prescription authenticity with AI-powered OCR",
      value: "AI",
      unit: "Powered",
      route: "/(tabs)/prescriptionScanner",
    },
    {
      id: "authenticity",
      title: "Medicine Authenticity",
      icon: "shield-checkmark-outline",
      gradient: ["#10B981", "#059669"],
      description:
        "Verify medication authenticity and detect counterfeit drugs",
      value: "Secure",
      unit: "Verify",
      route: null, // Coming soon
    },
    {
      id: "interaction",
      title: "Drug Interactions",
      icon: "git-compare-outline",
      gradient: ["#F59E0B", "#D97706"],
      description: "Check for dangerous drug interactions and side effects",
      value: "Safety",
      unit: "Check",
      route: "/(tabs)/drugInteraction",
    },
  ];

  const quickActions = [
    {
      id: "scan-prescription",
      icon: "scan-outline",
      label: "Scan Rx",
      gradient: ["#6366F1", "#4F46E5"],
      onPress: () => router.push("/(tabs)/prescriptionScanner"),
    },
    {
      id: "verify-medicine",
      icon: "shield-outline",
      label: "Verify Med",
      gradient: ["#10B981", "#059669"],
      onPress: () =>
        Alert.alert("Coming Soon", "Medicine authenticity check coming soon!"),
    },
    {
      id: "check-interactions",
      icon: "warning-outline",
      label: "Check Safety",
      gradient: ["#F59E0B", "#D97706"],
      onPress: () => router.push("/(tabs)/drugInteraction"),
    },
  ];

  const securityStats = [
    {
      icon: "shield-checkmark-outline",
      label: "Verified",
      value: "99.8%",
      unit: "Accuracy",
      gradient: ["#10B981", "#059669"],
    },
    {
      icon: "document-text-outline",
      label: "Prescriptions",
      value: "50K+",
      unit: "Scanned",
      gradient: ["#6366F1", "#4F46E5"],
    },
    {
      icon: "warning-outline",
      label: "Interactions",
      value: "2.5K+",
      unit: "Prevented",
      gradient: ["#F59E0B", "#D97706"],
    },
    {
      icon: "medical-outline",
      label: "Medications",
      value: "10K+",
      unit: "Database",
      gradient: ["#8B5CF6", "#7C3AED"],
    },
  ];

  const handleFeaturePress = (feature: (typeof mainFeatures)[0]) => {
    if (feature.route) {
      router.push(feature.route as any);
    } else {
      Alert.alert(
        "Coming Soon",
        `${feature.title} will be available in the next update!`
      );
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
        colors={["#8A6CFF", "#6366F1"]} // Purple gradient for TrustMed branding
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
            <Text style={styles.greeting}>TrustMed.AI 🛡️</Text>
            <Text style={styles.subtitle}>
              Medicine verification & safety platform
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Security Stats Cards */}
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
            icon="shield-checkmark-outline"
            label="Accuracy"
            value="99.8%"
            unit="Verified"
            gradient={["#10B981", "#059669"]}
          />
          <InfoCard
            icon="document-text-outline"
            label="Scanned"
            value="50K+"
            unit="Prescriptions"
            gradient={["#6366F1", "#4F46E5"]}
          />
        </View>
        <View style={styles.cardRow}>
          <InfoCard
            icon="warning-outline"
            label="Safety"
            value="2.5K+"
            unit="Prevented"
            gradient={["#F59E0B", "#D97706"]}
          />
          <InfoCard
            icon="medical-outline"
            label="Database"
            value="10K+"
            unit="Medications"
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

      {/* Main Features */}
      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Core Features
        </Text>
        <View style={styles.featuresContainer}>
          {mainFeatures.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureContent}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name={feature.icon as any}
                      size={32}
                      color="white"
                    />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                  <View style={styles.featureAction}>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Trust & Security */}
      <Animated.View
        style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Trust & Security
        </Text>
        <GlassCard animated={true}>
          <View style={styles.trustContent}>
            <View style={styles.trustHeader}>
              <Ionicons
                name="shield-checkmark"
                size={40}
                color={colors.primary}
              />
              <Text style={[styles.trustTitle, { color: colors.text }]}>
                Medical Grade Security
              </Text>
            </View>
            <View style={styles.trustFeatures}>
              <View style={styles.trustFeature}>
                <Ionicons name="lock-closed" size={20} color={colors.primary} />
                <Text style={[styles.trustFeatureText, { color: colors.text }]}>
                  End-to-end encryption
                </Text>
              </View>
              <View style={styles.trustFeature}>
                <Ionicons name="medical" size={20} color={colors.primary} />
                <Text style={[styles.trustFeatureText, { color: colors.text }]}>
                  FDA compliant verification
                </Text>
              </View>
              <View style={styles.trustFeature}>
                <Ionicons name="eye-off" size={20} color={colors.primary} />
                <Text style={[styles.trustFeatureText, { color: colors.text }]}>
                  No data stored locally
                </Text>
              </View>
              <View style={styles.trustFeature}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.trustFeatureText, { color: colors.text }]}>
                  Real-time verification
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

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
              TrustMed.AI is a verification tool for informational purposes
              only. Always consult healthcare professionals for medical
              decisions and never ignore professional medical advice.
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
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
  },
  featureGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  featureContent: {
    flex: 1,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
    flex: 1,
  },
  featureAction: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  trustContent: {
    padding: 4,
  },
  trustHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  trustFeatures: {
    gap: 12,
  },
  trustFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trustFeatureText: {
    fontSize: 14,
    lineHeight: 20,
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
