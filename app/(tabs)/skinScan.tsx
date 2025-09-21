import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";

export default function SkinScanScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Skin Scan</ThemedText>
      <ThemedText>
        This is the placeholder for the Skin Scan feature.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
