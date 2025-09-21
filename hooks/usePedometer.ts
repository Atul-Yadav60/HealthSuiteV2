import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

export const usePedometer = () => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const requestPermissionsAndSubscribe = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        setIsPedometerAvailable('unavailable');
        return;
      }

      const { status } = await Pedometer.requestPermissionsAsync();
      if (status === 'granted') {
        setIsPedometerAvailable('available');
        setPermissionGranted(true);

        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0); // Start of the current day

        const pastStepsResult = await Pedometer.getStepCountAsync(start, end);
        if (pastStepsResult) {
          setPastStepCount(pastStepsResult.steps);
        }
      } else {
        setIsPedometerAvailable('denied');
      }
    };

    requestPermissionsAndSubscribe();
    
    // Subscription is not needed for just daily count, but could be added here
    // to listen for live step updates if desired.

  }, []);

  return { isPedometerAvailable, pastStepCount, permissionGranted };
};
