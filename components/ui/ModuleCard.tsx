import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import { MODULES } from "../../constants/AppConfig";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

interface ModuleCardProps {
  moduleId: string;
  onPress: () => void;
  style?: ViewStyle;
  size?: "small" | "medium" | "large";
}

export function ModuleCard({
  moduleId,
  onPress,
  style,
  size = "medium",
}: ModuleCardProps) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const module = MODULES[moduleId as keyof typeof MODULES];

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { width: 120, height: 120, padding: 12, borderRadius: 16 };
      case "large":
        return { width: 180, height: 180, padding: 20, borderRadius: 24 };
      default:
        return { width: 150, height: 150, padding: 16, borderRadius: 20 };
    }
  };

  const getIconSize = () =>
    size === "small" ? 24 : size === "large" ? 40 : 32;

  const getTextSize = () =>
    size === "small" ? 12 : size === "large" ? 18 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, getSizeStyles(), style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[module.color, `${module.color}80`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, getSizeStyles()]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={module.icon as any}
              size={getIconSize()}
              color={colors.text}
            />
          </View>
          <Text
            style={[
              styles.title,
              {
                fontSize: getTextSize(),
                color: colors.text,
                fontWeight: "600",
              },
            ]}
            numberOfLines={2}
          >
            {module.name}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontSize: getTextSize() - 2, color: colors.onSurfaceVariant },
            ]}
            numberOfLines={1}
          >
            {module.subtitle}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" },
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
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
});
