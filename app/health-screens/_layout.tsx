import { Stack } from "expo-router";
import React from "react";

export default function HealthScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Allergies Management */}
      <Stack.Screen name="allergies" />
      <Stack.Screen name="add-allergy" />
      <Stack.Screen name="edit-allergy" />

      {/* Conditions Management */}
      <Stack.Screen name="conditions" />
      <Stack.Screen name="add-condition" />
      <Stack.Screen name="edit-condition" />

      {/* Symptoms Management */}
      <Stack.Screen name="logSymptoms" />
      <Stack.Screen name="symptomHistory" />
    </Stack>
  );
}
