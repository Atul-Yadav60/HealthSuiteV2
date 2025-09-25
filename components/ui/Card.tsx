import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: "surface" | "primary";
};

export default function Card({ children, style, variant = "surface" }: Props) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  return (
    <View
      style={[
        styles.base,
        variant === "primary"
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.surface },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    overflow: "hidden", // Ensures nothing spills outside
    padding: 16,
    // Subtle shadow instead of big shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
