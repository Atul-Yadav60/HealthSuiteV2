import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  RefreshControl,
} from "react-native";
import { InfoCard } from "../../components/ui/InfoCard";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import { GlassCard } from "../../components/ui/GlassCard";
import DefaultColors, { gradients, Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function SkinScanScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Refresh state
  const [refreshing, setRefreshing] = React.useState(false);

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
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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
                Skin AI Scanner ✨
              </Text>
              <Text
                style={[styles.subtitle, { color: "rgba(255,255,255,0.8)" }]}
              >
                AI-powered skin analysis and guidance
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
      <View style={styles.content}>
        {/* Coming Soon Banner */}
        <GlassCard style={styles.bannerCard} animated={true}>
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
        </GlassCard>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Upcoming Features
          </Text>
          <View style={styles.cardRow}>
            <InfoCard
              icon="scan"
              label="AI Analysis"
              value="Smart"
              unit="Detection"
              gradient={["#4CAF50", "#45A049"]}
            />
            <InfoCard
              icon="flash"
              label="Instant"
              value="Real-time"
              unit="Results"
              gradient={["#FF9800", "#F57C00"]}
            />
          </View>
          <View style={styles.cardRow}>
            <InfoCard
              icon="time"
              label="History"
              value="Track"
              unit="Progress"
              gradient={["#2196F3", "#1976D2"]}
            />
            <InfoCard
              icon="medical"
              label="Expert"
              value="Pro"
              unit="Guidance"
              gradient={["#9C27B0", "#7B1FA2"]}
            />
          </View>
        </View>

        {/* How it Works */}
        <GlassCard animated={true}>
          <View style={styles.bannerContent}>
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
          </View>
        </GlassCard>
      </View>
    </ScrollView>
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
  featuresSection: {
    gap: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
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
