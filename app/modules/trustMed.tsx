import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MODULES } from "@/constants/AppConfig";

// Feature card for TrustMed module
const FeatureCard = ({ icon, title, description, onPress, colors }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <GlassCard style={styles.featureCard}>
      <Ionicons name={icon} size={32} color={colors.primary} />
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text
        style={[styles.featureDescription, { color: colors.onSurfaceVariant }]}
      >
        {description}
      </Text>
    </GlassCard>
  </TouchableOpacity>
);

export default function TrustMedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const moduleInfo = MODULES.trustMed;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlassCard style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {moduleInfo.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {moduleInfo.subtitle}
        </Text>
      </GlassCard>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FeatureCard
          icon="document-text-outline"
          title="Prescription Verification"
          description="Use your camera to scan and digitize a printed prescription."
          onPress={() => router.push("/(tabs)/prescriptionScanner")}
          colors={colors}
        />
        <FeatureCard
          icon="shield-checkmark-outline"
          title="Medicine Authenticity"
          description="Verify the authenticity of medication by scanning its packaging."
          onPress={() => alert("Feature coming soon!")}
          colors={colors}
        />
        <FeatureCard
          icon="git-compare-outline"
          title="Drug Interaction"
          description="Check for potential interactions between two or more drugs."
          onPress={() => router.push("/(tabs)/drugInteraction")}
          colors={colors}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 32,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16,
  },
  backButton: { padding: 8 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginLeft: 10,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  featureCard: {
    padding: 24,
    alignItems: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    opacity: 0.9,
  },
});
