import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  clamp,
} from "react-native-reanimated";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

interface CustomSliderProps {
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  trackColor?: string;
  thumbColor?: string;
  width?: number;
  height?: number;
  disabled?: boolean;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  min,
  max,
  value,
  onValueChange,
  step = 1,
  trackColor,
  thumbColor,
  width = 280,
  height = 40,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"] || Colors.light;

  const trackHeight = 4;
  const thumbSize = 24;
  const trackWidth = width - thumbSize;

  // Calculate position from value
  const valueToPosition = (val: number) => {
    const percentage = (val - min) / (max - min);
    return percentage * trackWidth;
  };

  // Calculate value from position
  const positionToValue = (pos: number) => {
    const percentage = pos / trackWidth;
    let val = min + percentage * (max - min);

    if (step > 0) {
      val = Math.round(val / step) * step;
    }

    return clamp(val, min, max);
  };

  const position = useSharedValue(valueToPosition(value));

  // Update position when value prop changes
  React.useEffect(() => {
    position.value = valueToPosition(value);
  }, [value, min, max]);

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (_, ctx) => {
        if (disabled) return;
        ctx.startX = position.value;
      },
      onActive: (event, ctx) => {
        if (disabled) return;
        const newPosition = clamp(
          ctx.startX + event.translationX,
          0,
          trackWidth
        );
        position.value = newPosition;

        const newValue = positionToValue(newPosition);
        runOnJS(onValueChange)(newValue);
      },
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    width: position.value + thumbSize / 2,
  }));

  return (
    <GestureHandlerRootView>
      <View
        style={{
          width,
          height,
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Track Background */}
        <View
          style={{
            width: trackWidth,
            height: trackHeight,
            backgroundColor: trackColor || colors?.border || "#E5E7EB",
            borderRadius: trackHeight / 2,
            marginHorizontal: thumbSize / 2,
          }}
        />

        {/* Active Track */}
        <Animated.View
          style={[
            {
              position: "absolute",
              height: trackHeight,
              backgroundColor: colors?.tint || "#6366F1",
              borderRadius: trackHeight / 2,
              marginLeft: thumbSize / 2,
            },
            activeTrackStyle,
          ]}
        />

        {/* Thumb */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[
              {
                position: "absolute",
                width: thumbSize,
                height: thumbSize,
                backgroundColor: thumbColor || colors?.tint || "#6366F1",
                borderRadius: thumbSize / 2,
                borderWidth: 2,
                borderColor: colors?.background || "#F3F6FC",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              },
              thumbStyle,
            ]}
          />
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

// Simpler alternative that uses TouchableOpacity for tap positions

export const SimpleSlider: React.FC<CustomSliderProps> = ({
  min,
  max,
  value,
  onValueChange,
  step = 1,
  trackColor,
  thumbColor,
  width = 280,
  height = 40,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"] || Colors.light;

  const trackHeight = 4;
  const thumbSize = 24;
  const trackWidth = width - thumbSize;

  // Calculate position from value
  const valueToPosition = (val: number) => {
    const percentage = (val - min) / (max - min);
    return percentage * trackWidth;
  };

  const handleTrackPress = (event: any) => {
    if (disabled) return;

    const { locationX } = event.nativeEvent;
    const adjustedX = Math.max(
      0,
      Math.min(locationX - thumbSize / 2, trackWidth)
    );

    const percentage = adjustedX / trackWidth;
    let newValue = min + percentage * (max - min);

    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }

    newValue = Math.max(min, Math.min(max, newValue));
    onValueChange(newValue);
  };

  const thumbPosition = valueToPosition(value);
  const activeWidth = thumbPosition + thumbSize / 2;

  return (
    <View
      style={{
        width,
        height,
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <TouchableOpacity
        onPress={handleTrackPress}
        activeOpacity={1}
        disabled={disabled}
        style={{
          width: trackWidth,
          height: Math.max(trackHeight, 44), // Ensure minimum touch target
          justifyContent: "center",
          marginHorizontal: thumbSize / 2,
        }}
      >
        {/* Track Background */}
        <View
          style={{
            width: trackWidth,
            height: trackHeight,
            backgroundColor: trackColor || colors?.border || "#E5E7EB",
            borderRadius: trackHeight / 2,
          }}
        />

        {/* Active Track */}
        <View
          style={{
            position: "absolute",
            height: trackHeight,
            width: activeWidth,
            backgroundColor: colors?.tint || "#6366F1",
            borderRadius: trackHeight / 2,
          }}
        />
      </TouchableOpacity>

      {/* Thumb */}
      <View
        style={{
          position: "absolute",
          left: thumbPosition,
          width: thumbSize,
          height: thumbSize,
          backgroundColor: thumbColor || colors?.tint || "#6366F1",
          borderRadius: thumbSize / 2,
          borderWidth: 2,
          borderColor: colors?.background || "#F3F6FC",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      />
    </View>
  );
};

export default SimpleSlider;
