// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import React, { useState } from "react";
// import {
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Alert,
//   Platform,
// } from "react-native";
// import { GlassCard } from "../../components/ui/GlassCard";
// import { MOCK_DATA } from "../../constants/AppConfig";
// import Colors from "../../constants/Colors";
// import { useColorScheme } from "../../hooks/useColorScheme";

// export default function HealthScreen() {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? "dark"];
//   const [refreshing, setRefreshing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [downloadProgress, setDownloadProgress] = useState(0);

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 2000);
//   }, []);

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case "mild":
//         return colors.success;
//       case "moderate":
//         return colors.warning;
//       case "severe":
//         return colors.error;
//       default:
//         return colors.info;
//     }
//   };

//   const getMoodEmoji = (mood: number) => {
//     switch (mood) {
//       case 1:
//         return "😢";
//       case 2:
//         return "😕";
//       case 3:
//         return "😐";
//       case 4:
//         return "🙂";
//       case 5:
//         return "😊";
//       default:
//         return "😐";
//     }
//   };

//   // Download section - Simplified version without external dependencies
//   const handleDownload = async () => {
//     setIsLoading(true);
//     setDownloadProgress(0);

//     // Simulate download process
//     const progressInterval = setInterval(() => {
//       setDownloadProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(progressInterval);
//           setIsLoading(false);
//           Alert.alert(
//             "Download Complete",
//             "Your health summary has been prepared successfully."
//           );
//           return 100;
//         }
//         return prev + 10;
//       });
//     }, 200);
//   };

//   return (
//     <ScrollView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       contentContainerStyle={styles.content}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//       }
//     >
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={[styles.title, { color: colors.text }]}>My Health</Text>
//         <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
//           Your health journey in one place
//         </Text>
//       </View>

//       {/* Health Summary */}
//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, { color: colors.text }]}>
//           Health Summary
//         </Text>
//         <View style={styles.summaryGrid}>
//           <GlassCard style={styles.summaryCard}>
//             <View
//               style={[
//                 styles.summaryIcon,
//                 { backgroundColor: colors.primary + "20" },
//               ]}
//             >
//               <Ionicons name="camera" size={24} color={colors.primary} />
//             </View>
//             <Text style={[styles.summaryNumber, { color: colors.text }]}>
//               {MOCK_DATA.recentScans.length}
//             </Text>
//             <Text
//               style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}
//             >
//               Skin Scans
//             </Text>
//           </GlassCard>

//           <GlassCard style={styles.summaryCard}>
//             <View
//               style={[
//                 styles.summaryIcon,
//                 { backgroundColor: colors.secondary + "20" },
//               ]}
//             >
//               <Ionicons name="heart" size={24} color={colors.secondary} />
//             </View>
//             <Text style={[styles.summaryNumber, { color: colors.text }]}>
//               {MOCK_DATA.moodData.length}
//             </Text>
//             <Text
//               style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}
//             >
//               Mood Checks
//             </Text>
//           </GlassCard>

//           <GlassCard style={styles.summaryCard}>
//             <View
//               style={[
//                 styles.summaryIcon,
//                 { backgroundColor: colors.accent + "20" },
//               ]}
//             >
//               <Ionicons name="calendar" size={24} color={colors.accent} />
//             </View>
//             <Text style={[styles.summaryNumber, { color: colors.text }]}>
//               {MOCK_DATA.medications.length}
//             </Text>
//             <Text
//               style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}
//             >
//               Medications
//             </Text>
//           </GlassCard>

//           <TouchableOpacity
//             onPress={() => router.push("/trustMed")}
//             style={styles.summaryCardTouchable}
//           >
//             <GlassCard style={styles.summaryCard}>
//               <View
//                 style={[
//                   styles.summaryIcon,
//                   { backgroundColor: colors.info + "20" },
//                 ]}
//               >
//                 <Ionicons
//                   name="shield-checkmark"
//                   size={24}
//                   color={colors.info}
//                 />
//               </View>
//               <Text
//                 style={[
//                   styles.summaryNumber,
//                   { color: colors.text, fontSize: 20 },
//                 ]}
//               >
//                 TrustMed AI
//               </Text>
//               <Text
//                 style={[
//                   styles.summaryLabel,
//                   { color: colors.onSurfaceVariant },
//                 ]}
//               >
//                 Verifications
//               </Text>
//             </GlassCard>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Recent Scans */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Side Effect Journal
//           </Text>
//         </View>
//         <GlassCard style={styles.listCard}>
//           {MOCK_DATA.recentScans.map((scan) => (
//             <TouchableOpacity
//               key={scan.id}
//               style={styles.listItem}
//               onPress={() => router.push(`/modules/skinAI/result/${scan.id}`)}
//             >
//               <View style={styles.listItemContent}>
//                 <View style={styles.listItemInfo}>
//                   <Text style={[styles.listItemTitle, { color: colors.text }]}>
//                     {scan.condition}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.listItemSubtitle,
//                       { color: colors.onSurfaceVariant },
//                     ]}
//                   >
//                     {scan.date} • {Math.round(scan.confidence * 100)}%
//                     confidence
//                   </Text>
//                 </View>
//                 <View
//                   style={[
//                     styles.severityBadge,
//                     { backgroundColor: getSeverityColor(scan.severity) + "20" },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.severityText,
//                       { color: getSeverityColor(scan.severity) },
//                     ]}
//                   >
//                     {scan.severity}
//                   </Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </GlassCard>
//       </View>

//       {/* Mood & Wellness */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Allergic Conditions
//           </Text>
//         </View>
//         <GlassCard style={styles.listCard}>
//           {MOCK_DATA.moodData
//             .slice(-3)
//             .reverse()
//             .map((entry, index) => (
//               <View key={index} style={styles.listItem}>
//                 <View style={styles.listItemContent}>
//                   <View style={styles.listItemInfo}>
//                     <Text
//                       style={[styles.listItemTitle, { color: colors.text }]}
//                     >
//                       {getMoodEmoji(entry.mood)} {entry.date}
//                     </Text>
//                     <Text
//                       style={[
//                         styles.listItemSubtitle,
//                         { color: colors.onSurfaceVariant },
//                       ]}
//                     >
//                       Sleep: {entry.sleep}h • Steps:{" "}
//                       {entry.steps.toLocaleString()}
//                     </Text>
//                   </View>
//                   <View style={styles.moodScore}>
//                     <Text
//                       style={[styles.moodScoreText, { color: colors.text }]}
//                     >
//                       {entry.mood}/5
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             ))}
//         </GlassCard>
//       </View>

//       {/* Medications */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Medications
//           </Text>
//           <TouchableOpacity onPress={() => router.push("/modules/medPlanner")}>
//             <Text style={[styles.seeAllText, { color: colors.primary }]}>
//               Manage
//             </Text>
//           </TouchableOpacity>
//         </View>
//         <GlassCard style={styles.listCard}>
//           {MOCK_DATA.medications.map((med) => (
//             <View key={med.id} style={styles.listItem}>
//               <View style={styles.listItemContent}>
//                 <View style={styles.listItemInfo}>
//                   <Text style={[styles.listItemTitle, { color: colors.text }]}>
//                     {med.name}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.listItemSubtitle,
//                       { color: colors.onSurfaceVariant },
//                     ]}
//                   >
//                     {med.dosage} • {med.time}
//                   </Text>
//                 </View>
//                 <View
//                   style={[
//                     styles.statusBadge,
//                     {
//                       backgroundColor:
//                         med.status === "taken"
//                           ? colors.success + "20"
//                           : colors.warning + "20",
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.statusText,
//                       {
//                         color:
//                           med.status === "taken"
//                             ? colors.success
//                             : colors.warning,
//                       },
//                     ]}
//                   >
//                     {med.status}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           ))}
//         </GlassCard>
//       </View>

//       {/* Download Button */}
//       <View style={styles.section}>
//         <TouchableOpacity
//           style={[styles.downloadButton, { backgroundColor: colors.primary }]}
//           onPress={handleDownload}
//           disabled={isLoading}
//         >
//           <Text style={styles.buttonText}>
//             {isLoading
//               ? `Downloading... ${downloadProgress}%`
//               : "Download Health Summary"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     paddingBottom: 40,
//   },
//   header: {
//     paddingHorizontal: 24,
//     paddingTop: 50,
//     paddingBottom: 16,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     opacity: 0.8,
//   },
//   section: {
//     paddingHorizontal: 24,
//     marginTop: 24,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     paddingBottom: 8,
//   },
//   seeAllText: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   summaryGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
//   summaryCard: {
//     width: "48%",
//     padding: 16,
//     alignItems: "center",
//   },
//   summaryCardTouchable: {
//     width: "48%",
//   },
//   summaryIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
//   summaryNumber: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     textAlign: "center",
//   },
//   listCard: {
//     padding: 16,
//   },
//   listItem: {
//     marginBottom: 16,
//   },
//   listItemContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   listItemInfo: {
//     flex: 1,
//   },
//   listItemTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   listItemSubtitle: {
//     fontSize: 14,
//   },
//   severityBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   severityText: {
//     fontSize: 12,
//     fontWeight: "600",
//     textTransform: "capitalize",
//   },
//   moodScore: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//   },
//   moodScoreText: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//     textTransform: "capitalize",
//   },
//   downloadButton: {
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });


import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { GlassCard } from "../../components/ui/GlassCard";
import { MOCK_DATA } from "../../constants/AppConfig";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

// Mock data for health metrics
const HEALTH_DATA = {
  bloodPressure: "120/80",
  steps: "8,542",
  heartRate: "72",
  documents: 5,
  appointments: [
    {
      id: 1,
      doctor: "Dr. Smith",
      date: "Dec 15",
      time: "10:00 AM",
      type: "Checkup",
    },
    {
      id: 2,
      doctor: "Dermatologist",
      date: "Dec 20",
      time: "2:30 PM",
      type: "Follow-up",
    },
  ],
  sideEffects: [
    {
      id: 1,
      medication: "Medication A",
      effect: "Headache",
      date: "Dec 10",
      severity: "Mild",
    },
    {
      id: 2,
      medication: "Medication B",
      effect: "Nausea",
      date: "Dec 12",
      severity: "Moderate",
    },
  ],
  allergies: [
    { id: 1, type: "Drug", name: "Penicillin", severity: "Severe" },
    { id: 2, type: "Food", name: "Shellfish", severity: "Moderate" },
    { id: 3, type: "Environmental", name: "Pollen", severity: "Mild" },
  ],
  conditions: [
    { id: 1, name: "Hypertension", diagnosed: "2020", status: "Managed" },
    { id: 2, name: "Type 2 Diabetes", diagnosed: "2021", status: "Controlled" },
  ],
};

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return colors.success;
      case "moderate":
        return colors.warning;
      case "severe":
        return colors.error;
      default:
        return colors.info;
    }
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1:
        return "😢";
      case 2:
        return "😕";
      case 3:
        return "😐";
      case 4:
        return "🙂";
      case 5:
        return "😊";
      default:
        return "😐";
    }
  };

  // Download section - Simplified version without external dependencies
  const handleDownload = async () => {
    setIsLoading(true);
    setDownloadProgress(0);

    // Simulate download process
    const progressInterval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsLoading(false);
          Alert.alert(
            "Download Complete",
            "Your health summary has been prepared successfully."
          );
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const HealthMetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    onPress,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.metricCard}>
      <GlassCard style={[styles.metricCardContent, { borderLeftColor: color }]}>
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {value}
          </Text>
        </View>
        <Text style={[styles.metricTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.metricSubtitle, { color: colors.onSurfaceVariant }]}
        >
          {subtitle}
        </Text>
      </GlassCard>
    </TouchableOpacity>
  );

  const ListItem = ({
    title,
    subtitle,
    rightText,
    rightColor,
    onPress,
  }: {
    title: string;
    subtitle: string;
    rightText?: string;
    rightColor?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemContent}>
        <View style={styles.listItemInfo}>
          <Text style={[styles.listItemTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text
            style={[
              styles.listItemSubtitle,
              { color: colors.onSurfaceVariant },
            ]}
          >
            {subtitle}
          </Text>
        </View>
        {rightText && (
          <View
            style={[styles.rightBadge, { backgroundColor: rightColor + "20" }]}
          >
            <Text style={[styles.rightText, { color: rightColor }]}>
              {rightText}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={[styles.title, { color: colors.text }]}>My Health</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Your health journey in one place
        </Text>
      </View>

      {/* Health Summary Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Health Summary
        </Text>
        <View style={styles.metricsGrid}>
          <HealthMetricCard
            title="Blood Pressure"
            value={HEALTH_DATA.bloodPressure}
            subtitle="Last checked: Today"
            icon="pulse-outline"
            color={colors.primary}
            onPress={() => router.push("/health/coming-soon")}
          />
          <HealthMetricCard
            title="Steps"
            value={HEALTH_DATA.steps}
            subtitle="Today's steps"
            icon="walk-outline"
            color={colors.secondary}
            onPress={() => router.push("/health/coming-soon")}
          />
          <HealthMetricCard
            title="Heart Rate"
            value={HEALTH_DATA.heartRate}
            subtitle="BPM - Resting"
            icon="heart-outline"
            color={colors.error}
            onPress={() => router.push("/health/coming-soon")}
          />
          <HealthMetricCard
            title="Document Vault"
            value={`${HEALTH_DATA.documents} files`}
            subtitle="Secure storage"
            icon="document-lock-outline"
            color={colors.info}
            onPress={() => router.push("/health/coming-soon")}
          />
        </View>
      </View>

      {/* Appointments & Records Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appointments & Records
          </Text>
          <TouchableOpacity onPress={() => router.push("/health/coming-soon")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.sectionDescription,
            { color: colors.onSurfaceVariant },
          ]}
        >
          Manage your healthcare logistics
        </Text>

        <GlassCard style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Appointment Manager
            </Text>
          </View>
          <Text
            style={[
              styles.featureDescription,
              { color: colors.onSurfaceVariant },
            ]}
          >
            Track upcoming doctor visits, lab tests, and procedures
          </Text>
          {HEALTH_DATA.appointments.slice(0, 2).map((appt) => (
            <ListItem
              key={appt.id}
              title={appt.doctor}
              subtitle={`${appt.date} • ${appt.time} - ${appt.type}`}
              rightText="Upcoming"
              rightColor={colors.success}
              onPress={() => router.push("/health/coming-soon")}
            />
          ))}
        </GlassCard>

        <GlassCard style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Ionicons name="business-outline" size={24} color={colors.accent} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Doctor & Pharmacy Directory
            </Text>
          </View>
          <Text
            style={[
              styles.featureDescription,
              { color: colors.onSurfaceVariant },
            ]}
          >
            Store contact information for healthcare providers
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/health/coming-soon")}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>
              Add Healthcare Provider
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </View>

      {/* Side Effect Journal Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Side Effect Journal
          </Text>
          <TouchableOpacity onPress={() => router.push("/health/coming-soon")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.sectionDescription,
            { color: colors.onSurfaceVariant },
          ]}
        >
          Log side effects from medications
        </Text>

        <GlassCard style={styles.featureCard}>
          {HEALTH_DATA.sideEffects.map((effect) => (
            <ListItem
              key={effect.id}
              title={effect.medication}
              subtitle={`${effect.effect} • ${effect.date}`}
              rightText={effect.severity}
              rightColor={
                effect.severity === "Mild"
                  ? colors.success
                  : effect.severity === "Moderate"
                  ? colors.warning
                  : colors.error
              }
              onPress={() => router.push("/health/coming-soon")}
            />
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/health/coming-soon")}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>
              Log New Side Effect
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </View>

      {/* Allergic Conditions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Allergic Conditions
          </Text>
          <TouchableOpacity onPress={() => router.push("/health/coming-soon")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.sectionDescription,
            { color: colors.onSurfaceVariant },
          ]}
        >
          Allergies and medical conditions
        </Text>

        <GlassCard style={styles.featureCard}>
          <View style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: colors.text }]}>
              Allergies
            </Text>
            {HEALTH_DATA.allergies.map((allergy) => (
              <ListItem
                key={allergy.id}
                title={allergy.name}
                subtitle={`${allergy.type} • ${allergy.severity}`}
                rightText={allergy.severity}
                rightColor={
                  allergy.severity === "Mild"
                    ? colors.success
                    : allergy.severity === "Moderate"
                    ? colors.warning
                    : colors.error
                }
                onPress={() => router.push("/health/coming-soon")}
              />
            ))}
          </View>

          <View style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: colors.text }]}>
              Medical Conditions
            </Text>
            {HEALTH_DATA.conditions.map((condition) => (
              <ListItem
                key={condition.id}
                title={condition.name}
                subtitle={`Diagnosed: ${condition.diagnosed}`}
                rightText={condition.status}
                rightColor={colors.success}
                onPress={() => router.push("/health/coming-soon")}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/health/coming-soon")}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>
              Add New Record
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </View>

      {/* Download Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: colors.primary }]}
          onPress={handleDownload}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading
              ? `Downloading... ${downloadProgress}%`
              : "Download Health Summary"}
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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    marginBottom: 12,
  },
  metricCardContent: {
    padding: 16,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  featureCard: {
    padding: 16,
    marginBottom: 16,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  featureDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  listItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  rightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rightText: {
    fontSize: 12,
    fontWeight: "600",
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  downloadButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
