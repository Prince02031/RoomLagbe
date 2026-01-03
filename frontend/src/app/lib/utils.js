// Utility functions for RoomLagbe

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate walking time in minutes (assuming 5 km/h walking speed)
export function calculateWalkingTime(distanceKm: number): number {
  const walkingSpeedKmh = 5;
  return Math.round((distanceKm / walkingSpeedKmh) * 60);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Get fair rent color
export function getFairRentColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  return 'text-red-600';
}

// Get fair rent label
export function getFairRentLabel(score: number): string {
  if (score >= 8) return 'Great Deal';
  if (score >= 6) return 'Fair Price';
  return 'Above Average';
}

// Calculate commute from location to university
export function calculateCommute(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
) {
  const distance = calculateDistance(fromLat, fromLon, toLat, toLon);
  const walkingTime = calculateWalkingTime(distance);
  return {
    distance: distance.toFixed(2),
    walkingTime,
  };
}
