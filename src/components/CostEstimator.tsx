import React, { useEffect, useState } from 'react';
import { CostBreakdown, MaterialType, ModelFile } from '../types';
import { calculateCost, formatCost, formatPrintTime, PRINT_SETTINGS, DELIVERY_COSTS } from '../utils/costCalculator';
import { AddressData, calculateDeliveryCost } from '../utils/etaCalculator';

interface CostEstimatorProps {
  selectedMaterial: MaterialType;
  onMaterialChange: (material: MaterialType) => void;
  isBatch: boolean;
  onBatchToggle: (isBatch: boolean) => void;
  modelFile?: ModelFile;
  onCostBreakdownChange: (breakdown: CostBreakdown | null) => void;
  className?: string;
  addressData?: AddressData;
  deliveryCost?: number;
  totalCost?: number;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({
  selectedMaterial,
  onMaterialChange,
  isBatch,
  onBatchToggle,
  modelFile,
  onCostBreakdownChange,
  className = '',
  addressData,
  deliveryCost = 0,
  totalCost = 0
}) => {
  // Form state
  const [infillPercentage, setInfillPercentage] = useState<number>(PRINT_SETTINGS.DEFAULT_INFILL);
  const [layerHeight, setLayerHeight] = useState<number>(PRINT_SETTINGS.DEFAULT_LAYER_HEIGHT);
  const [printSpeed, setPrintSpeed] = useState<number>(PRINT_SETTINGS.DEFAULT_PRINT_SPEED);
  // Support material is always included
  const hasSupport = true;
  
  // Calculated cost breakdown
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [calculatedDeliveryCost, setCalculatedDeliveryCost] = useState<number>(0);

  // Calculate cost when parameters change
  useEffect(() => {
    if (!modelFile || !modelFile.parsedModel?.stats?.volume) {
      setCostBreakdown(null);
      onCostBreakdownChange(null);
      return;
    }

    const volume = modelFile.parsedModel.stats.volume;
    const breakdown = calculateCost({
      volume,
      material: selectedMaterial,
      isBatch,
      hasSupport,
      infillPercentage,
      layerHeight,
      printSpeed
    });

    // Calculate delivery cost if address data is available
    let delivery = deliveryCost;
    if (addressData) {
      delivery = calculateDeliveryCost(addressData);
      setCalculatedDeliveryCost(delivery);
    }

    setCostBreakdown(breakdown);
    onCostBreakdownChange(breakdown);
  }, [
    modelFile, 
    selectedMaterial, 
    isBatch, 
    infillPercentage, 
    layerHeight, 
    printSpeed,
    addressData
  ]);

  // Handle slider changes
  const handleInfillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfillPercentage(parseInt(e.target.value, 10));
  };

  const handleLayerHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLayerHeight(parseFloat(e.target.value));
  };

  const handlePrintSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrintSpeed(parseInt(e.target.value, 10));
  };

  // Format layer height for display
  const formatLayerHeight = (value: number): string => {
    return `${value.toFixed(2)}mm`;
  };

  // Calculate print quality based on layer height
  const getPrintQuality = (): string => {
    if (layerHeight <= 0.1) return 'Ultra Fine';
    if (layerHeight <= 0.15) return 'Fine';
    if (layerHeight <= 0.2) return 'Standard';
    if (layerHeight <= 0.3) return 'Draft';
    return 'Ultra Draft';
  };

  // Calculate print speed description
  const getPrintSpeedDescription = (): string => {
    if (printSpeed <= 30) return 'Slow & Precise';
    if (printSpeed <= 50) return 'Balanced';
    if (printSpeed <= 70) return 'Standard';
    if (printSpeed <= 90) return 'Fast';
    return 'Ultra Fast';
  };

  // Get color scheme based on material category
  const getMaterialColors = () => {
    switch (selectedMaterial.category) {
      case 'exotic':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          highlight: 'text-purple-600',
          total: 'text-purple-600'
        };
      case 'reinforced':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          highlight: 'text-orange-600',
          total: 'text-orange-600'
        };
      default: // standard
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          highlight: 'text-blue-600',
          total: 'text-blue-600'
        };
    }
  };
  
  const colors = getMaterialColors();

  // Get location type based on address data
  const getLocationInfo = (): string => {
    if (!addressData) return 'Standard shipping';
    
    const isInBrisbane = 
      addressData.state.toLowerCase() === 'qld' && 
      (addressData.city.toLowerCase() === 'brisbane' || 
      /^4[0-1][0-9]{2}$/.test(addressData.postalCode));
    
    if (isInBrisbane) {
      return 'Brisbane metropolitan area';
    } else if (addressData.state.toLowerCase() === 'qld') {
      return 'Queensland regional';
    } else if (addressData.country.toLowerCase() === 'australia') {
      return 'Interstate Australia';
    } else {
      return 'International';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* No model uploaded message */}
      {!modelFile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">No 3D Model Uploaded</h3>
          <p className="text-gray-500 mt-2">Upload a 3D model file to calculate printing costs.</p>
        </div>
      )}

      {/* Cost Breakdown */}
      {modelFile && costBreakdown && (
        <div className={`border ${colors.border} rounded-lg overflow-hidden`}>
          <div className={`${colors.bg} px-4 py-3 border-b ${colors.border}`}>
            <h3 className="text-lg font-medium text-gray-800">Cost Breakdown</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Material Cost */}
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg className={`w-5 h-5 ${colors.highlight} mr-2`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700">Material Cost</div>
                  <div className="text-xs text-gray-500">
                    {costBreakdown.breakdown.materialWeight.toFixed(3)}kg of {selectedMaterial.name} @ ${selectedMaterial.pricePerKg}/kg
                  </div>
                </div>
              </div>
              <span className="text-gray-900 font-medium">{formatCost(costBreakdown.materialCost)}</span>
            </div>
            
            {/* Printing Cost */}
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg className={`w-5 h-5 ${colors.highlight} mr-2`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm-5 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700">Printing Cost</div>
                  <div className="text-xs text-gray-500">
                    {formatPrintTime(costBreakdown.printTimeHours)} print time
                    {isBatch 
                      ? ` @ $${costBreakdown.breakdown.hourlyRate}/hour` 
                      : costBreakdown.breakdown.tier ? ` (${costBreakdown.breakdown.tier})` : ''
                    }
                  </div>
                </div>
              </div>
              <span className="text-gray-900 font-medium">{formatCost(costBreakdown.printingCost)}</span>
            </div>
            
            {/* Support Material Cost */}
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg className={`w-5 h-5 ${colors.highlight} mr-2`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700">Support Material</div>
                  <div className="text-xs text-gray-500">Additional material and print time</div>
                </div>
              </div>
              <span className="text-gray-900 font-medium">{formatCost(costBreakdown.supportCost || 0)}</span>
            </div>
            
            {/* Subtotal (Base Cost) */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCost(costBreakdown.baseCost)}</span>
              </div>
            </div>
            
            {/* Delivery Cost */}
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg className={`w-5 h-5 ${colors.highlight} mr-2`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0017 2h-3a1 1 0 00-1 1v1H6a1 1 0 00-1 1v1H3a1 1 0 00-1 1zm17 8h-1.05a2.5 2.5 0 00-4.9 0H10V5h6v2h4v5zM3 8h4v8H3V8z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700">Delivery</div>
                  <div className="text-xs text-gray-500">{getLocationInfo()}</div>
                </div>
              </div>
              <span className="text-gray-900 font-medium">{formatCost(deliveryCost)}</span>
            </div>
            
            {/* Total Cost */}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex justify-between items-center py-2">
                <span className="text-base font-bold text-gray-800">Total</span>
                <span className={`text-lg font-bold ${colors.total}`}>{formatCost(totalCost)}</span>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {costBreakdown.breakdown.minimumApplied && (
                  <span>Minimum order value of ${PRINT_SETTINGS.MINIMUM_COST} applied</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Settings */}
      {modelFile && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Print Settings</h3>
          
          {/* Infill Percentage */}
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="infill" className="text-sm font-medium text-gray-700">Infill Percentage</label>
              <span className="text-sm text-gray-500">{infillPercentage}%</span>
            </div>
            <input
              type="range"
              id="infill"
              min="10"
              max="100"
              step="5"
              value={infillPercentage}
              onChange={handleInfillChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Hollow (10%)</span>
              <span>Solid (100%)</span>
            </div>
          </div>
          
          {/* Layer Height */}
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="layerHeight" className="text-sm font-medium text-gray-700">Layer Height</label>
              <span className="text-sm text-gray-500">{formatLayerHeight(layerHeight)} - {getPrintQuality()}</span>
            </div>
            <input
              type="range"
              id="layerHeight"
              min="0.1"
              max="0.4"
              step="0.05"
              value={layerHeight}
              onChange={handleLayerHeightChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Fine (0.10mm)</span>
              <span>Draft (0.40mm)</span>
            </div>
          </div>
          
          {/* Print Speed */}
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="printSpeed" className="text-sm font-medium text-gray-700">Print Speed</label>
              <span className="text-sm text-gray-500">{printSpeed} mm/s - {getPrintSpeedDescription()}</span>
            </div>
            <input
              type="range"
              id="printSpeed"
              min="20"
              max="100"
              step="10"
              value={printSpeed}
              onChange={handlePrintSpeedChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Slow (20mm/s)</span>
              <span>Fast (100mm/s)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostEstimator; 