
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Request permission to access the device's location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Get the current position
      try {
        const currentPosition = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        });
      } catch (error) {
        setErrorMsg('Could not fetch location');
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, loading, errorMsg };
};