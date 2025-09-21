import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { supabase } from "../lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// This function schedules the actual reminder
export async function scheduleMedicationReminder(
  medication: { name: string; dosage: string },
  date: Date
) {
  const trigger = new Date(date.getTime() - 10 * 60 * 1000);

  if (trigger.getTime() <= Date.now()) {
    console.log(
      `Skipped scheduling for "${medication.name}" as its trigger time is in the past.`
    );
    return null;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 Medication Reminder",
        body: `Time for your ${medication.name} (${medication.dosage || "as prescribed"}).`,
        sound: "default",
      },
      trigger,
    });
    console.log(`Scheduled notification for "${medication.name}" with ID: ${identifier}`);
    return identifier;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    Alert.alert("Scheduling Error", "Could not schedule a reminder.");
    return null;
  }
}

export async function registerForPushNotificationsAsync() {
  let token;
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Permission Denied', 'Failed to get push token!');
    return;
  }

  try {
    // *** PASTE YOUR EXPO PROJECT ID FROM APP.JSON HERE ***
    token = (await Notifications.getExpoPushTokenAsync({ projectId: "c58dc584-7dd8-4806-90fa-f3b47348368d" })).data;
    console.log("Expo Push Token:", token);

  } catch (e) {
    console.error("Failed to get Expo push token:", e);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}