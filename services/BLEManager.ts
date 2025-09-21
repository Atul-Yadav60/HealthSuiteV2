import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { PermissionsAndroid, Platform } from "react-native";

const HEART_RATE_SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC_UUID = "00002a37-0000-1000-8000-00805f9b34fb";

class BLEService {
  private manager: BleManager;
  private device: Device | null = null;
  private heartRateSubscription: Subscription | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "android") {
      const apiLevel = Platform.Version;
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth scanning requires location permission.",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, // Corrected typo here
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          granted["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return true;
  }

  scanForDevices(onDeviceFound: (device: Device) => void) {
    this.manager.startDeviceScan(
      [HEART_RATE_SERVICE_UUID],
      null,
      (error, device) => {
        if (error) {
          console.error("Scan error:", error);
          return;
        }
        if (device) {
          onDeviceFound(device);
        }
      }
    );
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  async connectToDevice(deviceId: string): Promise<Device> {
    this.stopScan();
    const connectedDevice = await this.manager.connectToDevice(deviceId);
    this.device = await connectedDevice.discoverAllServicesAndCharacteristics();
    return this.device;
  }

  async disconnectFromDevice() {
    if (this.device) {
      await this.manager.cancelDeviceConnection(this.device.id);
      this.device = null;
    }
  }

  monitorHeartRate(onHeartRateUpdate: (heartRate: number) => void) {
    if (!this.device) {
      throw new Error("No device connected.");
    }

    this.heartRateSubscription = this.manager.monitorCharacteristicForDevice(
      this.device.id,
      HEART_RATE_SERVICE_UUID,
      HEART_RATE_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.error("Heart rate monitor error:", error);
          return;
        }
        if (characteristic?.value) {
          const heartRate = this.decodeHeartRate(characteristic.value);
          onHeartRateUpdate(heartRate);
        }
      }
    );
  }

  stopHeartRateMonitoring() {
    this.heartRateSubscription?.remove();
    this.heartRateSubscription = null;
  }

  // The heart rate is encoded in a specific way by the BLE standard.
  private decodeHeartRate(encodedValue: string): number {
    const buffer = Buffer.from(encodedValue, "base64");
    const flags = buffer.readUInt8(0);
    const is16BitFormat = (flags & 0x01) !== 0;

    if (is16BitFormat) {
      return buffer.readUInt16LE(1);
    } else {
      return buffer.readUInt8(1);
    }
  }
}

export const bleService = new BLEService();
// export default bleService;

