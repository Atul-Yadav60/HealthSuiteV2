import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { PermissionsAndroid, Platform } from "react-native";

// Standard Bluetooth Service and Characteristic UUIDs for Heart Rate
const HEART_RATE_SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC_UUID = "00002a37-0000-1000-8000-00805f9b34fb";

/**
 * A singleton service class to manage all Bluetooth Low Energy (BLE) interactions.
 * This includes permissions, scanning, connecting, and data monitoring.
 */
class BLEService {
  private manager: BleManager;
  private device: Device | null = null;
  private heartRateSubscription: Subscription | null = null;

  constructor() {
    // Initialize the BleManager once. The singleton pattern ensures this only happens once.
    this.manager = new BleManager();
  }

  /**
   * Requests necessary Bluetooth and Location permissions based on the Android API level.
   * @returns A promise that resolves to true if all permissions are granted, false otherwise.
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "android") {
      const apiLevel = Platform.Version;
      if (apiLevel < 31) { // For Android 11 (API 30) and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth scanning requires location permission.",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else { // For Android 12 (API 31) and above
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          granted["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_FINE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    // Permissions are typically handled by Info.plist on iOS
    return true;
  }

  /**
   * Starts scanning for BLE devices that advertise the Heart Rate Service.
   * @param onDeviceFound A callback function that is invoked for each device found.
   */
  scanForDevices(onDeviceFound: (device: Device) => void) {
    this.manager.startDeviceScan([HEART_RATE_SERVICE_UUID], null, (error, device) => {
      if (error) {
        console.error("Scan error:", error);
        return;
      }
      if (device) {
        onDeviceFound(device);
      }
    });
  }

  /**
   * Stops the ongoing device scan.
   */
  stopScan() {
    this.manager.stopDeviceScan();
  }

  /**
   * Connects to a specific BLE device by its ID.
   * @param deviceId The ID of the device to connect to.
   * @returns A promise that resolves with the connected device object.
   */
  async connectToDevice(deviceId: string): Promise<Device> {
    this.stopScan();
    console.log("Connecting to device:", deviceId);
    const connectedDevice = await this.manager.connectToDevice(deviceId);
    this.device = await connectedDevice.discoverAllServicesAndCharacteristics();
    console.log("Connection successful to:", this.device.name);
    return this.device;
  }

  /**
   * Disconnects from the currently connected device.
   */
  async disconnectFromDevice() {
    if (this.device) {
      await this.manager.cancelDeviceConnection(this.device.id);
      console.log("Disconnected from device:", this.device.name);
      this.device = null;
    }
  }

  /**
   * Subscribes to the heart rate characteristic of the connected device.
   * @param onHeartRateUpdate A callback function that receives the heart rate value.
   */
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

  /**
   * Unsubscribes from the heart rate characteristic.
   */
  stopHeartRateMonitoring() {
    this.heartRateSubscription?.remove();
    this.heartRateSubscription = null;
  }

  /**
   * Decodes the heart rate value from the raw base64 characteristic value
   * according to the Bluetooth Heart Rate Measurement specification.
   * @param encodedValue The base64 encoded value from the BLE characteristic.
   * @returns The decoded heart rate as a number.
   */
  private decodeHeartRate(encodedValue: string): number {
    const buffer = Buffer.from(encodedValue, "base64");
    const flags = buffer.readUInt8(0);
    // Check if the heart rate format is 16-bit (bit 0 of flags is 1)
    const is16BitFormat = (flags & 0x01) !== 0;

    if (is16BitFormat) {
      return buffer.readUInt16LE(1); // 16-bit value starts at the second byte
    } else {
      return buffer.readUInt8(1); // 8-bit value starts at the second byte
    }
  }
}

// Export a single instance of the service to be used throughout the app.
export const bleService = new BLEService();

