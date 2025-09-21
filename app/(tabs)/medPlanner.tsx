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

import { GradientButton } from "@/components/ui/GradientButton";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function MedPlannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // This will hold the user's medications in a future step
  const [medications, setMedications] = React.useState([]);

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
          Medication Planner
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {medications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="medkit-outline"
              size={80}
              color={colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No Medications Scheduled
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Tap 'Add Medication' to get started and never miss a dose.
            </Text>
          </View>
        ) : (
          <View>
            {/* We will render the list of medications here in a later step */}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.outline }]}>
        <GradientButton
          title="Add Medication"
          onPress={() => {
            // This now navigates to the modal screen we just created
            router.push("/add-medication");
          }}
          icon="add-circle-outline"
        />
      </View>
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
    flexGrow: 1,
    padding: 24,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80, // Offset for the footer button
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 24,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40, // Add extra padding for home bar
    borderTopWidth: 1,
  },
});
