// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { Stack, router } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { StatusBar } from "expo-status-bar";
// import { useEffect } from "react";
// import "react-native-reanimated";

// import { useFonts } from "expo-font";
// import { AuthProvider, useAuth } from "@/hooks/useAuth";
// import { useColorScheme } from "@/hooks/useColorScheme";
// import { registerForPushNotificationsAsync } from "@/services/NotificationService";

// // 1. Import the BLEProvider
// import { BLEProvider } from "@/contexts/BLEContext";

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// function RootLayoutNav() {
//   // const { session, loading } = useAuth();
//   // const colorScheme = useColorScheme();

//   // useEffect(() => {
//   //   if (!loading) {
//   //     SplashScreen.hideAsync();
//   //     // This logic will redirect the user based on their authentication status
//   //     if (session) {
//   //       router.replace("/(tabs)/home");
//   //     } else {
//   //       // When not logged in, send to the login screen
//   //       router.replace("/(auth)/login");
//   //     }
//   //   }
//   // }, [session, loading]);

//   // useEffect(() => {
//   //   if (session) {
//   //     // If the user is logged in, register them for push notifications
//   //     registerForPushNotificationsAsync();
//   //   }
//   // }, [session]);

//   // if (loading) {
//   //   // We can return a loading indicator here if needed, or null to show the splash screen
//   //   return null;
//   // }

//   // return (
//   //   <>
//   //     <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
//   //     <Stack screenOptions={{ headerShown: false }}>
//   //       <Stack.Screen name="index" />
//   //       <Stack.Screen name="(auth)" />
//   //       <Stack.Screen name="(tabs)" />
//   //       <Stack.Screen name="modules" />
//   //     </Stack>
//   //   </>
//   // );
// }

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     // 2. Wrap all other providers with AuthProvider and BLEProvider
//     <AuthProvider>
//       <BLEProvider>
//         <ThemeProvider
//           value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
//         >
//           <RootLayoutNav />
//         </ThemeProvider>
//       </BLEProvider>
//     </AuthProvider>
//   );
// }



import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BLEProvider } from "@/contexts/BLEContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // This simplified layout now only sets up the providers (Auth, BLE, Theme)
  // and the main navigation stacks. All complex redirection logic has been
  // removed to prevent conflicts with the change in app/index.tsx.
  return (
    <AuthProvider>
      <BLEProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </BLEProvider>
    </AuthProvider>
  );
}

