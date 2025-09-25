import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { type IconProps } from "@expo/vector-icons/build/createIconSet";
import { type ComponentProps } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import DefaultColors, { Colors } from "@/constants/Colors";

/**
 * TabBarIcon with bold and accessible style.
 */
export function TabBarIcon({
  style,
  color,
  focused,
  ...rest
}: IconProps<ComponentProps<typeof Ionicons>["name"]> & {
  focused?: boolean;
}) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const iconColor =
    color ?? (focused ? colors.tabIconSelected : colors.tabIconDefault);

  return (
    <Ionicons
      size={28}
      style={[{ marginBottom: -3, opacity: focused ? 1 : 0.7 }, style]}
      color={iconColor}
      {...rest}
    />
  );
}
