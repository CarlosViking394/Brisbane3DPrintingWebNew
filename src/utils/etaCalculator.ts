import { ETACalculation } from '../types';
import { DELIVERY_COSTS } from './costCalculator';

// Format delivery date as readable string
export const formatDeliveryDate = (date: Date): string => {
  return date.toLocaleDateString('en-AU', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
};

// Format duration in days to readable string
export const formatDuration = (days: number): string => {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days < 7) {
    const wholeDays = Math.floor(days);
    const remainingHours = Math.round((days - wholeDays) * 24);
    return remainingHours > 0
      ? `${wholeDays} day${wholeDays !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
      : `${wholeDays} day${wholeDays !== 1 ? 's' : ''}`;
  } else {
    const weeks = Math.floor(days / 7);
    const remainingDays = Math.floor(days % 7);
    return remainingDays > 0
      ? `${weeks} week${weeks !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
      : `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
};

// Get delivery urgency based on total days
export const getDeliveryUrgency = (totalDays: number): { description: string; color: string } => {
  if (totalDays <= 2) {
    return { description: 'Express', color: 'text-green-600' };
  } else if (totalDays <= 5) {
    return { description: 'Standard', color: 'text-blue-600' };
  } else if (totalDays <= 10) {
    return { description: 'Regular', color: 'text-orange-600' };
  } else {
    return { description: 'Extended', color: 'text-purple-600' };
  }
};

// Interface for address data
export interface AddressData {
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Calculate delivery cost based on address data
export const calculateDeliveryCost = (addressData: AddressData): number => {
  if (!addressData) return DELIVERY_COSTS.interstate; // Default to interstate if no address
  
  // Check if the address is in Brisbane
  const isInBrisbane = 
    addressData.state.toLowerCase() === 'qld' && 
    (addressData.city.toLowerCase() === 'brisbane' || 
     /^4[0-1][0-9]{2}$/.test(addressData.postalCode)); // Brisbane postal codes typically start with 4
  
  if (isInBrisbane) {
    return DELIVERY_COSTS.brisbane;
  } else if (addressData.state.toLowerCase() === 'qld') {
    return DELIVERY_COSTS.queensland;
  } else if (addressData.country.toLowerCase() === 'australia') {
    return DELIVERY_COSTS.interstate;
  } else {
    return DELIVERY_COSTS.international;
  }
};

// Calculate ETA based on address data
export const calculateETAFromAddress = (printTimeHours: number, addressData: AddressData): ETACalculation => {
  // Convert print time to days
  const printTimeDays = printTimeHours / 24;
  
  // Calculate preparation days based on print time
  const prepDays = Math.max(0.5, printTimeDays * 0.2);
  
  // Calculate queue delay (longer for longer prints)
  const queueDelayDays = Math.min(3, printTimeDays * 0.5);
  
  // Determine shipping days based on address
  let shippingDays: number;
  let locationInfo: string;
  
  // Check if the address is in Brisbane
  const isInBrisbane = 
    addressData.state.toLowerCase() === 'qld' && 
    (addressData.city.toLowerCase() === 'brisbane' || 
     /^4[0-1][0-9]{2}$/.test(addressData.postalCode)); // Brisbane postal codes typically start with 4
  
  if (isInBrisbane) {
    // Local Brisbane delivery
    shippingDays = 1;
    locationInfo = 'Brisbane metropolitan area';
  } else if (addressData.state.toLowerCase() === 'qld') {
    // Within Queensland
    shippingDays = 2;
    locationInfo = 'Queensland regional';
  } else if (addressData.country.toLowerCase() === 'australia') {
    // Other Australian states
    shippingDays = 3;
    locationInfo = 'Interstate Australia';
  } else {
    // International
    shippingDays = 7;
    locationInfo = 'International';
  }
  
  // Total time
  const totalDays = printTimeDays + prepDays + queueDelayDays + shippingDays;
  
  // Calculate estimated date
  const currentDate = new Date();
  const estimatedDate = new Date(currentDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  
  // Return ETA calculation with address-based data
  return {
    estimatedDate,
    printTimeDays,
    prepDays,
    queueDelayDays,
    shippingDays,
    totalDays,
    isGeolocationUsed: false,
    addressBased: true,
    locationInfo: locationInfo
  };
};

// Calculate ETA without using geolocation
export const calculateETAWithoutLocation = (printTimeHours: number): ETACalculation => {
  // Convert print time to days
  const printTimeDays = printTimeHours / 24;
  
  // Calculate preparation days based on print time
  const prepDays = Math.max(0.5, printTimeDays * 0.2);
  
  // Calculate queue delay (longer for longer prints)
  const queueDelayDays = Math.min(3, printTimeDays * 0.5);
  
  // Standard shipping time without location
  const shippingDays = 3;
  
  // Total time
  const totalDays = printTimeDays + prepDays + queueDelayDays + shippingDays;
  
  // Calculate estimated date
  const currentDate = new Date();
  const estimatedDate = new Date(currentDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  
  // Return ETA calculation
  return {
    estimatedDate,
    printTimeDays,
    prepDays,
    queueDelayDays,
    shippingDays,
    totalDays,
    isGeolocationUsed: false,
  };
};

// Calculate ETA using geolocation
export const calculateETA = async (printTimeHours: number): Promise<ETACalculation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Geolocation not supported, fall back to standard calculation
      resolve(calculateETAWithoutLocation(printTimeHours));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // User location obtained
        const userCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        // Brisbane coordinates (approximate)
        const brisbaneCoordinates = {
          latitude: -27.4698,
          longitude: 153.0251,
        };
        
        // Calculate distance to Brisbane (simplified)
        const distance = calculateDistance(
          userCoordinates.latitude,
          userCoordinates.longitude,
          brisbaneCoordinates.latitude,
          brisbaneCoordinates.longitude
        );
        
        // Calculate shipping days based on distance
        let shippingDays: number;
        if (distance < 50) {
          // Local delivery
          shippingDays = 1;
        } else if (distance < 500) {
          // Regional delivery
          shippingDays = 2;
        } else if (distance < 2000) {
          // Interstate delivery
          shippingDays = 3;
        } else {
          // International or very remote
          shippingDays = 7;
        }
        
        // Calculate other components
        const printTimeDays = printTimeHours / 24;
        const prepDays = Math.max(0.5, printTimeDays * 0.2);
        const queueDelayDays = Math.min(3, printTimeDays * 0.5);
        
        // Calculate total time
        const totalDays = printTimeDays + prepDays + queueDelayDays + shippingDays;
        
        // Calculate estimated date
        const currentDate = new Date();
        const estimatedDate = new Date(currentDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
        
        // Return ETA calculation with location data
        resolve({
          estimatedDate,
          printTimeDays,
          prepDays,
          queueDelayDays,
          shippingDays,
          totalDays,
          isGeolocationUsed: true,
          userLocation: {
            distance,
            coordinates: userCoordinates,
          },
        });
      },
      (error) => {
        // Error getting user location
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'Unknown location error';
        }
        
        // Fall back to standard calculation with error message
        const standardEta = calculateETAWithoutLocation(printTimeHours);
        reject({
          ...standardEta,
          locationError: errorMessage,
        });
      }
    );
  });
};

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Convert degrees to radians
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
} 