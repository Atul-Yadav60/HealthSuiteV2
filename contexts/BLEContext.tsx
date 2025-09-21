import React, { createContext, useContext, useState, ReactNode } from "react";
import { Device } from "react-native-ble-plx";
import {
  bleManager,
  connectToDevice as connect,
  disconnectDevice as disconnect,
  scanForDevices as scan,
  stopScan as stop,
} from "../services/BLEManager"; // Using the singleton

interface BLEContextType {
  connectedDevice: Device | null;
  heartRate: number;
  steps: number;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => void;
  isConnecting: boolean;
  scanForDevices: (onDeviceFound: (device: Device) => void) => void;
  stopScan: () => void;
}

const BLEContext = createContext<BLEContextType | undefined>(undefined);

export const useBLE = () => {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error("useBLE must be used within a BLEProvider");
  }
  return context;
};

export const BLEProvider = ({ children }: { children: ReactNode }) => {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState(0);
  const [steps, setSteps] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToDevice = async (device: Device) => {
    setIsConnecting(true);
    try {
      await connect(device.id);
      setConnectedDevice(device);

      bleManager.monitorCharacteristicForDevice(
        device.id,
        "180d",
        "2a37",
        (error, characteristic) => {
          if (error) {
            console.error("Heart Rate Monitor Error:", error);
            return;
          }
          if (characteristic?.value) {
            const buffer = Buffer.from(characteristic.value, "base64");
            const newHeartRate = buffer.readUInt8(1);
            setHeartRate(newHeartRate);
          }
        }
      );
    } catch (error) {
      console.error("Failed to connect to device in context", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = () => {
    if (connectedDevice) {
      disconnect(connectedDevice.id);
      setConnectedDevice(null);
      setHeartRate(0);
    }
  };

  const scanForDevices = (onDeviceFound: (device: Device) => void) => {
    scan((device) => {
      if (device) {
        onDeviceFound(device);
      }
    });
  };

  const stopScan = () => {
    stop();
  };

  const value = {
    connectedDevice,
    heartRate,
    steps,
    connectToDevice,
    disconnectDevice,
    isConnecting,
    scanForDevices,
    stopScan,
  };

  return <BLEContext.Provider value={value}>{children}</BLEContext.Provider>;
};
