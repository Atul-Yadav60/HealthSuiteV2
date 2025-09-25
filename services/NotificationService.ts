// Enhanced Notification Service with better timing and auto-cleanup
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Enhanced medication reminder with multiple notification strategy
export async function scheduleMedicationReminder(
  medication_schedule: { name: string; dosage: string },
  scheduledTime: Date
): Promise<string[] | null> {
  console.log('=== Scheduling Medication Reminder ===');
  console.log('medication_schedule:', medication_schedule);
  console.log('scheduledTime:', scheduledTime);
  console.log('Scheduled time:', scheduledTime.toString());
  console.log('Current time:', new Date().toString());
  
  const now = new Date();
  const scheduledTimestamp = scheduledTime.getTime();
  const nowTimestamp = now.getTime();
  
  // Check if the scheduled time has already passed (with 10-minute buffer)
  if (scheduledTimestamp <= nowTimestamp + (10 * 60 * 1000)) {
    console.log(`Medication "${medication_schedule.name}" scheduled time is too close or has passed`);
    
    // Schedule for immediate notification if within 10 minutes
    if (scheduledTimestamp > nowTimestamp) {
      const timeUntilDue = Math.floor((scheduledTimestamp - nowTimestamp) / (60 * 1000));
      console.log(`Scheduling immediate reminder - medication due in ${timeUntilDue} minutes`);
      
      try {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: "💊 Medication Due Soon!",
            body: `${medication_schedule.name}${medication_schedule.dosage ? ` (${medication_schedule.dosage})` : ''} is due in ${timeUntilDue} minutes!`,
            sound: 'default',
            data: {
              medicationName: medication_schedule.name,
              dosage: medication_schedule.dosage,
              scheduledTime: scheduledTime.toISOString(),
              type: 'medication_immediate'
            },
          },
          trigger: {
            seconds: 30, // Show in 30 seconds
          },
        });
        
        console.log(`✅ Scheduled immediate notification with ID: ${identifier}`);
        return [identifier];
      } catch (error) {
        console.error("Failed to schedule immediate notification:", error);
        return null;
      }
    } else {
      console.log('Scheduled time has already passed - skipping notification');
      return null;
    }
  }

  // Calculate notification times
  const tenMinutesBefore = new Date(scheduledTimestamp - 10 * 60 * 1000);
  const exactTime = scheduledTime;
  
  console.log('10 minutes before:', tenMinutesBefore.toString());
  console.log('Exact time:', exactTime.toString());

  // Check permissions
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return null;
  }

  const scheduledIds: string[] = [];

  try {
    // Schedule 10-minute early reminder (if time allows)
    if (tenMinutesBefore.getTime() > nowTimestamp) {
      const earlyId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Medication Reminder",
          body: `Time for your ${medication_schedule.name}${medication_schedule.dosage ? ` (${medication_schedule.dosage})` : ''} in 10 minutes.`,
          sound: 'default',
          data: {
            medicationName: medication_schedule.name,
            dosage: medication_schedule.dosage,
            scheduledTime: scheduledTime.toISOString(),
            type: 'medication_early'
          },
        },
        trigger: {
          date: tenMinutesBefore,
        },
      });
      scheduledIds.push(earlyId);
      console.log(`✅ Scheduled early reminder with ID: ${earlyId}`);
    }

    // Schedule exact time reminder
    const exactId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 Take Your Medication Now!",
        body: `Time to take your ${medication_schedule.name}${medication_schedule.dosage ? ` (${medication_schedule.dosage})` : ''}`,
        sound: 'default',
        data: {
          medicationName: medication_schedule.name,
          dosage: medication_schedule.dosage,
          scheduledTime: scheduledTime.toISOString(),
          type: 'medication_exact'
        },
      },
      trigger: {
        date: exactTime,
      },
    });
    scheduledIds.push(exactId);
    console.log(`✅ Scheduled exact time reminder with ID: ${exactId}`);

    // Schedule auto-deletion reminder (10 minutes after scheduled time)
    const deletionTime = new Date(scheduledTimestamp + 10 * 60 * 1000);
    const deletionId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📋 Medication Schedule Updated",
        body: `${medication_schedule.name} has been removed from your active medications.`,
        sound: 'default',
        data: {
          medicationName: medication_schedule.name,
          dosage: medication_schedule.dosage,
          scheduledTime: scheduledTime.toISOString(),
          type: 'medication_cleanup'
        },
      },
      trigger: {
        date: deletionTime,
      },
    });
    scheduledIds.push(deletionId);
    console.log(`✅ Scheduled auto-deletion notification with ID: ${deletionId}`);

    return scheduledIds;
  } catch (error) {
    console.error("Failed to schedule notifications:", error);
    return null;
  }
}

// Auto-cleanup expired medications
export async function cleanupExpiredMedications(userId: string): Promise<number> {
  try {
    const now = new Date();
    console.log('=== Cleaning up expired medications ===');
    console.log('Current time:', now.toString());

    // Get all medications for the user
    const { data: medications, error: fetchError } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    let cleanedCount = 0;
    const medicationsToDelete: string[] = [];

    for (const med of medications || []) {
      if (med.schedule && Array.isArray(med.schedule.times)) {
        const latestTime = med.schedule.times
          .map(time => new Date(time))
          .sort((a, b) => b.getTime() - a.getTime())[0]; // Get latest time

        // Delete if latest time was more than 10 minutes ago
        if (latestTime && latestTime.getTime() < (now.getTime() - 10 * 60 * 1000)) {
          medicationsToDelete.push(med.id);
          console.log(`Marking for deletion: ${med.name} (latest time: ${latestTime})`);
        }
      }
    }

    if (medicationsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('medications')
        .delete()
        .in('id', medicationsToDelete);

      if (deleteError) throw deleteError;
      
      cleanedCount = medicationsToDelete.length;
      console.log(`✅ Cleaned up ${cleanedCount} expired medications`);
    } else {
      console.log('No expired medications to clean up');
    }

    return cleanedCount;
  } catch (error) {
    console.error('Failed to cleanup expired medications:', error);
    return 0;
  }
}

// Enhanced medication planner function that includes cleanup
export async function fetchAndScheduleMedications(userId: string) {
  try {
    console.log('=== Fetching and Scheduling Medications ===');
    
    // First, cleanup expired medications
    const cleanedCount = await cleanupExpiredMedications(userId);
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired medications`);
    }

    // Fetch remaining active medications
    const { data: medications, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const now = new Date();
    const upcomingMedications = (medications || []).filter((med) => {
      if (!med.schedule || !Array.isArray(med.schedule.times)) return false;
      
      return med.schedule.times.some((time: string) => {
        const medicationTime = new Date(time);
        // Include medications that are due within the next hour or have future times
        return medicationTime.getTime() > (now.getTime() - 60 * 60 * 1000);
      });
    });

    console.log(`Found ${upcomingMedications.length} upcoming medications`);

    // Clear old notifications and reschedule
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cleared old notifications');

    let totalScheduled = 0;
    for (const med of upcomingMedications) {
      if (med.schedule && Array.isArray(med.schedule.times)) {
        for (const time of med.schedule.times) {
          const medicationTime = new Date(time);
          // Only schedule if within next 24 hours
          if (medicationTime.getTime() > (now.getTime() - 60 * 60 * 1000) && 
              medicationTime.getTime() < (now.getTime() + 24 * 60 * 60 * 1000)) {
            const scheduledIds = await scheduleMedicationReminder(
              {
                name: med.name,
                dosage: med.dosage || 'as prescribed'
              },
              medicationTime
            );
            
            if (scheduledIds && scheduledIds.length > 0) {
              totalScheduled += scheduledIds.length;
            }
          }
        }
      }
    }

    console.log(`✅ Scheduled ${totalScheduled} notifications total`);
    return upcomingMedications;

  } catch (error) {
    console.error('Error in fetchAndScheduleMedications:', error);
    throw error;
  }
}

// Set up notification listener for handling cleanup
export function setupNotificationListener() {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    const data = notification.request.content.data;
    
    if (data && data.type === 'medication_cleanup') {
      console.log('Auto-cleanup notification received for:', data.medicationName);
      // You could trigger a refresh of the medication list here
    }
  });

  return subscription;
}

// Initialize everything
export async function initializeMedicationSystem() {
  try {
    // Set up notifications
    await registerForPushNotificationsAsync();
    
    // Set up notification listener
    const listener = setupNotificationListener();
    
    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    console.log('✅ Medication system initialized');
    return listener;
  } catch (error) {
    console.error('Failed to initialize medication system:', error);
    return null;
  }
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permission Denied',
      'Notification permissions are required for medication reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Notifications.openSettingsAsync() }
      ]
    );
    return null;
  }

  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync({ 
      projectId: "c58dc584-7dd8-4806-90fa-f3b47348368d" 
    });
    return tokenResult.data;
  } catch (e) {
    console.error("Failed to get Expo push token:", e);
    return null;
  }
}