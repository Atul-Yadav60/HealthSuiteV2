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

  // We duplicate the warnings to create a seamless loop effect
  const extendedWarnings = [...warnings, ...warnings];

  useEffect(() => {
    // Calculate the total width of the content to be scrolled
    const contentWidth = warnings.length * (width / 2); // Approximate width of each item

    const scrollAnimation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -contentWidth, // Scroll to the end of the original list
        duration: warnings.length * 5000, // 5 seconds per warning
        easing: Easing.linear,
        useNativeDriver: true,
      })
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
    >
      <Animated.View
        style={[
          styles.scroller,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
      >
        {extendedWarnings.map((warning, index) => (
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
    paddingHorizontal: 20,
    width: width / 2, // Each item takes up half the screen width
  },
  icon: {
    marginRight: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
