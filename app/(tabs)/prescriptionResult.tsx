import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import MessageModal from "../../components/ui/MessageModal";
import Colors from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import { parsePrescriptionText } from "../../services/OCRAdapter";
import { supabase } from "../../utils/supabase";

export default function PrescriptionResultScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const { imageUri, text } = useLocalSearchParams<{
    imageUri: string;
    text: string;
  }>();
  const { session } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  const parsedData = useMemo(() => {
    if (!text) return { rawText: "", medications: [], frequencies: [] };
    return parsePrescriptionText(text);
  }, [text]);

  const handleSaveReport = async () => {
    if (!session?.user) {
      setModalInfo({
        title: "Error",
        message: "You must be logged in to save reports.",
        type: "error",
      });
      setModalVisible(true);
      return;
    }
    if (!imageUri) return;

    setIsSaving(true);
    try {
      // 1. Upload the image to Supabase Storage
      const fileExt = imageUri.split(".").pop();
      const fileName = `${
        session.user.id
      }/${new Date().toISOString()}.${fileExt}`;
      const contentType = `image/${fileExt}`;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("report-inputs")
        .upload(fileName, blob, { contentType });

      if (uploadError) throw uploadError;

      // 2. Create the JSON report data
      const reportJson = {
        analysisType: "prescription-ocr",
        recognizedText: parsedData.rawText,
        extractedMedications: parsedData.medications,
        extractedFrequencies: parsedData.frequencies,
      };

      // 3. Insert the report into the database
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert({
          user_id: session.user.id,
          feature: "prescription",
          json_data: reportJson,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // 4. Link the uploaded file to the report
      const { error: fileError } = await supabase.from("report_files").insert({
        report_id: reportData.report_id,
        user_id: session.user.id,
        file_type: "image",
        storage_path: uploadData.path,
      });

      if (fileError) throw fileError;

      setModalInfo({
        title: "Success",
        message: "Report saved successfully!",
        type: "success",
      });
      setModalVisible(true);
    } catch (error: any) {
      console.error("Error saving prescription report:", error);
      setModalInfo({
        title: "Error",
        message: `Failed to save report: ${error.message}`,
        type: "error",
      });
      setModalVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Prescription Details
        </Text>
      </View>

      <View style={styles.content}>
        <GlassCard style={styles.imageCard}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </GlassCard>

        <GlassCard style={styles.resultsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recognized Medications
          </Text>
          {parsedData.medications.length > 0 ? (
            parsedData.medications.map((med, index) => (
              <View
                key={index}
                style={[
                  styles.resultItem,
                  { borderBottomColor: colors.outline },
                ]}
              >
                <Ionicons
                  name="medical-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.resultText, { color: colors.text }]}>
                  {med}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={[
                styles.placeholderText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              No medications identified.
            </Text>
          )}

          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}
          >
            Recognized Frequencies
          </Text>
          {parsedData.frequencies.length > 0 ? (
            parsedData.frequencies.map((freq, index) => (
              <View
                key={index}
                style={[
                  styles.resultItem,
                  { borderBottomColor: colors.outline },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={[styles.resultText, { color: colors.text }]}>
                  {freq}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={[
                styles.placeholderText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              No frequencies identified.
            </Text>
          )}
        </GlassCard>

        <GradientButton
          title="Save Report"
          onPress={handleSaveReport}
          loading={isSaving}
          style={styles.saveButton}
        />
      </View>

      <MessageModal
        visible={modalVisible}
        message={modalInfo.message}
        onClose={() => {
          setModalVisible(false);
          if (modalInfo.type === "success") {
            router.replace("/(tabs)/home");
          }
        }}
        title={modalInfo.title}
        type={modalInfo.type}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  imageCard: {
    padding: 10,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 16,
  },
  resultsCard: {
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  saveButton: {
    marginTop: 20,
  },
});
