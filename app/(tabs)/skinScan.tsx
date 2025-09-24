import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { InfoCard } from "../../components/ui/InfoCard";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function SkinScanScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const scanFeatures = [
    {
      id: "1",
      title: "AI Skin Analysis",
      icon: "scan" as const,
      color: "#4CAF50",
      description: "Advanced AI-powered skin condition analysis",
    },
    {
      id: "2",
      title: "Instant Results",
      icon: "flash" as const,
      color: "#FF9800",
      description: "Get immediate insights and recommendations",
    },
    {
      id: "3",
      title: "History Tracking",
      icon: "time" as const,
      color: "#2196F3",
      description: "Track changes and progress over time",
    },
    {
      id: "4",
      title: "Expert Guidance",
      icon: "medical" as const,
      color: "#9C27B0",
      description: "Professional recommendations and advice",
    },
  ];

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <LinearGradient colors={["#2066c1ff", "#1a5bb8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Skin AI Scanner</Text>
            <Text style={styles.headerSubtitle}>
              AI-powered skin analysis and guidance
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Coming Soon Banner */}
          <InfoCard style={styles.bannerCard}>
            <View style={styles.bannerContent}>
              <Ionicons
                name="construct"
                size={48}
                color={colors.primary}
                style={styles.bannerIcon}
              />
              <Text style={[styles.bannerTitle, { color: colors.text }]}>
                Coming Soon
              </Text>
              <Text
                style={[
                  styles.bannerDescription,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                We're developing advanced AI technology to help you analyze skin
                conditions using your device camera. Get ready for
                professional-grade skin analysis at your fingertips.
              </Text>
            </View>
          </InfoCard>

          {/* Features Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Upcoming Features
            </Text>
            <View style={styles.featuresGrid}>
              {scanFeatures.map((feature) => (
                <QuickActionButton
                  key={feature.id}
                  action={feature}
                  onPress={() => {}}
                  style={styles.featureButton}
                />
              ))}
            </View>
          </View>

          {/* How it Works */}
          <InfoCard>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              How It Will Work
            </Text>
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text
                  style={[styles.stepText, { color: colors.onSurfaceVariant }]}
                >
                  Capture a clear photo of the skin area
                </Text>
              </View>
              <View style={styles.step}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text
                  style={[styles.stepText, { color: colors.onSurfaceVariant }]}
                >
                  AI analyzes patterns and characteristics
                </Text>
              </View>
              <View style={styles.step}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text
                  style={[styles.stepText, { color: colors.onSurfaceVariant }]}
                >
                  Receive detailed analysis and recommendations
                </Text>
              </View>
            </View>
          </InfoCard>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
  backButton: {
    padding: 8,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 24,
  },
  bannerCard: {
    alignItems: "center",
  },
  bannerContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  bannerIcon: {
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  bannerDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  featureButton: {
    width: "47%",
    minWidth: 150,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  stepText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
});
