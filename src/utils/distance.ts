/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get urgency/priority classification based on distance
 */
export function getDeliveryPriority(distanceKm: number): {
  label: string;
  color: string;
  level: 'high' | 'medium' | 'low';
} {
  if (distanceKm <= 3) {
    return { label: 'Muito Perto', color: 'bg-green-500', level: 'high' };
  } else if (distanceKm <= 7) {
    return { label: 'Perto', color: 'bg-blue-500', level: 'medium' };
  } else if (distanceKm <= 12) {
    return { label: 'Moderado', color: 'bg-yellow-500', level: 'medium' };
  } else {
    return { label: 'Longe', color: 'bg-orange-500', level: 'low' };
  }
}

/**
 * Extract neighborhood from a formatted address string
 */
export function extractNeighborhood(address: string): string {
  // Try to extract neighborhood/bairro from address parts
  const parts = address.split(',').map(p => p.trim());
  // Usually the second part is the neighborhood in Mozambique addresses
  if (parts.length >= 3) {
    return parts[1];
  }
  if (parts.length >= 2) {
    return parts[0];
  }
  return address;
}
