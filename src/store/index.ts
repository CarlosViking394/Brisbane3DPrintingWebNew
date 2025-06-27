import { create } from 'zustand';
import { calculateCost } from '../utils/costCalculator';
import { MaterialType, ModelFile, CostBreakdown } from '../types';

// Address data interface
interface AddressData {
  street?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Default material
const DEFAULT_MATERIAL: MaterialType = {
  name: 'PLA',
  pricePerKg: 25,
  category: 'standard',
};

// Define the store's state type
interface AppState {
  // Model data
  modelFile: ModelFile | undefined;
  setModelFile: (file: ModelFile | undefined) => void;
  
  // Material data
  selectedMaterial: MaterialType;
  setSelectedMaterial: (material: MaterialType) => void;
  
  // Batch mode
  isBatch: boolean;
  setIsBatch: (isBatch: boolean) => void;
  
  // Cost breakdown
  costBreakdown: CostBreakdown | null;
  updateCostBreakdown: () => void;
  
  // User address data
  addressData: AddressData | undefined;
  setAddressData: (address: AddressData) => void;

  // Print settings - could be expanded later if needed
  infillPercentage: number;
  layerHeight: number;
  printSpeed: number;
  hasSupport: boolean;

  // Set print settings
  setPrintSettings: (settings: {
    infillPercentage?: number;
    layerHeight?: number;
    printSpeed?: number;
    hasSupport?: boolean;
  }) => void;
}

// Create the store
const useAppStore = create<AppState>((set, get) => ({
  // Model file state
  modelFile: undefined,
  setModelFile: (file) => set({ modelFile: file }),
  
  // Material state
  selectedMaterial: DEFAULT_MATERIAL,
  setSelectedMaterial: (material) => {
    set({ selectedMaterial: material });
    get().updateCostBreakdown();
  },
  
  // Batch mode state
  isBatch: false,
  setIsBatch: (isBatch) => {
    set({ isBatch });
    get().updateCostBreakdown();
  },
  
  // Cost breakdown state
  costBreakdown: null,
  updateCostBreakdown: () => {
    const { modelFile, selectedMaterial, isBatch, infillPercentage, layerHeight, printSpeed, hasSupport } = get();
    
    // Only calculate if we have a model file
    if (!modelFile || !modelFile.parsedModel?.stats?.volume) {
      set({ costBreakdown: null });
      return;
    }
    
    const volume = modelFile.parsedModel.stats.volume;
    
    // Calculate cost breakdown
    const breakdown = calculateCost({
      volume,
      material: selectedMaterial,
      isBatch,
      hasSupport,
      infillPercentage,
      layerHeight,
      printSpeed
    });
    
    set({ costBreakdown: breakdown });
  },
  
  // Address data state
  addressData: undefined,
  setAddressData: (address) => set({ addressData: address }),
  
  // Print settings with defaults
  infillPercentage: 20, // Default 20%
  layerHeight: 0.2, // Default 0.2mm
  printSpeed: 50, // Default 50mm/s
  hasSupport: true, // Default true
  
  // Setting print settings
  setPrintSettings: (settings) => {
    set({ ...settings });
    get().updateCostBreakdown();
  }
}));

export default useAppStore; 