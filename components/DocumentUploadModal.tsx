import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DefaultColors, { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
import { useAuth } from "../hooks/useAuth";

const CATEGORIES = [
  { id: "lab", label: "Lab Results", icon: "flask-outline", color: "#10B981" },
  {
    id: "prescription",
    label: "Prescription",
    icon: "medical-outline",
    color: "#6366F1",
  },
  { id: "imaging", label: "Imaging", icon: "scan-outline", color: "#8B5CF6" },
  {
    id: "doctor_notes",
    label: "Doctor Notes",
    icon: "document-text-outline",
    color: "#EC4899",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: "shield-outline",
    color: "#F59E0B",
  },
  { id: "general", label: "General", icon: "folder-outline", color: "#06B6D4" },
];

const PROVIDER_TYPES = [
  { id: "doctor", label: "Doctor" },
  { id: "hospital", label: "Hospital" },
  { id: "lab", label: "Laboratory" },
  { id: "pharmacy", label: "Pharmacy" },
];

interface CreateHealthRecordData {
  display_name: string;
  category?:
    | "lab"
    | "prescription"
    | "imaging"
    | "doctor_notes"
    | "insurance"
    | "general";
  description?: string;
  record_date?: string;
  provider_name?: string;
  provider_type?: "doctor" | "hospital" | "lab" | "pharmacy";
}

interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export function DocumentUploadModal({
  visible,
  onClose,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme] || Colors;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    display_name: "",
    category: "general" as CreateHealthRecordData["category"],
    description: "",
    record_date: "",
    provider_name: "",
    provider_type: "doctor" as CreateHealthRecordData["provider_type"],
  });

  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      display_name: "",
      category: "general",
      description: "",
      record_date: "",
      provider_name: "",
      provider_type: "doctor",
    });
  };

  const handleUpload = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!formData.display_name.trim()) {
      Alert.alert("Error", "Please enter a document name");
      return;
    }

    try {
      setUploading(true);

      // For now, we'll create a mock upload to test the UI
      // TODO: Implement actual file upload when database is ready

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, create a mock record entry
      console.log("Mock upload data:", {
        display_name: formData.display_name.trim(),
        category: formData.category,
        description: formData.description.trim() || undefined,
        record_date: formData.record_date.trim() || undefined,
        provider_name: formData.provider_name.trim() || undefined,
        provider_type: formData.provider_type,
      });

      Alert.alert(
        "Upload Ready",
        "Document upload feature is ready! The file picker will open when the database is connected. Your form data has been prepared.",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              onUploadSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error preparing upload:", error);
      Alert.alert("Error", "Upload preparation failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient colors={["#06B6D4", "#0891B2"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Upload Document</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            {/* Document Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Document Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.display_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, display_name: text }))
                }
                placeholder="e.g., Blood Test Results - Sep 2025"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Category *
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: colors.surface },
                      formData.category === category.id && {
                        backgroundColor: category.color + "20",
                        borderColor: category.color,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: category.id as any,
                      }))
                    }
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={
                        formData.category === category.id
                          ? category.color
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color:
                            formData.category === category.id
                              ? category.color
                              : colors.text,
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Add any notes about this document..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Record Date */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Record Date (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.record_date}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, record_date: text }))
                }
                placeholder="YYYY-MM-DD (when the record was created)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Provider Information */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Healthcare Provider (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData.provider_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, provider_name: text }))
                }
                placeholder="e.g., Dr. Smith, City Hospital, LabCorp"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Provider Type */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Provider Type
              </Text>
              <View style={styles.providerTypeContainer}>
                {PROVIDER_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.providerTypeOption,
                      { backgroundColor: colors.surface },
                      formData.provider_type === type.id && {
                        backgroundColor: colors.primary + "20",
                        borderColor: colors.primary,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        provider_type: type.id as any,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.providerTypeLabel,
                        {
                          color:
                            formData.provider_type === type.id
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Upload Button */}
            <View style={styles.uploadButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { backgroundColor: colors.primary },
                  uploading && { opacity: 0.7 },
                ]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.uploadButtonText}>
                      Prepare Document Upload
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Document upload feature is ready! File picker will be enabled
                when database is connected. All form data is prepared and
                validated.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  providerTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  providerTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  providerTypeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  uploadButtonContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
