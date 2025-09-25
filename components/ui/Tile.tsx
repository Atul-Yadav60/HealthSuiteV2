import React from "react";
import {  tile: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    width: 140,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(10, 18, 32, 0.04)" },
      default: {
        shadowColor: "#0A1220",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  }, Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

interface TileProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export default function Tile({ icon, title, subtitle, onPress }: TileProps) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View>{icon}</View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    width: 140,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: "0px 2px 10px rgba(10, 18, 32, 0.1)" },
      default: {
        shadowColor: "#0A1220",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
