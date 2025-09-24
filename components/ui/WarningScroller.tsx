// File: components/ui/WarningScroller.tsx

import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { ThemedView } from "../ThemedView";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

type Warning = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
};

type WarningScrollerProps = {
  warnings: Warning[];
};

const WarningItem = ({
  icon,
  message,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  return (
    <View style={styles.warningItem}>
      <Ionicons
        name={icon}
        size={16}
        color={colors.warning}
        style={styles.icon}
      />
      <Text style={[styles.warningText, { color: colors.warning }]}>
        {message}
      </Text>
    </View>
  );
};

export function WarningScroller({ warnings }: WarningScrollerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const scrollX = useRef(new Animated.Value(0)).current;

  // Create multiple copies for truly infinite scroll
  const infiniteWarnings = [...warnings, ...warnings, ...warnings, ...warnings];

  useEffect(() => {
    if (warnings.length === 0) return;

    // Calculate the width needed for one complete cycle
    const singleCycleWidth = warnings.length * (width * 0.8); // Increased width per item

    const scrollAnimation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -singleCycleWidth, // Scroll exactly one cycle
        duration: warnings.length * 2000, // Even faster: 2 seconds per warning
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 } // Infinite iterations
    );

    scrollAnimation.start();

    return () => scrollAnimation.stop();
  }, [warnings, scrollX]);

  if (warnings.length === 0) {
    return null;
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.warningBackground }]}
      // accessibilityRole="marquee" // <-- REMOVE THIS LINE
    >
      <Animated.View
        style={[
          styles.scroller,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
      >
        {infiniteWarnings.map((warning, index) => (
          <WarningItem
            key={`${warning.id}-${index}`}
            icon={warning.icon}
            message={warning.message}
          />
        ))}
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 10,
    marginHorizontal: 18,
    borderRadius: 20,
  },
  scroller: {
    flexDirection: "row",
    position: "absolute",
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24, // Increased padding
    width: width * 0.8, // Increased width: 80% of screen width (was 70%)
    minWidth: 280, // Increased minimum width for better readability
  },
  icon: {
    marginRight: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1, // Allow text to shrink if needed
  },
});
