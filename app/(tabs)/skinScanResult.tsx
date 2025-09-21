import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import MessageModal from "../../components/ui/MessageModal";
import Colors from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import { supabase } from "../../utils/supabase";

interface SkinScanResult {
  label: string;
  confidence: number;
}

export default function SkinScanResultScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const {
    imageUri,
    results,
    reportId: reportIdParam,
  } = useLocalSearchParams<{
    imageUri: string;
    results: string;
    reportId?: string;
  }>();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });
  const [reportId, setReportId] = useState<string | null>(
    reportIdParam || null
  );

  const parsedResults: SkinScanResult[] = JSON.parse(results || "[]");
  const topResult = parsedResults[0];

  const getSeverityColor = (confidence: number) => {
    if (confidence > 0.8) return colors.error;
    if (confidence > 0.5) return colors.warning;
    return colors.success;
  };

  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      const reportJson = {
        analysisType: "skin-scan",
        top_prediction: topResult.label,
        confidence: topResult.confidence,
        all_predictions: parsedResults,
      };

      const { data, error } = await supabase.rpc("save_report", {
        feature_type: "skin",
        report_data: reportJson,
      });

      if (error) throw error;

      setReportId(data); // Store the returned report_id
      setModalInfo({
        title: "Success",
        message: "Your skin scan report has been saved.",
        type: "success",
      });
      setModalVisible(true);
    } catch (error: any) {
      console.error("Error saving report:", error);
      setModalInfo({
        title: "Error",
        message: "Could not save the report. " + error.message,
        type: "error",
      });
      setModalVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!reportId) {
      setModalInfo({
        title: "Error",
        message: "Please save the report first before generating a PDF.",
        type: "error",
      });
      setModalVisible(true);
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: { reportId },
      });

      if (error) throw error;

      // Open the PDF URL in the browser
      await Linking.openURL(data.pdfUrl);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      setModalInfo({
        title: "Error",
        message: `Could not generate PDF: ${error.message}`,
        type: "error",
      });
      setModalVisible(true);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Analysis Results
        </Text>
        <GlassCard style={styles.resultsCard}>
          <View style={styles.topResultContainer}>
            <Text
              style={[
                styles.topResultLabel,
                { color: getSeverityColor(topResult.confidence) },
              ]}
            >
              {topResult.label}
            </Text>
            <Text style={[styles.topResultConfidence, { color: colors.text }]}>
              {(topResult.confidence * 100).toFixed(1)}% Confidence
            </Text>
          </View>
          <Text style={[styles.disclaimer, { color: colors.onSurfaceVariant }]}>
            Disclaimer: This is not a medical diagnosis. Please consult a
            healthcare professional.
          </Text>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!reportId ? (
            <GradientButton
              title="Save Report"
              onPress={handleSaveReport}
              loading={isSaving}
            />
          ) : (
            <GradientButton
              title="Export as PDF"
              onPress={handleGeneratePdf}
              loading={isGeneratingPdf}
              icon="download-outline"
            />
          )}
        </View>
      </View>
      <MessageModal
        visible={modalVisible}
        title={modalInfo.title}
        message={modalInfo.message}
        type={modalInfo.type}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 300 },
  imagePreview: { width: "100%", height: "100%" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  resultsCard: { padding: 20, alignItems: "center", marginBottom: 30 },
  topResultContainer: { alignItems: "center", marginBottom: 15 },
  topResultLabel: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  topResultConfidence: { fontSize: 18, marginTop: 5 },
  disclaimer: { fontSize: 12, textAlign: "center", fontStyle: "italic" },
  buttonContainer: {
    gap: 10,
  },
});
