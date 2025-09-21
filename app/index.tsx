// // import { Ionicons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { router } from 'expo-router';
// // import React, { useEffect, useRef, useState } from 'react';
// // import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import { APP_CONFIG } from '../constants/AppConfig';
// // import Colors, { gradients } from '../constants/Colors';
// // import { useColorScheme } from '../hooks/useColorScheme';

// // const { width, height } = Dimensions.get('window');

// // const onboardingData = [
// //   {
// //     id: 1,
// //     title: 'Welcome to Aarogya AI',
// //     subtitle: 'Your personal health companion',
// //     description: 'Advanced AI-powered healthcare monitoring and guidance',
// //     icon: 'medical',
// //     gradient: gradients.primary as [string, string],
// //   },
// //   {
// //     id: 2,
// //     title: 'Smart Health Monitoring',
// //     subtitle: 'Scan, analyze, and track',
// //     description: 'Monitor your skin health, verify medications, and track your wellness journey',
// //     icon: 'scan',
// //     gradient: gradients.secondary as [string, string],
// //   },
// //   {
// //     id: 3,
// //     title: 'AI-Powered Insights',
// //     subtitle: 'Get personalized guidance',
// //     description: 'Receive intelligent health recommendations and connect with specialists',
// //     icon: 'bulb',
// //     gradient: gradients.accent as [string, string],
// //   },
// // ];

// // export default function SplashScreen() {
// //   const colorScheme = useColorScheme();
// //   const colors = Colors[colorScheme ?? 'dark'];
// //   const [currentStep, setCurrentStep] = useState(0);
// //   const [showOnboarding, setShowOnboarding] = useState(false);
  
// //   // Animations
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const slideAnim = useRef(new Animated.Value(width)).current;
// //   const scaleAnim = useRef(new Animated.Value(0.8)).current;

// //   useEffect(() => {
// //     // Initial splash animation
// //     Animated.sequence([
// //       Animated.timing(fadeAnim, {
// //         toValue: 1,
// //         duration: 1000,
// //         useNativeDriver: true,
// //       }),
// //       Animated.timing(scaleAnim, {
// //         toValue: 1,
// //         duration: 800,
// //         useNativeDriver: true,
// //       }),
// //     ]).start(() => {
// //       // Show onboarding after splash
// //       setTimeout(() => {
// //         setShowOnboarding(true);
// //         Animated.timing(slideAnim, {
// //           toValue: 0,
// //           duration: 600,
// //           useNativeDriver: true,
// //         }).start();
// //       }, 500);
// //     });
// //   }, []);

// //   useEffect(() => {
// //     if (showOnboarding) {
// //       // Auto-advance every 3 seconds
// //       const timer = setTimeout(() => {
// //         if (currentStep < onboardingData.length - 1) {
// //           handleNext();
// //         }
// //       }, 3000);

// //       return () => clearTimeout(timer);
// //     }
// //   }, [currentStep, showOnboarding]);

// //   const handleNext = () => {
// //     if (currentStep < onboardingData.length - 1) {
// //       Animated.timing(slideAnim, {
// //         toValue: -width,
// //         duration: 300,
// //         useNativeDriver: true,
// //       }).start(() => {
// //         setCurrentStep(currentStep + 1);
// //         slideAnim.setValue(width);
// //         Animated.timing(slideAnim, {
// //           toValue: 0,
// //           duration: 300,
// //           useNativeDriver: true,
// //         }).start();
// //       });
// //     }
// //   };

// //   const handleSkip = () => {
// //     router.replace('/(auth)/login');
// //   };

// //   const handleGetStarted = () => {
// //     router.replace('/(auth)/login');
// //   };

// //   const currentData = onboardingData[currentStep];

// //   if (!showOnboarding) {
// //     // Splash Screen
// //     return (
// //       <View style={[styles.container, { backgroundColor: colors.background }]}>
// //         <LinearGradient
// //           colors={gradients.primary as [string, string]}
// //           style={styles.splashGradient}
// //           start={{ x: 0, y: 0 }}
// //           end={{ x: 1, y: 1 }}
// //         >
// //           <Animated.View
// //             style={[
// //               styles.splashContent,
// //               {
// //                 opacity: fadeAnim,
// //                 transform: [{ scale: scaleAnim }],
// //               },
// //             ]}
// //           >
// //             <View style={styles.logoContainer}>
// //               <View style={styles.logo}>
// //                 <Ionicons name="medical" size={64} color={colors.text} />
// //               </View>
// //             </View>
// //             <Text style={[styles.appName, { color: colors.text }]}>
// //               {APP_CONFIG.name}
// //             </Text>
// //             <Text style={[styles.tagline, { color: colors.onSurfaceVariant }]}>
// //               {APP_CONFIG.tagline}
// //             </Text>
// //           </Animated.View>
// //         </LinearGradient>
// //       </View>
// //     );
// //   }

// //   // Onboarding Screen
// //   return (
// //     <View style={[styles.container, { backgroundColor: colors.background }]}>
// //       <LinearGradient
// //         colors={currentData.gradient}
// //         style={styles.onboardingGradient}
// //         start={{ x: 0, y: 0 }}
// //         end={{ x: 1, y: 1 }}
// //       >
// //         {/* Skip Button */}
// //         <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
// //           <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
// //         </TouchableOpacity>

// //         {/* Content */}
// //         <Animated.View
// //           style={[
// //             styles.onboardingContent,
// //             {
// //               transform: [{ translateX: slideAnim }],
// //             },
// //           ]}
// //         >
// //           <View style={styles.iconContainer}>
// //             <View style={styles.iconBackground}>
// //               <Ionicons name={currentData.icon as any} size={80} color={colors.text} />
// //             </View>
// //           </View>

// //           <Text style={[styles.onboardingTitle, { color: colors.text }]}>
// //             {currentData.title}
// //           </Text>
// //           <Text style={[styles.onboardingSubtitle, { color: colors.onSurfaceVariant }]}>
// //             {currentData.subtitle}
// //           </Text>
// //           <Text style={[styles.onboardingDescription, { color: colors.onSurfaceVariant }]}>
// //             {currentData.description}
// //           </Text>
// //         </Animated.View>

// //         {/* Progress Indicators */}
// //         <View style={styles.progressContainer}>
// //           {onboardingData.map((_, index) => (
// //             <View
// //               key={index}
// //               style={[
// //                 styles.progressDot,
// //                 {
// //                   backgroundColor: index === currentStep ? colors.text : colors.onSurfaceVariant,
// //                   width: index === currentStep ? 24 : 8,
// //                 },
// //               ]}
// //             />
// //           ))}
// //         </View>

// //         {/* Action Buttons */}
// //         <View style={styles.actionContainer}>
// //           {currentStep === onboardingData.length - 1 ? (
// //             <TouchableOpacity
// //               style={[styles.getStartedButton, { backgroundColor: colors.text }]}
// //               onPress={handleGetStarted}
// //             >
// //               <Text style={[styles.getStartedText, { color: colors.background }]}>
// //                 Get Started
// //               </Text>
// //               <Ionicons name="arrow-forward" size={20} color={colors.background} />
// //             </TouchableOpacity>
// //           ) : (
// //             <TouchableOpacity
// //               style={[styles.nextButton, { borderColor: colors.text }]}
// //               onPress={handleNext}
// //             >
// //               <Text style={[styles.nextText, { color: colors.text }]}>Next</Text>
// //               <Ionicons name="arrow-forward" size={20} color={colors.text} />
// //             </TouchableOpacity>
// //           )}
// //         </View>
// //       </LinearGradient>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //   },
// //   splashGradient: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   splashContent: {
// //     alignItems: 'center',
// //   },
// //   logoContainer: {
// //     marginBottom: 24,
// //   },
// //   logo: {
// //     width: 120,
// //     height: 120,
// //     borderRadius: 60,
// //     backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginBottom: 16,
// //   },
// //   appName: {
// //     fontSize: 36,
// //     fontWeight: 'bold',
// //     marginBottom: 8,
// //     textAlign: 'center',
// //   },
// //   tagline: {
// //     fontSize: 18,
// //     opacity: 0.9,
// //     textAlign: 'center',
// //   },
// //   onboardingGradient: {
// //     flex: 1,
// //     paddingTop: 60,
// //     paddingHorizontal: 24,
// //   },
// //   skipButton: {
// //     alignSelf: 'flex-end',
// //     padding: 16,
// //   },
// //   skipText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   onboardingContent: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   iconContainer: {
// //     marginBottom: 40,
// //   },
// //   iconBackground: {
// //     width: 160,
// //     height: 160,
// //     borderRadius: 80,
// //     backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   onboardingTitle: {
// //     fontSize: 32,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //     marginBottom: 12,
// //     paddingHorizontal: 20,
// //   },
// //   onboardingSubtitle: {
// //     fontSize: 20,
// //     fontWeight: '600',
// //     textAlign: 'center',
// //     marginBottom: 16,
// //     paddingHorizontal: 20,
// //   },
// //   onboardingDescription: {
// //     fontSize: 16,
// //     textAlign: 'center',
// //     lineHeight: 24,
// //     paddingHorizontal: 20,
// //     opacity: 0.9,
// //   },
// //   progressContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 40,
// //     gap: 8,
// //   },
// //   progressDot: {
// //     height: 8,
// //     borderRadius: 4,
// //   },
// //   actionContainer: {
// //     paddingBottom: 40,
// //   },
// //   getStartedButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingVertical: 16,
// //     paddingHorizontal: 32,
// //     borderRadius: 28,
// //     gap: 8,
// //   },
// //   getStartedText: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //   },
// //   nextButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingVertical: 16,
// //     paddingHorizontal: 32,
// //     borderRadius: 28,
// //     borderWidth: 2,
// //     gap: 8,
// //   },
// //   nextText: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //   },
// // }); 


// // import React from "react";
// // import { View, ActivityIndicator, StyleSheet } from "react-native";
// // import { useColorScheme } from "@/hooks/useColorScheme";
// // import Colors from "@/constants/Colors";

// // /**
// //  * This is the initial screen of the app.
// //  * It now serves only as a loading indicator while the root layout (_layout.tsx)
// //  * determines the correct screen to navigate to based on authentication state.
// //  */
// // export default function Index() {
// //   const colorScheme = useColorScheme();
// //   const colors = Colors[colorScheme ?? "dark"];

// //   return (
// //     <View style={[styles.container, { backgroundColor: colors.background }]}>
// //       <ActivityIndicator size="large" color={colors.primary} />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// // });
// import { Redirect } from 'expo-router';
// import React from 'react';

// /**
//  * This is the initial screen of the app.
//  * It now serves only to immediately redirect the user to the home screen
//  * for faster development.
//  *
//  * Before production, this should be changed to point back to the
//  * login or onboarding screen.
//  */
// export default function Index() {
//   // This component will automatically redirect to the home screen.
//   // This is the most reliable way to bypass authentication during development.
//   return <Redirect href="/(tabs)/home" />;
// }
// // ```

// // I have updated the `index.tsx` file in your Canvas with this corrected, much simpler code.

// // ### Next Steps

// // After saving this change, you **do not** need to rebuild the native app again.

// // 1.  Stop the Metro server if it's running (press `Ctrl+C` in the terminal).
// // 2.  Start it again:
//     // ```bash
//     // npm start
    


import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  // This component will automatically redirect to the home screen.
  // This is the most reliable way to bypass authentication for development.
  return <Redirect href="/(tabs)/home" />;
}