import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import Colors, { gradients } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { supabase } from "../../utils/supabase";

const { height } = Dimensions.get("window");

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validateFields = () => {
    if (!name || name.trim().length < 2) {
      Alert.alert(
        "Invalid Name",
        "Please enter your full name (at least 2 characters)."
      );
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters long."
      );
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "The passwords you entered do not match."
      );
      return false;
    }
    if (!acceptedTerms) {
      Alert.alert(
        "Terms and Conditions",
        "Please accept the terms and conditions to continue."
      );
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      Alert.alert("Sign Up Error", error.message);
    } else {
      Alert.alert(
        "Success!",
        "Please check your email to verify your account.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* HEADER */}
      <LinearGradient
        colors={gradients.secondary as [string, string]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="medical" size={48} color="white" />
          </View>
          <Text style={styles.appName}>Aarogya AI</Text>
          <Text style={styles.welcomeText}>
            Start your personalized health journey today
          </Text>
        </View>
      </LinearGradient>

      {/* FORM */}
      <Animated.View
        style={[
          styles.formWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <GlassCard style={styles.formCard}>
            <Text style={[styles.title, { color: colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Join the future of healthcare
            </Text>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Full Name
              </Text>
              <View
                style={[styles.inputWrapper, { borderColor: colors.outline }]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Email Address
              </Text>
              <View
                style={[styles.inputWrapper, { borderColor: colors.outline }]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Password
              </Text>
              <View
                style={[styles.inputWrapper, { borderColor: colors.outline }]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Create a password"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Confirm Password
              </Text>
              <View
                style={[styles.inputWrapper, { borderColor: colors.outline }]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.outline,
                    backgroundColor: acceptedTerms
                      ? colors.primary
                      : "transparent",
                  },
                ]}
              >
                {acceptedTerms && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={colors.background}
                  />
                )}
              </View>
              <Text
                style={[styles.termsText, { color: colors.onSurfaceVariant }]}
              >
                I agree to the{" "}
                <Text style={[styles.termsLink, { color: colors.primary }]}>
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text style={[styles.termsLink, { color: colors.primary }]}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <GradientButton
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              style={styles.button}
            />

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text
                style={[styles.signInText, { color: colors.onSurfaceVariant }]}
              >
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={[styles.signInLink, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: height * 0.3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formWrapper: {
    marginTop: -60,
    paddingHorizontal: 20,
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
