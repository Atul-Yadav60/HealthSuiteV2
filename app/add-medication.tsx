import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

import { GradientButton } from "@/components/ui/GradientButton";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function AddMedicationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const { session } = useAuth();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [times, setTimes] = useState<string[]>(["08:00"]); // Default to one time
  const [loading, setLoading] = useState(false);

  const handleSaveMedication = async () => {
    if (!name || times.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please enter the medication name and at least one time."
      );
      return;
    }
    if (!session?.user) {
      Alert.alert(
        "Not Authenticated",
        "You must be logged in to add medication."
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("medications").insert({
        user_id: session.user.id,
        name: name.trim(),
        dosage: dosage.trim(),
        schedule: { type: "daily", times: times },
      });

      if (error) throw error;

      Alert.alert("Success", "Medication added to your planner.");
      router.back(); // Close the modal on success
    } catch (error) {
      console.error("Error saving medication:", error);
      Alert.alert("Error", "Failed to save medication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addTimeToSchedule = () => {
    // In a real app, you would use a time picker here.
    // For simplicity, we'll add a default time.
    setTimes([...times, "20:00"]);
  };

  const removeTimeFromSchedule = (indexToRemove: number) => {
    setTimes(times.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Add Medication
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons
            name="close-circle"
            size={30}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>
          Medication Name
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
          placeholder="e.g., Vitamin D, Metformin"
          placeholderTextColor={colors.onSurfaceVariant}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Dosage (Optional)
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
          placeholder="e.g., 500mg, 1 tablet"
          placeholderTextColor={colors.onSurfaceVariant}
          value={dosage}
          onChangeText={setDosage}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Reminder Times
        </Text>
        {times.map((time, index) => (
          <View key={index} style={styles.timeRow}>
            <Ionicons name="alarm-outline" size={24} color={colors.primary} />
            <Text style={[styles.timeText, { color: colors.text }]}>
              {time}
            </Text>
            <TouchableOpacity onPress={() => removeTimeFromSchedule(index)}>
              <Ionicons
                name="remove-circle-outline"
                size={24}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addTimeButton}
          onPress={addTimeToSchedule}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.addTimeText, { color: colors.primary }]}>
            Add another time
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <GradientButton
          title="Save Medication"
          onPress={handleSaveMedication}
          loading={loading}
          icon="save-outline"
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  timeText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 16,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#999",
    marginTop: 8,
  },
  addTimeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
});
