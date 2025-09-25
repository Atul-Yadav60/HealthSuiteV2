import { Stack } from "expo-router";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function ModulesLayout() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "700",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Modules",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[moduleId]"
        options={{
          title: "Module",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="trustMed"
        options={{
          title: "TrustMed AI",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
