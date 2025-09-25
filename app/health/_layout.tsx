import { Stack } from "expo-router";
import React from "react";

export default function HealthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="allergies" />
      <Stack.Screen name="add-allergy" />
      <Stack.Screen name="edit-allergy" />
      <Stack.Screen name="conditions" />
      <Stack.Screen name="add-condition" />
      <Stack.Screen name="logSymptoms" />
      <Stack.Screen name="symptomHistory" />
    </Stack>
  );
}
