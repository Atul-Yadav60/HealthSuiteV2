import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import Colors from "@/constants/Colors";
import { NAV_TABS } from "@/constants/AppConfig";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      {/* This automatically maps all tabs from your AppConfig, including the new Heart Rate tab */}
      {NAV_TABS.map((tab) => (
        <Tabs.Screen
          key={tab.id}
          name={tab.id}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={tab.icon} size={size} color={color} />
            ),
            headerShown: tab.id !== "home", // Hide header only for the home screen
          }}
        />
      ))}

      {/* These screens are part of the tabs stack but are not visible on the tab bar */}
      <Tabs.Screen
        name="skinScanResult"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="prescriptionResult"
        options={{ href: null, headerShown: false }}
      />
    </Tabs>
  );
}
