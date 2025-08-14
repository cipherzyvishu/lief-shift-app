/**
 * Geofencing utilities for location-based shift management
 */

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return Math.round(distance);
}

/**
 * Check if a user is within the geofence of a location
 * @param userLat User's current latitude
 * @param userLng User's current longitude
 * @param locationLat Location's latitude
 * @param locationLng Location's longitude
 * @param radius Geofence radius in meters
 * @returns Object with isWithin boolean and actual distance
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  locationLat: number,
  locationLng: number,
  radius: number
): { isWithin: boolean; distance: number } {
  const distance = calculateDistance(userLat, userLng, locationLat, locationLng);
  
  return {
    isWithin: distance <= radius,
    distance
  };
}

/**
 * Format distance for user-friendly display
 * @param distance Distance in meters
 * @returns Formatted string with appropriate units
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}
