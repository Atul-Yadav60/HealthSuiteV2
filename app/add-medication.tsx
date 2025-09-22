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
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { GradientButton } from "@/components/ui/GradientButton";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";
import { scheduleMedicationReminder } from "@/services/NotificationService";

export default function AddMedicationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [schedule, setSchedule] = useState<Date[]>([
    // Initialize with a future time (1 hour from now)
    new Date(Date.now() + 60 * 60 * 1000),
  ]);
  const [loading, setLoading] = useState(false);

  const [pickerState, setPickerState] = useState<{
    show: boolean;
    mode: "date" | "time";
    index: number;
  }>({ show: false, mode: "date", index: 0 });

  const handleSaveMedication = async () => {
    // Replace with your actual test user ID
    const testUserID = "511e52f8-0977-43e0-a7a4-b8cdb1c49eba";

    if (!testUserID || testUserID === "YOUR_TEST_USER_ID_HERE") {
      Alert.alert(
        "Configuration Error",
        "Please paste your Test User ID into the code"
      );
      return;
    }

    // Validation
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter the medication name.");
      return;
    }

    if (schedule.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please add at least one reminder time."
      );
      return;
    }

    // Check for past times with a 1-minute buffer
    const now = new Date(Date.now() + 60000); // 1 minute from now
    const pastTimes = schedule.filter((date) => date <= now);

    if (pastTimes.length > 0) {
      Alert.alert(
        "Invalid Time",
        "Please ensure all reminder times are set at least 1 minute in the future."
      );
      return;
    }

    setLoading(true);
    try {
      // Format schedule data
      const scheduleISOStrings = schedule.map((date) => date.toISOString());

      console.log("Saving medication:", {
        user_id: testUserID,
        name: name.trim(),
        dosage: dosage.trim() || null,
        schedule: { type: "specific", times: scheduleISOStrings },
      });

      // Insert into database
      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: testUserID,
          name: name.trim(),
          dosage: dosage.trim() || null,
          schedule: { type: "specific", times: scheduleISOStrings },
        })
        .select();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Medication saved successfully:", data);

      // Schedule notifications
      try {
        for (const date of schedule) {
          await scheduleMedicationReminder(
            {
              name: name.trim(),
              dosage: dosage.trim() || "as prescribed",
            },
            date
          );
        }
        console.log("All notifications scheduled successfully");
      } catch (notificationError) {
        console.warn("Notification scheduling failed:", notificationError);
        // Don't fail the entire operation if notifications fail
      }

      Alert.alert("Success", "Medication added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error saving medication:", error);
      Alert.alert(
        "Error",
        `Failed to save medication: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Handle the picker result
    if (Platform.OS === "android") {
      setPickerState({ ...pickerState, show: false });
    }

    if (event.type === "set" && selectedDate) {
      const newSchedule = [...schedule];

      if (pickerState.mode === "date") {
        // Update only the date part, keep the time
        const existingTime = newSchedule[pickerState.index];
        const newDate = new Date(selectedDate);
        newDate.setHours(existingTime.getHours(), existingTime.getMinutes());
        newSchedule[pickerState.index] = newDate;
      } else {
        // Update only the time part, keep the date
        const existingDate = newSchedule[pickerState.index];
        const newTime = new Date(selectedDate);
        const updatedDateTime = new Date(existingDate);
        updatedDateTime.setHours(newTime.getHours(), newTime.getMinutes());
        newSchedule[pickerState.index] = updatedDateTime;
      }

      setSchedule(newSchedule);
    }

    // For iOS, keep the picker open unless cancelled
    if (Platform.OS === "ios" && event.type === "dismissed") {
      setPickerState({ ...pickerState, show: false });
    }
  };

  const showPicker = (index: number, mode: "date" | "time") => {
    setPickerState({ show: true, mode, index });
  };

  const addScheduleItem = () => {
    // Add a new time 1 hour from the last item, or 1 hour from now
    const lastTime = schedule[schedule.length - 1];
    const newTime = new Date(lastTime.getTime() + 60 * 60 * 1000); // 1 hour later
    setSchedule([...schedule, newTime]);
  };

  const removeScheduleItem = (indexToRemove: number) => {
    if (schedule.length > 1) {
      setSchedule(schedule.filter((_, index) => index !== indexToRemove));
    } else {
      Alert.alert("Cannot Remove", "You must have at least one reminder time.");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
          Medication Name *
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
          autoCapitalize="words"
          returnKeyType="next"
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
          returnKeyType="done"
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Reminder Times *
        </Text>

        {schedule.map((date, index) => (
          <View key={index} style={styles.timeRow}>
            <View style={styles.timeControls}>
              <TouchableOpacity
                onPress={() => showPicker(index, "date")}
                style={[styles.dateButton, { backgroundColor: colors.surface }]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.timeText, { color: colors.text }]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => showPicker(index, "time")}
                style={[styles.timeButton, { backgroundColor: colors.surface }]}
              >
                <Ionicons
                  name="alarm-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.timeText, { color: colors.text }]}>
                  {formatTime(date)}
                </Text>
              </TouchableOpacity>
            </View>

            {schedule.length > 1 && (
              <TouchableOpacity
                onPress={() => removeScheduleItem(index)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addTimeButton, { borderColor: colors.outline }]}
          onPress={addScheduleItem}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.addTimeText, { color: colors.primary }]}>
            Add another reminder
          </Text>
        </TouchableOpacity>
      </View>

      {pickerState.show && (
        <DateTimePicker
          value={schedule[pickerState.index]}
          mode={pickerState.mode}
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onPickerChange}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.footer}>
        <GradientButton
          title={loading ? "Saving..." : "Save Medication"}
          onPress={handleSaveMedication}
          loading={loading}
          disabled={loading || !name.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "bold" },
  closeButton: { padding: 4 },
  form: { flex: 1, padding: 24 },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 12,
  },
  timeControls: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 16,
    gap: 8,
  },
  addTimeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
});
