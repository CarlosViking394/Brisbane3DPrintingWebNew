import React, { useState, useEffect, useCallback } from 'react';
import { ETACalculation, CostBreakdown } from '../types';
import { 
  calculateETAFromAddress,
  calculateETAWithoutLocation, 
  formatDeliveryDate, 
  formatDuration,
  getDeliveryUrgency,
  AddressData
} from '../utils/etaCalculator';

interface ETACalculatorProps {
  costBreakdown?: CostBreakdown;
  materialCategory?: 'standard' | 'exotic' | 'reinforced';
  className?: string;
  addressData?: AddressData;
}

const ETACalculator: React.FC<ETACalculatorProps> = ({
  costBreakdown,
  materialCategory = 'standard',
  className = '',
  addressData
}) => {
  const [etaCalculation, setEtaCalculation] = useState<ETACalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get color scheme based on material category
  const getColors = () => {
    switch (materialCategory) {
      case 'exotic':
        return {
          primary: 'text-purple-600',
          bg: 'bg-purple-100',
          border: 'border-purple-200'
        };
      case 'reinforced':
        return {
          primary: 'text-orange-600',
          bg: 'bg-orange-100',
          border: 'border-orange-200'
        };
      default: // standard
        return {
          primary: 'text-blue-600',
          bg: 'bg-blue-100',
          border: 'border-blue-200'
        };
    }
  };

  const colors = getColors();

  // Memoize the calculation function to avoid infinite loops
  const calculateETAEstimate = useCallback(async () => {
    if (!costBreakdown?.printTimeHours) return;

    setIsCalculating(true);
    
    try {
      // If we have address data, use it for the calculation
      if (addressData && 
          addressData.city && 
          addressData.state && 
          addressData.postalCode) {
        const eta = calculateETAFromAddress(costBreakdown.printTimeHours, addressData);
        setEtaCalculation(eta);
      } else {
        // Fallback to calculation without location data
        const eta = calculateETAWithoutLocation(costBreakdown.printTimeHours);
        setEtaCalculation(eta);
      }
    } catch (error) {
      console.warn('ETA calculation failed:', error);
      // Fallback to calculation without geolocation
      const eta = calculateETAWithoutLocation(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
    } finally {
      setIsCalculating(false);
    }
  }, [costBreakdown?.printTimeHours, addressData]);

  // Calculate ETA when print time or address changes
  useEffect(() => {
    if (costBreakdown?.printTimeHours) {
      calculateETAEstimate();
    } else {
      setEtaCalculation(null);
    }
  }, [costBreakdown?.printTimeHours, addressData, calculateETAEstimate]);

  if (isCalculating) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`}>
        <div className="text-center py-6">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculating delivery estimate...</p>
        </div>
      </div>
    );
  }

  if (!etaCalculation) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`}>
        <div className="text-center py-6">
          <p className="text-gray-500">Upload a 3D model to see delivery estimates</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border ${colors.border} ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Estimate</h3>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <div className="text-center">
          <div className="text-lg font-medium mb-1">Estimated Delivery</div>
          <div className="text-2xl font-bold text-blue-700">
            {formatDeliveryDate(etaCalculation.estimatedDate)}
          </div>
          <div className="text-sm text-blue-600 mt-1">
            {formatDuration(etaCalculation.totalDays)} total time
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Printing Time:</span>
          <span className="font-medium">{formatDuration(etaCalculation.printTimeDays)}</span>
        </div>
        <div className="flex justify-between">
          <span>Preparation:</span>
          <span className="font-medium">{formatDuration(etaCalculation.prepDays)}</span>
        </div>
        <div className="flex justify-between">
          <span>Queue Time:</span>
          <span className="font-medium">{formatDuration(etaCalculation.queueDelayDays)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping:</span>
          <span className="font-medium">{formatDuration(etaCalculation.shippingDays)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
          <span className="font-bold">Total:</span>
          <span className="font-bold">{formatDuration(etaCalculation.totalDays)}</span>
        </div>
      </div>
    </div>
  );
};

export default ETACalculator;