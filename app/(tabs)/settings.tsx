import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import { ThemedText } from "../../components/ThemedText";
import { supabase } from "../../lib/supabase";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;
  const { session } = useAuth();

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    locationServices: true,
    faceId: false,
    darkMode: colorScheme === "dark",
    dataSync: true,
    autoBackup: false,
    healthReminders: true,
    medicationAlerts: true,
    communityAlerts: true,
    emailNotifications: false,
    pushNotifications: true,
    twoFactorAuth: false,
  });

  const handleToggle = (setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            router.replace("/(auth)/login");
          }
        },
      },
    ]);
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    iconColor: string,
    settingKey?: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={settingKey ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <View
          style={[styles.settingIcon, { backgroundColor: iconColor + "20" }]}
        >
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.settingInfo}>
          <ThemedText style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </ThemedText>
          <ThemedText
            style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}
          >
            {subtitle}
          </ThemedText>
        </View>
      </View>
      {settingKey ? (
        <Switch
          value={settings[settingKey as keyof typeof settings]}
          onValueChange={() => handleToggle(settingKey)}
          trackColor={{
            false: colors.outline,
            true: iconColor + "40",
          }}
          thumbColor={
            settings[settingKey as keyof typeof settings]
              ? iconColor
              : colors.onSurfaceVariant
          }
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.onSurfaceVariant}
        />
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </ThemedText>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText style={[styles.headerTitle, { color: "white" }]}>
              Settings
            </ThemedText>
            <ThemedText
              style={[
                styles.headerSubtitle,
                { color: "rgba(255,255,255,0.9)" },
              ]}
            >
              Manage your preferences
            </ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Notifications */}
      <View style={styles.section}>
        {renderSectionHeader("Notifications", "notifications-outline")}

        {renderSettingItem(
          "Push Notifications",
          "Receive notifications on your device",
          "notifications",
          "#10B981",
          "pushNotifications"
        )}

        {renderSettingItem(
          "Health Reminders",
          "Get reminders for health check-ups",
          "heart",
          "#EF4444",
          "healthReminders"
        )}

        {renderSettingItem(
          "Medication Alerts",
          "Never miss your medication",
          "medical",
          "#8B5CF6",
          "medicationAlerts"
        )}

        {renderSettingItem(
          "Community Alerts",
          "Health alerts in your area",
          "people",
          "#F59E0B",
          "communityAlerts"
        )}

        {renderSettingItem(
          "Email Notifications",
          "Receive updates via email",
          "mail",
          "#3B82F6",
          "emailNotifications"
        )}
      </View>

      {/* Section Separator */}
      <View
        style={[
          styles.sectionSeparator,
          { backgroundColor: colors.outline + "20" },
        ]}
      />

      {/* Privacy & Security */}
      <View style={styles.section}>
        {renderSectionHeader("Privacy & Security", "shield-checkmark-outline")}

        {renderSettingItem(
          "Two-Factor Authentication",
          "Add an extra layer of security",
          "lock-closed",
          "#EF4444",
          "twoFactorAuth"
        )}

        {renderSettingItem(
          "Face ID / Touch ID",
          "Use biometrics to unlock app",
          "finger-print",
          "#10B981",
          "faceId"
        )}

        {renderSettingItem(
          "Data Privacy",
          "Manage your data preferences",
          "shield",
          "#6366F1",
          undefined,
          () =>
            Alert.alert("Data Privacy", "Data privacy settings coming soon!")
        )}

        {renderSettingItem(
          "Permissions",
          "Manage app permissions",
          "settings",
          "#F59E0B",
          undefined,
          () =>
            Alert.alert("Permissions", "App permissions settings coming soon!")
        )}
      </View>

      {/* Section Separator */}
      <View
        style={[
          styles.sectionSeparator,
          { backgroundColor: colors.outline + "20" },
        ]}
      />

      {/* App Preferences */}
      <View style={styles.section}>
        {renderSectionHeader("App Preferences", "settings-outline")}

        {renderSettingItem(
          "Location Services",
          "Allow location access for alerts",
          "location",
          "#10B981",
          "locationServices"
        )}

        {renderSettingItem(
          "Dark Mode",
          "Use dark theme",
          "moon",
          "#6366F1",
          "darkMode"
        )}

        {renderSettingItem(
          "Auto Backup",
          "Automatically backup health data",
          "cloud-upload",
          "#3B82F6",
          "autoBackup"
        )}

        {renderSettingItem(
          "Data Sync",
          "Sync data across devices",
          "sync",
          "#8B5CF6",
          "dataSync"
        )}

        {renderSettingItem(
          "Language",
          "Change app language",
          "language",
          "#F59E0B",
          undefined,
          () => Alert.alert("Language", "Language settings coming soon!")
        )}
      </View>

      {/* Section Separator */}
      <View
        style={[
          styles.sectionSeparator,
          { backgroundColor: colors.outline + "20" },
        ]}
      />

      {/* Support & About */}
      <View style={styles.section}>
        {renderSectionHeader("Support & About", "help-circle-outline")}

        {renderSettingItem(
          "Help Center",
          "Get help and support",
          "help-circle",
          "#10B981",
          undefined,
          () => Alert.alert("Help Center", "Help center coming soon!")
        )}

        {renderSettingItem(
          "Contact Support",
          "Reach out to our support team",
          "chatbubble-ellipses",
          "#3B82F6",
          undefined,
          () => Alert.alert("Contact Support", "Support contact coming soon!")
        )}

        {renderSettingItem(
          "Terms of Service",
          "Read our terms and conditions",
          "document-text",
          "#6366F1",
          undefined,
          () => Alert.alert("Terms of Service", "Terms of service coming soon!")
        )}

        {renderSettingItem(
          "Privacy Policy",
          "Learn about our privacy practices",
          "document",
          "#8B5CF6",
          undefined,
          () => Alert.alert("Privacy Policy", "Privacy policy coming soon!")
        )}

        {renderSettingItem(
          "About App",
          "Version 1.0.0 - Build 001",
          "information-circle",
          "#F59E0B",
          undefined,
          () =>
            Alert.alert(
              "About",
              "Aarogya AI v1.0.0\nUnified Healthcare AI Assistant"
            )
        )}
      </View>

      {/* Sign Out Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: "#EF4444" }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
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
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
