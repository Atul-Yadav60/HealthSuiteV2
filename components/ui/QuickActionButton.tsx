import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import { QuickAction } from "../../constants/AppConfig";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

type QuickActionButtonProps = {
  action: QuickAction;
  onPress: () => void;
  style?: ViewStyle;
};

export function QuickActionButton({
  action,
  onPress,
  style,
}: QuickActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  if (!action) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        Platform.OS === "web"
          ? { boxShadow: "0px 4px 12px rgba(0,0,0,0.12)" }
          : {},
      ]}
      onPress={onPress}
      activeOpacity={0.76}
      accessibilityRole="button"
      accessibilityLabel={action.title}
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
        <Ionicons name={action.icon} size={28} color="white" />
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
    minWidth: 80,
    maxWidth: 120,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    // Subtle shadow instead of big shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
