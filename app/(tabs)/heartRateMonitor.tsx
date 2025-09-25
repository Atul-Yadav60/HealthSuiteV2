import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import MessageModal from "../../components/ui/MessageModal";
import DefaultColors, { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { bleService } from "../../services/BLEManager";

export default function HeartRateMonitorScreen() {
  const colorScheme = useColorScheme();
  const colors = DefaultColors[colorScheme ?? "dark"] || Colors;
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    bleService.requestPermissions().then((granted) => {
      setHasPermission(granted);
      if (!granted) {
        setModalMessage(
          "Bluetooth and location permissions are required to scan for devices."
        );
        setModalVisible(true);
      }
    });

    return () => {
      bleService.stopScan();
      if (connectedDevice) {
        bleService.disconnectFromDevice();
      }
    };
  }, [connectedDevice]);

  const handleScan = () => {
    if (!hasPermission) {
      setModalMessage(
        "Permissions not granted. Please enable them in your device settings."
      );
      setModalVisible(true);
      return;
    }
    if (isScanning) {
      bleService.stopScan();
      setIsScanning(false);
    } else {
      setDevices([]);
      setIsScanning(true);
      bleService.scanForDevices((device: Device) => {
        setDevices((prevDevices) => {
          if (!prevDevices.find((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      });
      setTimeout(() => {
        if (isScanning) {
          bleService.stopScan();
          setIsScanning(false);
        }
      }, 10000);
    }
  };

  const handleConnect = async (device: Device) => {
    setIsScanning(false);
    bleService.stopScan();
    try {
      const connected = await bleService.connectToDevice(device.id);
      setConnectedDevice(connected);
      bleService.monitorHeartRate((hr) => {
        setHeartRate(hr);
      });
    } catch (error: any) {
      setModalMessage(`Failed to connect: ${error.message}`);
      setModalVisible(true);
    }
  };

  const handleDisconnect = () => {
    bleService.stopHeartRateMonitoring();
    bleService.disconnectFromDevice();
    setConnectedDevice(null);
    setHeartRate(null);
    setDevices([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Glass Header */}
      <GlassCard style={styles.headerCard}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Ionicons name="heart" size={32} color={colors.error} />
          <Text style={[styles.title, { color: colors.text }]}>
            Heart Rate Monitor
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Connect your wearable device and track your heart rate live
        </Text>
      </GlassCard>

      {connectedDevice ? (
        <GlassCard style={styles.connectedCard}>
          <Text
            style={[styles.connectedText, { color: colors.onSurfaceVariant }]}
          >
            Connected to
          </Text>
          <Text style={[styles.deviceName, { color: colors.text }]}>
            {connectedDevice.name || "Unnamed Device"}
          </Text>
          <View style={styles.hrContainer}>
            <Ionicons name="heart" size={80} color={colors.error} />
            <Text style={[styles.hrText, { color: colors.text }]}>
              {heartRate ?? "--"}
            </Text>
            <Text style={[styles.hrUnit, { color: colors.onSurfaceVariant }]}>
              BPM
            </Text>
          </View>
          <GradientButton
            title="Disconnect"
            onPress={handleDisconnect}
            variant="error"
          />
        </GlassCard>
      ) : (
        <View style={styles.disconnectedView}>
          <GradientButton
            title={isScanning ? "Stop Scan" : "Scan for Devices"}
            onPress={handleScan}
            loading={isScanning}
            style={styles.scanButton}
          />
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GlassCard
                style={styles.deviceCard}
                onPress={() => handleConnect(item)}
              >
                <Text style={[styles.deviceText, { color: colors.text }]}>
                  {item.name || "Unnamed Device"}
                </Text>
                <Ionicons name="bluetooth" size={24} color={colors.primary} />
              </GlassCard>
            )}
            contentContainerStyle={{ paddingTop: 20 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                {isScanning ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <Text style={{ color: colors.onSurfaceVariant }}>
                    No devices found. Tap scan to begin.
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      )}

      <MessageModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
        title="Bluetooth Error"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: {
    margin: 18,
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  backButton: { padding: 8 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5,
    opacity: 0.8,
  },
  connectedCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 24,
    alignItems: "center",
  },
  connectedText: { fontSize: 18 },
  deviceName: { fontSize: 24, fontWeight: "bold", marginVertical: 8 },
  hrContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  hrText: { fontSize: 72, fontWeight: "bold", marginTop: 8 },
  hrUnit: { fontSize: 20 },
  disconnectedView: { flex: 1, padding: 20 },
  scanButton: { marginBottom: 10 },
  deviceCard: {
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceText: { fontSize: 18, fontWeight: "500" },
  emptyContainer: { marginTop: 50, alignItems: "center" },
});
