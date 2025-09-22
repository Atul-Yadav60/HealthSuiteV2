import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { checkDrugInteraction } from "@/services/api";

export default function DrugInteractionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCheckInteraction = async () => {
    if (!query.trim()) {
      Alert.alert("Error", "Please enter a question about drug interactions.");
      return;
    }

    setLoading(true);
    setResults(null);
    try {
      const data = await checkDrugInteraction(query);
      setResults(data);
    } catch (error: any) {
      console.error("Drug interaction error:", error);
      Alert.alert(
        "Error",
        error.message || "Could not check interaction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
          Drug Interaction
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          Enter two or more drug names to check for potential interactions. For
          example, "Does Aspirin interact with Warfarin?"
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
          placeholder="Type your question here..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={query}
          onChangeText={setQuery}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleCheckInteraction}
          disabled={loading}
        >
          <View style={styles.buttonContent}>
            {loading && (
              <ActivityIndicator
                color="#FFFFFF"
                size="small"
                style={styles.buttonLoader}
              />
            )}
            <Ionicons
              name="search-outline"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {loading ? "Checking..." : "Check Interaction"}
            </Text>
          </View>
        </TouchableOpacity>

        {results && (
          <View
            style={[
              styles.resultsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outline,
              },
            ]}
          >
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              Results
            </Text>

            {results.detected_drugs && results.detected_drugs.length > 0 && (
              <Text
                style={[
                  styles.resultsSubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Detected Drugs: {results.detected_drugs.join(", ")}
              </Text>
            )}

            {results.interactions && results.interactions.length > 0 ? (
              results.interactions.map((interaction: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.interactionItem,
                    { borderTopColor: colors.outline },
                  ]}
                >
                  <Text
                    style={[styles.interactionPair, { color: colors.text }]}
                  >
                    {interaction.DrugName_A} & {interaction.DrugName_B}
                  </Text>
                  {interaction.message ? (
                    <Text
                      style={[
                        styles.interactionDetails,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {interaction.message}
                    </Text>
                  ) : (
                    <>
                      {interaction.Interaction_Level && (
                        <Text
                          style={[
                            styles.interactionLevel,
                            {
                              color:
                                interaction.Interaction_Level.toLowerCase() ===
                                "major"
                                  ? colors.error
                                  : colors.warning,
                            },
                          ]}
                        >
                          Level: {interaction.Interaction_Level}
                        </Text>
                      )}
                      {interaction.Interaction_Details && (
                        <Text
                          style={[
                            styles.interactionDetails,
                            { color: colors.onSurfaceVariant },
                          ]}
                        >
                          {interaction.Interaction_Details}
                        </Text>
                      )}
                    </>
                  )}
                </View>
              ))
            ) : (
              <Text
                style={[styles.noResults, { color: colors.onSurfaceVariant }]}
              >
                No interactions found. This could mean the drugs are safe to use
                together, but always consult a healthcare professional.
              </Text>
            )}
          </View>
        )}
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
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonLoader: {
    marginRight: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: "italic",
  },
  interactionItem: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  interactionPair: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 8,
  },
  interactionLevel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  interactionDetails: {
    fontSize: 14,
    lineHeight: 20,
  },
  noResults: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 10,
  },
});
