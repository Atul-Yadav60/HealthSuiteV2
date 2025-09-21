import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { GlassCard } from "../../components/ui/GlassCard";
import MessageModal from "../../components/ui/MessageModal";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { recognizeTextInImage } from "../../services/OCRAdapter";

export default function PrescriptionScannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleCapture = async () => {
    if (!camera.current || isProcessing) return;

    setIsProcessing(true);
    try {
      const photo = await camera.current.takePhoto({
        flash: "auto",
        enableShutterSound: true,
      });

      const imagePath = "file://" + photo.path;
      const recognizedText = await recognizeTextInImage(imagePath);

      if (!recognizedText || recognizedText.trim().length === 0) {
        setModalMessage(
          "Could not detect any text. Please try again with a clearer picture."
        );
        setModalVisible(true);
        setIsProcessing(false);
        return;
      }

      router.push({
        pathname: "/(tabs)/prescriptionResult",
        params: {
          imageUri: imagePath,
          text: recognizedText,
        },
      });
    } catch (error: any) {
      console.error("Failed to capture or process prescription:", error);
      setModalMessage(error.message || "An unknown error occurred.");
      setModalVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!hasPermission) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.messageText, { color: colors.text }]}>
          Camera permission is required.
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.messageText, { color: colors.text }]}>
          No camera device found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        enableZoomGesture
      />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <GlassCard style={styles.instructionCard}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color="white"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.instructionText}>
              Capture a clear image of the prescription.
            </Text>
          </GlassCard>
          <TouchableOpacity
            style={[
              styles.captureButton,
              isProcessing && styles.captureButtonDisabled,
            ]}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="black" />
            ) : (
              <Ionicons name="camera" size={32} color="black" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <MessageModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
        title="OCR Error"
        type="error"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  header: {
    marginTop: 40,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  instructionCard: {
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureButtonDisabled: {
    backgroundColor: "gray",
  },
  messageText: {
    fontSize: 18,
  },
});
