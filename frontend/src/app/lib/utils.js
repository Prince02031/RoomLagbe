// Utility functions for RoomLagbe
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate walking time in minutes (assuming 5 km/h walking speed)
export function calculateWalkingTime(distanceKm) {
  const walkingSpeedKmh = 5;
  return Math.round((distanceKm / walkingSpeedKmh) * 60);
}

// Format currency
export function formatCurrency(amount) {
  const safeAmount = amount || 0;
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

// Format date
export function formatDate(dateString) {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Get fair rent color
export function getFairRentColor(score) {
  if (score === undefined || score === null) return 'text-gray-400';
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  return 'text-red-600';
}

// Get fair rent label
export function getFairRentLabel(score) {
  if (score === undefined || score === null) return 'N/A';
  if (score >= 8) return 'Great Deal';
  if (score >= 6) return 'Fair Price';
  return 'Above Average';
}

// Calculate commute from location to university
export function calculateCommute(fromLat, fromLon, toLat, toLon) {
  const distance = calculateDistance(fromLat, fromLon, toLat, toLon);
  const walkingTime = calculateWalkingTime(distance);
  return {
    distance: distance.toFixed(2),
    walkingTime,
  };
}
