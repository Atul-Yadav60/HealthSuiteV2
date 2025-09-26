import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import DefaultColors, { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { checkDrugInteraction } from "@/services/api";

export default function DrugInteractionScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCheckInteraction = async () => {
    setLoading(true);
    setResults(null);
    try {
      const data = await checkDrugInteraction(query);
      setResults(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not check interaction.");
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.headerTitle}>Drug Interactions</Text>
            <Text style={styles.headerSubtitle}>
              Check potential drug interactions
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Info Banner */}
          <GlassCard style={styles.infoBanner}>
            <View style={styles.bannerContent}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.primary}
                style={styles.bannerIcon}
              />
              <Text
                style={[styles.bannerText, { color: colors.onSurfaceVariant }]}
              >
                Enter two or more drug names to check for potential interactions
                and safety information.
              </Text>
            </View>
          </GlassCard>

          {/* Input Section */}
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Drug Query
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
              placeholder="e.g., aspirin and warfarin, or describe your medications..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={query}
              onChangeText={setQuery}
              multiline
            />
            <GradientButton
              title="Check Interactions"
              onPress={handleCheckInteraction}
              loading={loading}
              icon="search-outline"
              style={styles.checkButton}
            />
          </GlassCard>

          {/* Results Section */}
          {results && (
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Analysis Results
              </Text>

              {results.detected_drugs && results.detected_drugs.length > 0 && (
                <View style={styles.detectedDrugs}>
                  <Text
                    style={[styles.subsectionTitle, { color: colors.text }]}
                  >
                    Detected Medications
                  </Text>
                  <View style={styles.drugTags}>
                    {results.detected_drugs.map(
                      (drug: string, index: number) => (
                        <View
                          key={index}
                          style={[
                            styles.drugTag,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.drugTagText,
                              { color: colors.primary },
                            ]}
                          >
                            {drug}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              )}

              {results.interactions && results.interactions.length > 0 ? (
                <View style={styles.interactionsSection}>
                  <Text
                    style={[styles.subsectionTitle, { color: colors.text }]}
                  >
                    Potential Interactions
                  </Text>
                  {results.interactions.map(
                    (interaction: any, index: number) => (
                      <View key={index} style={styles.interactionCard}>
                        <View style={styles.interactionHeader}>
                          <Text
                            style={[styles.drugPair, { color: colors.text }]}
                          >
                            {interaction.DrugName_A} ↔ {interaction.DrugName_B}
                          </Text>
                          {interaction.Interaction_Level && (
                            <View
                              style={[
                                styles.levelBadge,
                                {
                                  backgroundColor:
                                    interaction.Interaction_Level === "Major"
                                      ? colors.error + "20"
                                      : "#FFA500" + "20",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.levelText,
                                  {
                                    color:
                                      interaction.Interaction_Level === "Major"
                                        ? colors.error
                                        : "#FFA500",
                                  },
                                ]}
                              >
                                {interaction.Interaction_Level}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.interactionDescription,
                            { color: colors.onSurfaceVariant },
                          ]}
                        >
                          {interaction.message ||
                            interaction.Interaction_Details}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              ) : (
                <View style={styles.noInteractions}>
                  <Ionicons
                    name="checkmark-circle"
                    size={32}
                    color={colors.success || "#10B981"}
                    style={styles.successIcon}
                  />
                  <Text
                    style={[styles.noInteractionsText, { color: colors.text }]}
                  >
                    No significant interactions detected
                  </Text>
                  <Text
                    style={[
                      styles.noInteractionsSubtext,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Always consult your healthcare provider before combining
                    medications.
                  </Text>
                </View>
              )}
            </GlassCard>
          )}
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
    gap: 20,
  },
  infoBanner: {
    backgroundColor: "rgba(32, 102, 193, 0.05)",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bannerIcon: {
    marginTop: 2,
  },
  bannerText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  checkButton: {
    marginTop: 4,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  detectedDrugs: {
    marginBottom: 20,
  },
  drugTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  drugTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  drugTagText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  interactionsSection: {
    gap: 12,
  },
  interactionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    marginBottom: 12,
  },
  interactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  drugPair: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textTransform: "capitalize",
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  interactionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  noInteractions: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 12,
  },
  noInteractionsText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  noInteractionsSubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
