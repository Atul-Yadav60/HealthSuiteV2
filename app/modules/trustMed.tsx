import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { GlassCard } from "@/components/ui/GlassCard";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MODULES } from "@/constants/AppConfig";

// A reusable component for the feature cards on this screen
const FeatureCard = ({ icon, title, description, onPress, colors }: any) => (
  <TouchableOpacity onPress={onPress}>
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
      <View style={[styles.header, { borderBottomColor: colors.outline }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {moduleInfo.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FeatureCard
          icon="document-text-outline"
          title="Prescription Verification"
          description="Use your camera to scan and digitize a printed prescription."
          onPress={() => alert("Feature coming in the next step!")}
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
          onPress={() => router.push("../(tabs)/drugInteraction")}
          colors={colors}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 16,
  },
  scrollContent: {
    padding: 24,
    gap: 20,
  },
  featureCard: {
    padding: 24,
    alignItems: "center",
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
  },
});
