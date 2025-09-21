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
  const [schedule, setSchedule] = useState<Date[]>([new Date()]);
  const [loading, setLoading] = useState(false);

  const [pickerState, setPickerState] = useState<{
    show: boolean;
    mode: "date" | "time";
    index: number;
  }>({ show: false, mode: "date", index: 0 });

  const handleSaveMedication = async () => {
    // --- DEVELOPMENT ONLY ---
    // PASTE YOUR TEST USER ID FROM THE SUPABASE DASHBOARD INSIDE THE QUOTES
    const testUserID = "511e52f8-0977-43e0-a7a4-b8cdb1c49eba";
    // --- END DEVELOPMENT ONLY ---

    if (!testUserID || testUserID === "511e52f8-0977-43e0-a7a4-b8cdb1c49eba") {
      Alert.alert(
        "Configuration Error",
        "Please set your Test User ID in app/add-medication.tsx"
      );
      return;
    }

    if (!name || schedule.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please enter the medication name and at least one date and time."
      );
      return;
    }

    const now = new Date();
    if (schedule.some((date) => date <= now)) {
      Alert.alert(
        "Invalid Time",
        "Please ensure all reminder times are set in the future."
      );
      return;
    }

    setLoading(true);
    try {
      const scheduleISOStrings = schedule.map((date) => date.toISOString());

      const { error } = await supabase.from("medications").insert({
        user_id: testUserID,
        name: name.trim(),
        dosage: dosage.trim(),
        schedule: { type: "specific", times: scheduleISOStrings },
      });

      if (error) throw error;

      for (const date of schedule) {
        await scheduleMedicationReminder(
          { name: name.trim(), dosage: dosage.trim() },
          date
        );
      }

      Alert.alert("Success", "Medication added and reminders scheduled.");
      router.back();
    } catch (error: any) {
      console.error("Error saving medication:", error);
      Alert.alert("Error", `Failed to save medication. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || schedule[pickerState.index];
    setPickerState({ ...pickerState, show: false });

    if (event.type === "set") {
      const newSchedule = [...schedule];
      newSchedule[pickerState.index] = currentDate;
      setSchedule(newSchedule);
    }
  };

  const showPicker = (index: number, mode: "date" | "time") => {
    setPickerState({ show: true, mode, index });
  };

  const addScheduleItem = () => {
    setSchedule([...schedule, new Date()]);
  };

  const removeScheduleItem = (indexToRemove: number) => {
    setSchedule(schedule.filter((_, index) => index !== indexToRemove));
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
        {schedule.map((date, index) => (
          <View key={index} style={styles.timeRow}>
            <TouchableOpacity
              onPress={() => showPicker(index, "date")}
              style={styles.dateButton}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.timeText, { color: colors.text }]}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showPicker(index, "time")}
              style={styles.timeButton}
            >
              <Ionicons name="alarm-outline" size={24} color={colors.primary} />
              <Text style={[styles.timeText, { color: colors.text }]}>
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeScheduleItem(index)}>
              <Ionicons
                name="remove-circle-outline"
                size={24}
                color={colors.error}
              />
            </TouchableOpacity>
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
          {/* This was the line with the typo. It is now fixed. */}
          <Text style={[styles.addTimeText, { color: colors.primary }]}>
            Add another time
          </Text>
        </TouchableOpacity>
      </View>
      {pickerState.show && (
        <DateTimePicker
          value={schedule[pickerState.index]}
          mode={pickerState.mode}
          is24Hour={true}
          display="default"
          onChange={onPickerChange}
        />
      )}
      <View style={styles.footer}>
        <GradientButton
          title="Save Medication"
          onPress={handleSaveMedication}
          loading={loading}
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
  label: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
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
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
  },
  dateButton: { flexDirection: "row", alignItems: "center" },
  timeButton: { flexDirection: "row", alignItems: "center" },
  timeText: { fontSize: 18, marginLeft: 8 },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addTimeText: { marginLeft: 8, fontSize: 16, fontWeight: "600" },
  footer: { padding: 24, paddingBottom: 40 },
});
