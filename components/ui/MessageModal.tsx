import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "../../hooks/useColorScheme";
import DefaultColors, { Colors } from "../../constants/Colors";
import { GlassCard } from "./GlassCard";
import { GradientButton } from "./GradientButton";

interface MessageModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

export default function MessageModal({
  visible,
  title,
  message,
  onClose,
  type = "error",
}: MessageModalProps) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const iconName =
    type === "success"
      ? "checkmark-circle"
      : type === "info"
      ? "information-circle"
      : "alert-circle";
  const iconColor =
    type === "success"
      ? colors.success
      : type === "info"
      ? colors.info
      : colors.error;

  const modalViewStyle: StyleProp<ViewStyle> = [
    styles.modalView,
    { backgroundColor: colors.card },
    Platform.OS === "web" ? { boxShadow: "0px 8px 32px rgba(0,0,0,0.22)" } : {},
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <GlassCard style={modalViewStyle}>
          <Ionicons
            name={iconName}
            size={48}
            color={iconColor}
            style={{ marginBottom: 15 }}
            accessibilityLabel={type === "success" ? "Success" : "Error"}
          />
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.modalText, { color: colors.onSurfaceVariant }]}>
            {message}
          </Text>
          <GradientButton title="OK" onPress={onClose} style={styles.button} />
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    margin: 20,
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    width: "85%",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalText: {
    marginBottom: 25,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    width: "100%",
  },
});
