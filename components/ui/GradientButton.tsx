import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors, { gradients } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: keyof typeof gradients | string[];
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error";
  icon?: string;
}

export function GradientButton({
  title,
  onPress,
  style,
  textStyle,
  gradient,
  disabled = false,
  loading = false,
  size = "medium",
  variant = "primary",
  icon,
}: GradientButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const getGradientColors = () => {
    if (Array.isArray(gradient)) return gradient;
    if (gradient) return gradients[gradient as keyof typeof gradients];
    switch (variant) {
      case "primary":
        return gradients.primary;
      case "secondary":
        return gradients.secondary;
      case "accent":
        return gradients.accent;
      case "success":
        return gradients.success;
      case "warning":
        return gradients.warning;
      case "error":
        return gradients.error;
      default:
        return gradients.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 };
      case "large":
        return { paddingVertical: 18, paddingHorizontal: 36, borderRadius: 28 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 18 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        getSizeStyles(),
        style,
        disabled || loading ? styles.disabled : undefined,
      ]}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          getSizeStyles(),
          disabled || loading ? styles.disabled : undefined,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              {
                fontSize: getTextSize(),
                color: colors.text,
                fontWeight: "700",
              },
              textStyle,
            ]}
            accessibilityLabel={title}
          >
            {icon ? <Text style={{ marginRight: 6 }}>{icon}</Text> : null}
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    textAlign: "center",
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});
