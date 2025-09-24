import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { MODULES } from "../../constants/AppConfig";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function ModuleScreen() {
  const { moduleId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const module = MODULES[moduleId as keyof typeof MODULES];

  if (!module) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Module not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <GlassCard style={styles.headerCard}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.moduleIcon,
              { backgroundColor: module.color + "20" },
            ]}
          >
            <Ionicons
              name={module.icon as any}
              size={40}
              color={module.color}
            />
          </View>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>
            {module.name}
          </Text>
          <Text
            style={[styles.moduleSubtitle, { color: colors.onSurfaceVariant }]}
          >
            {module.subtitle}
          </Text>
        </View>
      </GlassCard>

      {/* Description */}
      <GlassCard style={styles.descriptionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About {module.name}
        </Text>
        <Text style={[styles.sectionText, { color: colors.onSurfaceVariant }]}>
          {module.description}
        </Text>
      </GlassCard>

      {/* Features */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Features
        </Text>
        <View style={styles.featuresContainer}>
          {module.features.map((feature, idx) => (
            <GlassCard key={idx} style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={module.color}
                  style={{ marginRight: 12 }}
                />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  {feature}
                </Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <GradientButton
          title={`Start ${module.name}`}
          onPress={() => router.push(`/modules/${module.id}`)}
          style={styles.primaryButton}
        />
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.outline }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Learn More
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 30 },
  headerCard: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 12,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerContent: { flex: 1, alignItems: "center" },
  moduleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  moduleTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  moduleSubtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  descriptionCard: {
    padding: 20,
    marginBottom: 8,
  },
  section: {
    paddingHorizontal: 8,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  featuresContainer: { gap: 12 },
  featureCard: { padding: 16, marginBottom: 6 },
  featureContent: { flexDirection: "row", alignItems: "center" },
  featureText: { fontSize: 16 },
  primaryButton: { marginBottom: 10 },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
});
