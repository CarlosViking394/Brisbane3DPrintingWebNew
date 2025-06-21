import { CostBreakdown, MaterialType } from '../types';

export const PRINT_SETTINGS = {
  DEFAULT_INFILL: 20,
  DEFAULT_LAYER_HEIGHT: 0.2,
  DEFAULT_PRINT_SPEED: 60,
  MINIMUM_COST: 15,
};

// Material time multipliers - represents the relative difficulty/time needed for each category
export const TIME_MULTIPLIERS = {
  standard: 1.0,    // PLA - baseline
  exotic: 1.3,      // ABS, PETG, TPU - takes 30% more time
  reinforced: 1.6,  // Carbon fiber reinforced materials - takes 60% more time
};

// Hourly rates for batch printing per material category
export const BATCH_HOURLY_RATES = {
  standard: 7,      // Standard materials (PLA)
  exotic: 10,       // Exotic materials (ABS, PETG, TPU)
  reinforced: 14,   // Reinforced materials (PLA-CF, etc.)
};

interface CostCalculationParams {
  volume: number; // in cm³
  material: MaterialType;
  isBatch: boolean;
  hasSupport: boolean;
  infillPercentage: number;
  layerHeight: number;
  printSpeed: number;
}

// Format cost to display as currency
export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(2)}`;
};

// Format print time as readable duration
export const formatPrintTime = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 
      ? `${wholeHours}h ${minutes}m`
      : `${wholeHours}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return remainingHours > 0 
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  }
};

// Calculate detailed cost breakdown
export const calculateCost = (params: CostCalculationParams): CostBreakdown => {
  const { volume, material, isBatch, hasSupport, infillPercentage, layerHeight, printSpeed } = params;
  
  // Calculate weight in kg (density varies by material)
  // Slightly adjust density by material category
  let density = 1.25; // Default - PLA
  if (material.category === 'exotic') {
    density = 1.2;
  } else if (material.category === 'reinforced') {
    density = 1.3; // Reinforced materials are often denser
  }
  
  const weightKg = volume * density / 1000;
  const weightGrams = weightKg * 1000;
  
  // Calculate material cost (less emphasized in pricing)
  const materialCost = weightKg * material.pricePerKg;
  
  // Calculate print time (with material category as a factor)
  const categoryMultiplier = TIME_MULTIPLIERS[material.category];
  const layerHeightFactor = 0.2 / layerHeight; // 0.2mm is reference
  const infillFactor = 1 + (infillPercentage - PRINT_SETTINGS.DEFAULT_INFILL) / 100;
  const speedFactor = PRINT_SETTINGS.DEFAULT_PRINT_SPEED / printSpeed;
  
  // Base time calculation (hours) - now influenced by material category
  const printTimeHours = volume * 0.06 * layerHeightFactor * infillFactor * speedFactor * categoryMultiplier;
  
  // Calculate printing cost
  let printingCost: number;
  let tier: string | undefined;
  let hourlyRate: number | undefined;
  
  if (isBatch) {
    // Batch mode: hourly rate based on material category
    hourlyRate = BATCH_HOURLY_RATES[material.category];
    printingCost = printTimeHours * hourlyRate;
  } else {
    // Regular mode: tiered pricing based on time, adjusted by material category
    if (printTimeHours < 1) {
      tier = 'Less than 1 hour';
      // Base $10-$15 for standard, scales by category
      const baseRate = 10 * TIME_MULTIPLIERS[material.category];
      const hourRate = 5 * TIME_MULTIPLIERS[material.category];
      printingCost = baseRate + (printTimeHours * hourRate);
    } else if (printTimeHours < 3) {
      tier = '1-3 hours';
      // Base $30-$45 for standard, scales by category
      const baseRate = 30 * TIME_MULTIPLIERS[material.category];
      const hourRate = 7.5 * TIME_MULTIPLIERS[material.category];
      printingCost = baseRate + ((printTimeHours - 1) * hourRate);
    } else if (printTimeHours < 6) {
      tier = '3-6 hours';
      // Base $60-$90 for standard, scales by category
      const baseRate = 60 * TIME_MULTIPLIERS[material.category];
      const hourRate = 10 * TIME_MULTIPLIERS[material.category];
      printingCost = baseRate + ((printTimeHours - 3) * hourRate);
    } else {
      tier = '6+ hours';
      // Base $100+ for standard, scales by category
      const baseRate = 100 * TIME_MULTIPLIERS[material.category];
      const hourRate = 8.33 * TIME_MULTIPLIERS[material.category];
      printingCost = baseRate + ((printTimeHours - 6) * hourRate);
      // Cap at higher values for different categories
      const caps = {
        standard: 150,
        exotic: 195, // 150 * 1.3
        reinforced: 240 // 150 * 1.6
      };
      printingCost = Math.min(printingCost, caps[material.category]);
    }
  }
  
  // Support material cost if needed
  const supportCost = hasSupport ? materialCost * 0.15 + printingCost * 0.1 : 0;
  
  // Calculate total cost - emphasize printing time cost over material cost
  // Material cost is now a smaller portion of total
  const materialWeight = 0.3; // Material is 30% of cost weight
  const printingWeight = 0.7; // Printing time is 70% of cost weight
  
  let totalCost = (materialCost * materialWeight) + (printingCost * printingWeight) + supportCost;
  
  // Apply minimum cost if needed - adjust by material category
  const minimumCost = PRINT_SETTINGS.MINIMUM_COST * TIME_MULTIPLIERS[material.category];
  const minimumApplied = totalCost < minimumCost;
  
  if (minimumApplied) {
    totalCost = minimumCost;
  }
  
  // Return complete breakdown
  return {
    materialCost,
    printingCost,
    supportCost,  // Always include supportCost (will always be > 0 since hasSupport is always true now)
    totalCost,
    weightGrams,
    printTimeHours,
    breakdown: {
      materialWeight: weightKg,
      materialPrice: material.pricePerKg,
      hourlyRate,
      tier,
      minimumApplied,
    },
  };
}; 