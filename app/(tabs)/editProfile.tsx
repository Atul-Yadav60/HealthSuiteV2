import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MOCK_DATA } from "../../constants/AppConfig";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import { ThemedText } from "../../components/ThemedText";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;
  const { session } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    fullName:
      session?.user?.user_metadata?.full_name ||
      MOCK_DATA?.user?.name ||
      "John Doe",
    email: session?.user?.email || "user@healthsuite.com",
    phone: MOCK_DATA?.user?.phone || "+91 98765 43210",
    dateOfBirth: MOCK_DATA?.user?.dateOfBirth || "1990-01-01",
    gender: MOCK_DATA?.user?.gender || "Male",
    bloodGroup: MOCK_DATA?.user?.bloodGroup || "O+",
    height: MOCK_DATA?.user?.height || "175",
    weight: MOCK_DATA?.user?.weight || "70",
    allergies: MOCK_DATA?.user?.allergies || "None",
    emergencyContact: MOCK_DATA?.user?.emergencyContact || "+91 98765 43211",
    address: MOCK_DATA?.user?.address || "Mumbai, Maharashtra, India",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual profile update API call
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      Alert.alert("Success", "Your profile has been updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes?",
      "Are you sure you want to discard your changes?",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderFormField = (
    label: string,
    field: string,
    placeholder: string,
    icon: string,
    multiline = false,
    keyboardType: any = "default"
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
        <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>
          {label}
        </ThemedText>
      </View>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outline + "30",
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text,
              minHeight: multiline ? 80 : 48,
            },
          ]}
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <LinearGradient
        colors={["#2066c1ff", "#1a5ba8"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText style={[styles.headerTitle, { color: "white" }]}>
              Edit Profile
            </ThemedText>
            <ThemedText
              style={[
                styles.headerSubtitle,
                { color: "rgba(255,255,255,0.9)" },
              ]}
            >
              Update your personal information
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ThemedText style={styles.saveButtonText}>Saving...</ThemedText>
            ) : (
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Photo Section */}
      <View style={styles.photoSection}>
        <View style={styles.photoContainer}>
          {MOCK_DATA?.user?.avatar ? (
            <Image
              source={{ uri: MOCK_DATA.user.avatar }}
              style={styles.profilePhoto}
            />
          ) : (
            <View
              style={[
                styles.photoPlaceholder,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="person" size={60} color={colors.primary} />
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.changePhotoButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() =>
              Alert.alert("Photo Upload", "Photo upload coming soon!")
            }
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <ThemedText style={[styles.photoLabel, { color: colors.text }]}>
          Profile Photo
        </ThemedText>
        <ThemedText
          style={[styles.photoHint, { color: colors.onSurfaceVariant }]}
        >
          Tap the camera icon to change your photo
        </ThemedText>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Personal Information
        </ThemedText>

        {renderFormField(
          "Full Name",
          "fullName",
          "Enter your full name",
          "person-outline"
        )}
        {renderFormField(
          "Email",
          "email",
          "Enter your email",
          "mail-outline",
          false,
          "email-address"
        )}
        {renderFormField(
          "Phone",
          "phone",
          "Enter your phone number",
          "call-outline",
          false,
          "phone-pad"
        )}
        {renderFormField(
          "Date of Birth",
          "dateOfBirth",
          "YYYY-MM-DD",
          "calendar-outline"
        )}
        {renderFormField(
          "Gender",
          "gender",
          "Enter your gender",
          "male-female-outline"
        )}
        {renderFormField(
          "Address",
          "address",
          "Enter your address",
          "location-outline",
          true
        )}
      </View>

      {/* Section Separator */}
      <View
        style={[
          styles.sectionSeparator,
          { backgroundColor: colors.outline + "20" },
        ]}
      />

      {/* Medical Information */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Medical Information
        </ThemedText>

        {renderFormField(
          "Blood Group",
          "bloodGroup",
          "Enter your blood group",
          "water-outline"
        )}
        {renderFormField(
          "Height (cm)",
          "height",
          "Enter height in cm",
          "resize-outline",
          false,
          "numeric"
        )}
        {renderFormField(
          "Weight (kg)",
          "weight",
          "Enter weight in kg",
          "fitness-outline",
          false,
          "numeric"
        )}
        {renderFormField(
          "Allergies",
          "allergies",
          "List any allergies",
          "warning-outline",
          true
        )}
      </View>

      {/* Section Separator */}
      <View
        style={[
          styles.sectionSeparator,
          { backgroundColor: colors.outline + "20" },
        ]}
      />

      {/* Emergency Contact */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Emergency Contact
        </ThemedText>

        {renderFormField(
          "Emergency Contact",
          "emergencyContact",
          "Enter emergency contact number",
          "call-outline",
          false,
          "phone-pad"
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.cancelButton,
            { backgroundColor: colors.surface, borderColor: colors.outline },
          ]}
          onPress={handleCancel}
        >
          <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButtonLarge,
            { backgroundColor: colors.primary },
            isLoading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <ThemedText style={styles.saveButtonLargeText}>
            {isLoading ? "Saving..." : "Save Changes"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  photoSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  photoHint: {
    fontSize: 14,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionSeparator: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderRadius: 14,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonLarge: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonLargeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
