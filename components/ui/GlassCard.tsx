import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
  StyleProp,
} from "react-native";
import Colors, { glassmorphism } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  onPress?: () => void;
  animated?: boolean;
  gradient?: boolean;
  elevation?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  borderRadius = 24,
  padding = 20,
  margin = 0,
  onPress,
  animated = true,
  gradient = false,
  elevation = 8,
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const glass = glassmorphism[colorScheme ?? "dark"];

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, opacityAnim, shadowAnim]);

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const CardContent = () => (
    <Animated.View
      style={[
        styles.container,
        {
          margin,
          borderRadius,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          elevation: shadowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, elevation],
          }),
        },
        style,
      ]}
    >
      {gradient ? (
        <LinearGradient
          colors={[glass.background, "rgba(255, 255, 255, 0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientContainer,
            {
              borderRadius,
              padding,
              // Remove borderColor to eliminate visible borders
            },
          ]}
        >
          <BlurView
            intensity={intensity}
            tint={colorScheme ?? "dark"}
            style={[
              styles.blurView,
              {
                borderRadius,
                backgroundColor: "transparent",
              },
            ]}
          >
            {children}
          </BlurView>
        </LinearGradient>
      ) : (
        <BlurView
          intensity={intensity}
          tint={colorScheme ?? "dark"}
          style={[
            styles.blurView,
            {
              borderRadius,
              padding,
              backgroundColor: colors.card,
              // Remove borderColor to eliminate visible borders
            },
          ]}
        >
          {children}
        </BlurView>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <CardContent />
      </Pressable>
    );
  }

  return <CardContent />;
}

const styles = StyleSheet.create({
  pressable: {},
  container: {
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
    }),
  },
  gradientContainer: {
    // Remove borderWidth to eliminate rectangular borders
    // borderWidth: 1,
    overflow: "hidden",
  },
  blurView: {
    // Remove borderWidth to eliminate rectangular borders
    // borderWidth: 1,
    overflow: "hidden",
  },
});
