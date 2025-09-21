import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { MOCK_DATA } from '../../constants/AppConfig';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return colors.success;
      case 'moderate':
        return colors.warning;
      case 'severe':
        return colors.error;
      default:
        return colors.info;
    }
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1:
        return '😢';
      case 2:
        return '😕';
      case 3:
        return '😐';
      case 4:
        return '🙂';
      case 5:
        return '😊';
      default:
        return '😐';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          My Health
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Your health journey in one place
        </Text>
      </View>

      {/* Health Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Health Summary
        </Text>
        <View style={styles.summaryGrid}>
          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="camera" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {MOCK_DATA.recentScans.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Skin Scans
            </Text>
          </GlassCard>

          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="heart" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {MOCK_DATA.moodData.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Mood Checks
            </Text>
          </GlassCard>

          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="calendar" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {MOCK_DATA.medications.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Medications
            </Text>
          </GlassCard>

          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="shield-checkmark" size={24} color={colors.info} />
            </View>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              3
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Verifications
            </Text>
          </GlassCard>
        </View>
      </View>

      {/* Recent Scans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Scans
          </Text>
          <TouchableOpacity onPress={() => router.push('/modules/skinAI')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              New Scan
            </Text>
          </TouchableOpacity>
        </View>
        <GlassCard style={styles.listCard}>
          {MOCK_DATA.recentScans.map((scan) => (
            <TouchableOpacity
              key={scan.id}
              style={styles.listItem}
              onPress={() => router.push(`/modules/skinAI/result/${scan.id}`)}
            >
              <View style={styles.listItemContent}>
                <View style={styles.listItemInfo}>
                  <Text style={[styles.listItemTitle, { color: colors.text }]}>
                    {scan.condition}
                  </Text>
                  <Text style={[styles.listItemSubtitle, { color: colors.onSurfaceVariant }]}>
                    {scan.date} • {Math.round(scan.confidence * 100)}% confidence
                  </Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(scan.severity) + '20' }]}>
                  <Text style={[styles.severityText, { color: getSeverityColor(scan.severity) }]}>
                    {scan.severity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </GlassCard>
      </View>

      {/* Mood & Wellness */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mood & Wellness
          </Text>
          <TouchableOpacity onPress={() => router.push('/modules/healMind')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              Check In
            </Text>
          </TouchableOpacity>
        </View>
        <GlassCard style={styles.listCard}>
          {MOCK_DATA.moodData.slice(-3).reverse().map((entry, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <View style={styles.listItemInfo}>
                  <Text style={[styles.listItemTitle, { color: colors.text }]}>
                    {getMoodEmoji(entry.mood)} {entry.date}
                  </Text>
                  <Text style={[styles.listItemSubtitle, { color: colors.onSurfaceVariant }]}>
                    Sleep: {entry.sleep}h • Steps: {entry.steps.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.moodScore}>
                  <Text style={[styles.moodScoreText, { color: colors.text }]}>
                    {entry.mood}/5
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </GlassCard>
      </View>

      {/* Medications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Medications
          </Text>
          <TouchableOpacity onPress={() => router.push('/modules/medPlanner')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              Manage
            </Text>
          </TouchableOpacity>
        </View>
        <GlassCard style={styles.listCard}>
          {MOCK_DATA.medications.map((med) => (
            <View key={med.id} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <View style={styles.listItemInfo}>
                  <Text style={[styles.listItemTitle, { color: colors.text }]}>
                    {med.name}
                  </Text>
                  <Text style={[styles.listItemSubtitle, { color: colors.onSurfaceVariant }]}>
                    {med.dosage} • {med.time}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: med.status === 'taken' ? colors.success + '20' : colors.warning + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: med.status === 'taken' ? colors.success : colors.warning }
                  ]}>
                    {med.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </GlassCard>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  listCard: {
    padding: 16,
  },
  listItem: {
    marginBottom: 16,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  moodScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  moodScoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
