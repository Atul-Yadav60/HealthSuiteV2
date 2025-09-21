import { Ionicons } from '@expo/vector-icons';
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

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return 'medical';
      case 'community':
        return 'notifications';
      case 'followup':
        return 'calendar';
      default:
        return 'information-circle';
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const handleAlertAction = (alert: any, action: string) => {
    // Handle alert actions
    console.log(`Alert ${alert.id}: ${action}`);
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
          Alerts
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Stay informed about your health
        </Text>
      </View>

      {/* Alert Summary */}
      <View style={styles.section}>
        <View style={styles.summaryContainer}>
          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="warning" size={24} color={colors.error} />
            </View>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {MOCK_DATA.alerts.filter(a => a.priority === 'high').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              High Priority
            </Text>
          </GlassCard>

          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="notifications" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {MOCK_DATA.alerts.filter(a => a.priority === 'medium').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Medium Priority
            </Text>
          </GlassCard>

          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="information-circle" size={24} color={colors.info} />
            </View>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {MOCK_DATA.alerts.filter(a => a.priority === 'low').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Low Priority
            </Text>
          </GlassCard>
        </View>
      </View>

      {/* Alerts List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Alerts
        </Text>
        <View style={styles.alertsContainer}>
          {MOCK_DATA.alerts.map((alert) => (
            <GlassCard key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertIconContainer}>
                  <Ionicons
                    name={getAlertIcon(alert.type) as any}
                    size={24}
                    color={getAlertColor(alert.priority)}
                  />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {alert.title}
                  </Text>
                  <Text style={[styles.alertTime, { color: colors.onSurfaceVariant }]}>
                    {alert.time}
                  </Text>
                </View>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getAlertColor(alert.priority) + '20' }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: getAlertColor(alert.priority) }
                  ]}>
                    {alert.priority}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.alertMessage, { color: colors.onSurfaceVariant }]}>
                {alert.message}
              </Text>

              {alert.actions && alert.actions.length > 0 && (
                <View style={styles.alertActions}>
                  {alert.actions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionButton,
                        { borderColor: colors.outline }
                      ]}
                      onPress={() => handleAlertAction(alert, action)}
                    >
                      <Text style={[styles.actionText, { color: colors.text }]}>
                        {action}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </GlassCard>
          ))}
        </View>
      </View>

      {/* Empty State */}
      {MOCK_DATA.alerts.length === 0 && (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="notifications-off" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No alerts yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
  You&apos;ll see important notifications here
</Text>

        </View>
      )}
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
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
  alertsContainer: {
    gap: 16,
  },
  alertCard: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
