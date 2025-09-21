import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { MOCK_DATA } from '../../constants/AppConfig';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const menuItems = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: 'person',
      color: colors.primary,
      onPress: () => console.log('Personal Information'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      color: colors.secondary,
      onPress: () => console.log('Notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-checkmark',
      color: colors.accent,
      onPress: () => console.log('Privacy & Security'),
    },
    {
      id: 'language',
      title: 'Language',
      icon: 'language',
      color: colors.info,
      onPress: () => console.log('Language'),
    },
    {
      id: 'permissions',
      title: 'Permissions',
      icon: 'settings',
      color: colors.warning,
      onPress: () => console.log('Permissions'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle',
      color: colors.success,
      onPress: () => console.log('Help & Support'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle',
      color: colors.error,
      onPress: () => console.log('About'),
    },
  ];

  const handleSignOut = () => {
    // Handle sign out
    router.replace('/');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Profile
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Manage your account and preferences
        </Text>
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <GlassCard style={styles.userCard}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: MOCK_DATA.user.avatar }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {MOCK_DATA.user.name}
              </Text>
              <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>
                {MOCK_DATA.user.email}
              </Text>
              <Text style={[styles.userRegion, { color: colors.onSurfaceVariant }]}>
                {MOCK_DATA.user.region}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.outline }]}
              onPress={() => console.log('Edit Profile')}
            >
              <Ionicons name="pencil" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>

      {/* Quick Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Settings
        </Text>
        <GlassCard style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.outline, true: colors.primary + '40' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.onSurfaceVariant}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={24} color={colors.secondary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Location Services
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.outline, true: colors.secondary + '40' }}
              thumbColor={locationEnabled ? colors.secondary : colors.onSurfaceVariant}
            />
          </View>
        </GlassCard>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Settings
        </Text>
        <GlassCard style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && { borderBottomColor: colors.outline, borderBottomWidth: 1 }
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </GlassCard>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.error }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>
            Sign Out
          </Text>
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userCard: {
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userRegion: {
    fontSize: 14,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCard: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
