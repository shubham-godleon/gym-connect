import * as Location from 'expo-location';

export interface Coords {
  lat: number;
  lng: number;
}

// Requests foreground permission and returns the current coordinates.
// Works on native and on web (via the browser geolocation API through expo-location).
export async function getCurrentCoords(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission is needed to check in and find gyms.');
  }
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}
