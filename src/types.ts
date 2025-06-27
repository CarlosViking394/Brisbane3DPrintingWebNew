// Model file types
export interface ModelFile {
  file: File;
  filename: string;
  size: number;
  volume: number;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  parsedModel: ParsedModel;
}

export interface ParsedModel {
  geometry: any; // THREE.BufferGeometry
  stats: ModelStats;
  metadata: {
    format: string;
    parseTime: number;
  };
}

export interface ModelStats {
  volume: number;
  triangleCount: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  surfaceArea: number;
  estimatedWeight?: Record<string, number>;
}

// Material types
export interface MaterialType {
  name: string;
  pricePerKg: number;
  category: 'standard' | 'exotic' | 'reinforced';
}

// Cost calculation types
export interface CostBreakdown {
  materialCost: number;
  printingCost: number;
  supportCost?: number;
  baseCost: number;  // Base cost before delivery
  totalCost: number; // Total cost including delivery
  weightGrams: number;
  printTimeHours: number;
  breakdown: {
    materialWeight: number; // in kg
    materialPrice: number;
    hourlyRate?: number;
    tier?: string;
    minimumApplied: boolean;
  };
}

// ETA calculation types
export interface ETACalculation {
  estimatedDate: Date;
  printTimeDays: number;
  prepDays: number;
  queueDelayDays: number;
  shippingDays: number;
  totalDays: number;
  isGeolocationUsed: boolean;
  locationError?: string;
  addressBased?: boolean;
  locationInfo?: string;
  userLocation?: {
    distance?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

// Optional services
export interface OptionalService {
  name: string;
  pricePerHour: number;
  hours: number;
} 