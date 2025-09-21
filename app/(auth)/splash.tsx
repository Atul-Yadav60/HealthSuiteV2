import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Dimensions, Image, Platform, StyleSheet, Text } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const orbScale = useSharedValue(1);
  const taglineOpacity = useSharedValue(0);
  const taglineLetterSpacing = useSharedValue(0);

  useEffect(() => {
    // Logo fade + pop in
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.back(1.5)),
    });

    // Orb pulse loop
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Tagline appear later
    taglineOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 1200 })
    );
    taglineLetterSpacing.value = withDelay(
      1000,
      withTiming(2, { duration: 1200 })
    );

    const timeout = setTimeout(() => {
      router.replace("/(auth)/onboarding");
    }, 2600);

    return () => clearTimeout(timeout);
  }, []);

  // Anim styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    letterSpacing: taglineLetterSpacing.value,
  }));

  return (
    <LinearGradient
      colors={["#0F1B33", "#1C2A59"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Glow Orb */}
      <Animated.View style={[styles.glowOrb, orbStyle]} />

      {/* Logo + Text */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>CogniCare</Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Intelligent Health, Personalized
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glowOrb: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: (width * 1.4) / 2,
    backgroundColor: "#4a90e2",
    opacity: 0.12,
    top: height * 0.25,
    left: -width * 0.25,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 50px rgba(74, 144, 226, 0.8)',
      },
      default: {
        shadowColor: "#4a90e2",
        shadowRadius: 50,
        shadowOpacity: 0.8,
        elevation: 20,
      },
    }),
  },
  logoContainer: {
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: '0px 6px 12px rgba(74, 144, 226, 0.7)',
      },
      default: {
        shadowColor: "#4a90e2",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.7,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 22,
    marginBottom: 18,
    boxShadow: '0px 6px 12px rgba(74, 144, 226, 0.7)',
    elevation: 8,
  },
  logoText: {
    fontSize: 46,
    fontWeight: "900",
    color: "#E6F1FF",
    letterSpacing: 1.4,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9DB5D6",
    marginTop: 8,
  },
});
