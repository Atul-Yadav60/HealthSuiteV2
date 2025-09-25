import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { Ionicons } from "@expo/vector-icons";
import DefaultColors, { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";

type InfoCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
  gradient: string[];
};

export function InfoCard({
  icon,
  label,
  value,
  unit,
  gradient,
}: InfoCardProps) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;

  return (
    <View style={styles.cardContainer}>
      <LinearGradient colors={gradient} style={styles.gradient}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
        <View>
          <ThemedText style={styles.label}>{label}</ThemedText>
          <View style={styles.valueContainer}>
            <ThemedText style={styles.value}>{value}</ThemedText>
            {unit && <ThemedText style={styles.unit}> {unit}</ThemedText>}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    borderRadius: 24,
    margin: 6,
    overflow: "hidden",
    // Much more subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    minHeight: 120,
  },
  label: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  unit: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 4,
    marginBottom: 2,
    flexShrink: 1,
    flexWrap: "wrap",
  },
});
