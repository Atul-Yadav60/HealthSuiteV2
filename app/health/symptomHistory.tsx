import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
} from "react-native";
import { GlassCard } from "../../components/ui/GlassCard";
import DefaultColors, { gradients, Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../hooks/useAuth";
import { SymptomLogService } from "../../services/SymptomLogService";
import { SymptomLog } from "../../types/symptomLogs";

export default function SymptomHistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "light"] || Colors;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadSymptomLogs();
  }, []);

  const loadSymptomLogs = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const logs = await SymptomLogService.getUserSymptomLogs(user.id);
      setSymptomLogs(logs);
    } catch (error) {
      console.error("Error loading symptom logs:", error);
      Alert.alert(
        "Error",
        "Failed to load your symptom history. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadSymptomLogs();
    setRefreshing(false);
  }, [user?.id]);

  const handleDeleteLog = (log: SymptomLog) => {
    Alert.alert(
      "Delete Symptom Log",
      `Are you sure you want to delete the log from ${SymptomLogService.formatFullLogDate(
        log.created_at
      )}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteLog(log.id),
        },
      ]
    );
  };

  const deleteLog = async (logId: string) => {
    if (!user?.id) return;

    try {
      const success = await SymptomLogService.deleteSymptomLog(user.id, logId);
      if (success) {
        setSymptomLogs((prev) => prev.filter((log) => log.id !== logId));
        Alert.alert("Success", "Symptom log deleted successfully.");
      } else {
        Alert.alert(
          "Error",
          "Failed to delete the symptom log. Please try again."
        );
      }
    } catch (error) {
      console.error("Error deleting symptom log:", error);
      Alert.alert(
        "Error",
        "Failed to delete the symptom log. Please try again."
      );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Mild":
        return "#10B981";
      case "Moderate":
        return "#F59E0B";
      case "Severe":
        return "#EF4444";
      default:
        return colors.primary;
    }
  };

  const getPainScaleColor = (scale: number | null) => {
    if (!scale) return colors.onSurfaceVariant;
    if (scale <= 3) return "#10B981"; // Green for mild
    if (scale <= 6) return "#F59E0B"; // Yellow for moderate
    return "#EF4444"; // Red for severe
  };

  const getPainScaleLabel = (scale: number | null) => {
    if (!scale) return "Not specified";
    if (scale <= 3) return "Mild Pain";
    if (scale <= 6) return "Moderate Pain";
    return "Severe Pain";
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Not specified";
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
    return "All day";
  };

  const renderSymptomLog = (log: SymptomLog) => (
    <GlassCard key={log.id} animated={true}>
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <Text style={[styles.logDate, { color: colors.text }]}>
              {SymptomLogService.formatLogDate(log.created_at)}
            </Text>
            <Text
              style={[styles.logFullDate, { color: colors.onSurfaceVariant }]}
            >
              {SymptomLogService.formatFullLogDate(log.created_at)}
            </Text>
          </View>
          <View style={styles.logHeaderRight}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(log.severity) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.severityText,
                  { color: getSeverityColor(log.severity) },
                ]}
              >
                {log.severity}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteLog(log)}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.symptomsContainer}>
          <Text style={[styles.symptomsLabel, { color: colors.text }]}>
            Symptoms ({log.symptoms.length})
          </Text>
          <View style={styles.symptomsList}>
            {log.symptoms.map((symptom, index) => (
              <View
                key={index}
                style={[
                  styles.symptomTag,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text
                  style={[styles.symptomTagText, { color: colors.primary }]}
                >
                  {symptom}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Details Row */}
        <View style={styles.detailsContainer}>
          {/* Pain Scale */}
          {log.pain_scale && (
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons
                  name="thermometer"
                  size={16}
                  color={getPainScaleColor(log.pain_scale)}
                />
                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Pain Scale
                </Text>
              </View>
              <View style={styles.painScaleDisplay}>
                <Text
                  style={[
                    styles.painScaleValue,
                    { color: getPainScaleColor(log.pain_scale) },
                  ]}
                >
                  {log.pain_scale}/10
                </Text>
                <Text
                  style={[
                    styles.painScaleDesc,
                    { color: getPainScaleColor(log.pain_scale) },
                  ]}
                >
                  {getPainScaleLabel(log.pain_scale)}
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          {log.location && (
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="body" size={16} color={colors.primary} />
                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Location
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {log.location}
              </Text>
            </View>
          )}

          {/* Duration */}
          {log.duration_minutes && (
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="time" size={16} color={colors.secondary} />
                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Duration
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDuration(log.duration_minutes)}
              </Text>
            </View>
          )}
        </View>

        {/* Triggers */}
        {log.triggers && log.triggers.length > 0 && (
          <View style={styles.triggersContainer}>
            <View style={styles.triggersHeader}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={[styles.triggersLabel, { color: colors.text }]}>
                Possible Triggers ({log.triggers.length})
              </Text>
            </View>
            <View style={styles.triggersList}>
              {log.triggers.map((trigger, index) => (
                <View
                  key={index}
                  style={[styles.triggerTag, { backgroundColor: "#F59E0B20" }]}
                >
                  <Text style={[styles.triggerTagText, { color: "#F59E0B" }]}>
                    {trigger}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {log.notes && (
          <View style={styles.notesContainer}>
            <Text style={[styles.notesLabel, { color: colors.text }]}>
              Notes
            </Text>
            <Text
              style={[styles.notesText, { color: colors.onSurfaceVariant }]}
            >
              {log.notes}
            </Text>
          </View>
        )}
      </View>
    </GlassCard>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={gradients.premium}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.greetingContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={[styles.greeting, { color: "white" }]}>
                Symptom History 📊
              </Text>
              <Text
                style={[styles.subtitle, { color: "rgba(255,255,255,0.8)" }]}
              >
                View your logged symptoms and trends
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Overview */}
        <GlassCard animated={true}>
          <View style={styles.statsContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Overview
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {symptomLogs.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.onSurfaceVariant }]}
                >
                  Total Logs
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {
                    symptomLogs.filter((log) => {
                      const logDate = new Date(log.created_at);
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return logDate >= oneWeekAgo;
                    }).length
                  }
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.onSurfaceVariant }]}
                >
                  This Week
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {new Set(symptomLogs.flatMap((log) => log.symptoms)).size}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.onSurfaceVariant }]}
                >
                  Unique Symptoms
                </Text>
              </View>
            </View>

            {/* Additional Enhanced Stats */}
            {symptomLogs.some((log) => log.pain_scale) && (
              <View style={styles.additionalStats}>
                <View style={styles.statDivider} />
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statNumber,
                        {
                          color: getPainScaleColor(
                            Math.round(
                              symptomLogs
                                .filter((log) => log.pain_scale)
                                .reduce(
                                  (sum, log) => sum + (log.pain_scale || 0),
                                  0
                                ) /
                                symptomLogs.filter((log) => log.pain_scale)
                                  .length
                            )
                          ),
                        },
                      ]}
                    >
                      {Math.round(
                        (symptomLogs
                          .filter((log) => log.pain_scale)
                          .reduce(
                            (sum, log) => sum + (log.pain_scale || 0),
                            0
                          ) /
                          symptomLogs.filter((log) => log.pain_scale).length) *
                          10
                      ) / 10}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Avg Pain Scale
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
                      {
                        new Set(
                          symptomLogs.flatMap((log) => log.triggers || [])
                        ).size
                      }
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Unique Triggers
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text
                      style={[styles.statNumber, { color: colors.secondary }]}
                    >
                      {
                        new Set(
                          symptomLogs
                            .filter((log) => log.location)
                            .map((log) => log.location)
                        ).size
                      }
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Body Areas
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Add New Log Button */}
        <TouchableOpacity
          style={[styles.addLogButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/health/logSymptoms")}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addLogButtonText}>Log New Symptoms</Text>
        </TouchableOpacity>

        {/* Symptom Logs List */}
        {isLoading ? (
          <GlassCard animated={true}>
            <View style={styles.loadingContainer}>
              <Text
                style={[styles.loadingText, { color: colors.onSurfaceVariant }]}
              >
                Loading your symptom history...
              </Text>
            </View>
          </GlassCard>
        ) : symptomLogs.length > 0 ? (
          <View style={styles.logsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Logs ({symptomLogs.length})
            </Text>
            {symptomLogs.map(renderSymptomLog)}
          </View>
        ) : (
          <GlassCard animated={true}>
            <View style={styles.emptyState}>
              <Ionicons
                name="medical"
                size={64}
                color={colors.onSurfaceVariant}
              />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No Symptoms Logged Yet
              </Text>
              <Text
                style={[
                  styles.emptyStateText,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Start tracking your symptoms to monitor your health over time
              </Text>
            </View>
          </GlassCard>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 18,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    padding: 18,
    gap: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsContainer: {
    padding: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 16,
  },
  additionalStats: {
    marginTop: 16,
  },
  addLogButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addLogButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  logsContainer: {
    gap: 16,
  },
  logCard: {
    padding: 4,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  logHeaderLeft: {
    flex: 1,
  },
  logDate: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  logFullDate: {
    fontSize: 14,
  },
  logHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  deleteButton: {
    padding: 8,
  },
  symptomsContainer: {
    marginBottom: 16,
  },
  symptomsLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  symptomsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  symptomTagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Enhanced Details Styles
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: "30%",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Pain Scale Styles
  painScaleDisplay: {
    alignItems: "flex-start",
  },
  painScaleValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  painScaleDesc: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
  // Triggers Styles
  triggersContainer: {
    marginBottom: 16,
  },
  triggersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  triggersLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  triggersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  triggerTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  triggerTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});
