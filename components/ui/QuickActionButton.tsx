import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
// Import the TYPE for a single quick action
import { QuickAction } from "../../constants/AppConfig";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

// Define the properties the component accepts
type QuickActionButtonProps = {
  // The component now expects the full action object
  action: QuickAction;
  onPress: () => void;
  style?: ViewStyle;
};

export function QuickActionButton({
  action, // Use the action object directly
  onPress,
  style,
}: QuickActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // If for some reason the action is invalid, render nothing.
  if (!action) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: action.color,
            shadowColor: action.color,
          },
        ]}
      >
        <Ionicons name={action.icon} size={24} color="white" />
      </View>
      <Text style={[styles.title, { color: colors.onSurfaceVariant }]}>
        {action.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
