import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { registerForPushNotificationsAsync } from "@/services/NotificationService";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
      // The redirect logic is now handled by app/index.tsx for the initial load.
      // This useEffect is still useful for handling logins/logouts while the app is running.
      if (session) {
        router.replace("/(tabs)/home");
      } else {
        // For development, app/index.tsx handles the bypass.
        // For production, this line should be router.replace('/(auth)/login');
        // We will keep the bypass here as well for consistency.
        router.replace("/(tabs)/home");
      }
    }
  }, [session, loading]);

  useEffect(() => {
    if (session) {
      // If the user is logged in, register them for push notifications
      registerForPushNotificationsAsync();
    }
  }, [session]); // Run this effect when the session changes

  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modules" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
