import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "../hooks/useAuth";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BLEProvider } from "@/contexts/BLEContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This is the main layout for the entire app.
function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If the fonts are not loaded yet, we can return null to show the splash screen.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // The <Slot /> component now simply renders the active screen without any security checks.
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    // The providers are still here so the rest of the app doesn't break.
    <AuthProvider>
      <BLEProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </BLEProvider>
    </AuthProvider>
  );
}
