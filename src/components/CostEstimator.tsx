import React from 'react';
import { CostBreakdown, MaterialType, ModelFile } from '../types';
import { formatCost, formatPrintTime, PRINT_SETTINGS } from '../utils/costCalculator';
import useAppStore from '../store';

interface CostEstimatorProps {
  selectedMaterial: MaterialType;
  onMaterialChange: (material: MaterialType) => void;
  isBatch: boolean;
  onBatchToggle: (isBatch: boolean) => void;
  modelFile?: ModelFile;
  onCostBreakdownChange: (breakdown: CostBreakdown | null) => void;
  className?: string;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({
  selectedMaterial,
  isBatch,
  modelFile,
  className = ''
}) => {
  // Get data and actions from store
  const {
    costBreakdown,
    infillPercentage,
    layerHeight,
    printSpeed,
    hasSupport
  } = useAppStore();

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
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Cost Breakdown</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Material Cost */}
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700">Support Material</div>
                  <div className="text-xs text-gray-500">Additional material and print time</div>
                </div>
              </div>
              <span className="text-gray-900 font-medium">{formatCost(costBreakdown.supportCost || 0)}</span>
            </div>
            
            {/* Print Quality Information */}
            <div className="bg-blue-50 rounded-md p-3 text-sm text-blue-700 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-medium">Print Quality:</span> {getPrintQuality()} ({formatLayerHeight(layerHeight)})
                • <span className="font-medium">Infill:</span> {infillPercentage}%
                • <span className="font-medium">Speed:</span> {getPrintSpeedDescription()}
              </div>
            </div>
            
            {/* Minimum Cost Notice (if applied) */}
            {costBreakdown.breakdown.minimumApplied && (
              <div className="flex justify-between items-center py-2 text-blue-700 bg-blue-50 px-3 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm font-medium">Minimum order cost applied</div>
                </div>
                <span className="font-medium">${PRINT_SETTINGS.MINIMUM_COST.toFixed(2)}</span>
              </div>
            )}
            
            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Cost</span>
                <span className="text-xl font-bold text-blue-600">{formatCost(costBreakdown.totalCost)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                Estimated weight: {costBreakdown.weightGrams.toFixed(1)}g • Print time: {formatPrintTime(costBreakdown.printTimeHours)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostEstimator; 