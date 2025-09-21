import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import Colors from "@/constants/Colors";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0, // for Android
        },
        tabBarBackground: () => (
          <BlurView
            intensity={90}
            tint={colorScheme === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      {/* --- VISIBLE TABS --- */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "heart" : "heart-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Assistant",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "sparkles" : "sparkles-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "notifications" : "notifications-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />

      {/* --- HIDDEN SCREENS (for navigation) --- */}
      <Tabs.Screen name="skinScan" options={{ href: null }} />
      <Tabs.Screen name="prescriptionScanner" options={{ href: null }} />
      <Tabs.Screen name="heartRateMonitor" options={{ href: null }} />
      <Tabs.Screen name="medPlanner" options={{ href: null }} />
      <Tabs.Screen name="skinScanResult" options={{ href: null }} />
      <Tabs.Screen name="prescriptionResult" options={{ href: null }} />

      {/* --- MODAL SCREEN REGISTRATION --- */}
      {/* This single line registers your modal screen with the tabs navigator */}
      <Tabs.Screen
        name="../add-medication"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
