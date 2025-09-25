import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { QuickActionButton } from "../../components/ui/QuickActionButton";
import { MOCK_DATA } from "../../constants/AppConfig";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import { supabase } from "../../lib/supabase";
import { ThemedText } from "../../components/ThemedText";

// Quick Actions for profile
const PROFILE_ACTIONS = [
  {
    id: "edit",
    title: "Edit Profile",
    icon: "person-outline",
    color: "#10B981",
  },
  {
    id: "settings",
    title: "Settings",
    icon: "settings-outline",
    color: "#6366F1",
  },
  {
    id: "help",
    title: "Help",
    icon: "help-circle-outline",
    color: "#F59E0B",
  },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;
  const { session } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const menuItems = [
    {
      id: "personal",
      title: "Personal Information",
      icon: "person",
      color: colors.primary,
      onPress: () => alert("Edit Personal Information coming soon!"),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "notifications",
      color: colors.secondary,
      onPress: () => alert("Notification Settings coming soon!"),
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: "shield-checkmark",
      color: colors.accent,
      onPress: () => alert("Privacy & Security coming soon!"),
    },
    {
      id: "language",
      title: "Language",
      icon: "language",
      color: colors.info,
      onPress: () => alert("Language settings coming soon!"),
    },
    {
      id: "permissions",
      title: "Permissions",
      icon: "settings",
      color: colors.warning,
      onPress: () => alert("Permissions settings coming soon!"),
    },
    {
      id: "help",
      title: "Help & Support",
      icon: "help-circle",
      color: colors.success,
      onPress: () => alert("Help & Support coming soon!"),
    },
    {
      id: "about",
      title: "About",
      icon: "information-circle",
      color: colors.error,
      onPress: () => alert("About coming soon!"),
    },
  ];

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Error Signing Out", error.message);
    } else {
      router.replace("/(auth)/login");
    }
  };

  // Loading state - Remove session dependency to fix loading issue
  // if (!session) {
  //   return (
  //     <View
  //       style={[
  //         styles.container,
  //         { backgroundColor: colors.background, justifyContent: "center" },
  //       ]}
  //     >
  //       <Text style={{ color: colors.text, textAlign: "center" }}>
  //         Loading profile...
  //       </Text>
  //     </View>
  //   );
  // }

  // Use mock data or session data if available
  const userEmail = session?.user?.email || "user@healthsuite.com";
  const userName =
    session?.user?.user_metadata?.full_name ||
    MOCK_DATA?.user?.name ||
    "John Doe";

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
        <ThemedText style={[styles.greeting, { color: "white" }]}>
          Profile
        </ThemedText>
        <ThemedText
          style={[styles.subtitle, { color: "rgba(255,255,255,0.9)" }]}
        >
          Manage your account
        </ThemedText>
      </LinearGradient>

      {/* User Info Card */}
      <View style={styles.section}>
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={styles.userInfo}>
            {MOCK_DATA?.user?.avatar ? (
              <Image
                source={{ uri: MOCK_DATA.user.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
            )}
            <View style={styles.userDetails}>
              <ThemedText style={[styles.userName, { color: colors.text }]}>
                {userName}
              </ThemedText>
              <ThemedText
                style={[styles.userEmail, { color: colors.onSurfaceVariant }]}
              >
                {userEmail}
              </ThemedText>
              <ThemedText
                style={[styles.userRegion, { color: colors.onSurfaceVariant }]}
              >
                {MOCK_DATA?.user?.region || "Mumbai, India"}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </ThemedText>
        <View style={styles.quickActionsGrid}>
          {PROFILE_ACTIONS.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onPress={() => alert(`${action.title} coming soon!`)}
              style={styles.quickAction}
            />
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Preferences
        </ThemedText>
        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#10B981"
              />
              <ThemedText style={[styles.settingTitle, { color: colors.text }]}>
                Notifications
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: colors.outline,
                true: colors.primary + "40",
              }}
              thumbColor={
                notificationsEnabled ? colors.primary : colors.onSurfaceVariant
              }
            />
          </View>
          <View
            style={[
              styles.settingItem,
              styles.settingBorder,
              { borderTopColor: colors.outline },
            ]}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="location-outline" size={24} color="#6366F1" />
              <ThemedText style={[styles.settingTitle, { color: colors.text }]}>
                Location Services
              </ThemedText>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{
                false: colors.outline,
                true: colors.secondary + "40",
              }}
              thumbColor={
                locationEnabled ? colors.secondary : colors.onSurfaceVariant
              }
            />
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: "#FF5757" }]}
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
  container: { flex: 1 },
  content: { paddingBottom: 30 },
  header: {
    paddingTop:40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  greeting: {
    paddingTop:12,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  userCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 24,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userRegion: {
    fontSize: 14,
  },
  quickActionsContainer: {
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  quickAction: {
    flex: 1,
  },
  settingsCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingBorder: {
    borderTopWidth: 1,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
