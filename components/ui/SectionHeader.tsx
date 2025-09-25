import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
});
