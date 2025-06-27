import React from 'react';
import { MaterialType } from '../types';

const TIERED_PRICING_STRUCTURE = {
  tier1: { range: "< 1 hour", basePrice: 10, rate: 5 },
  tier2: { range: "1-3 hours", basePrice: 30, rate: 7.5 },
  tier3: { range: "3-6 hours", basePrice: 60, rate: 10 },
  tier4: { range: "6+ hours", basePrice: 100, rate: 8.33, cap: 150 }
} as const;

type TierStructure = {
  range: string;
  basePrice: number;
  rate: number;
  cap?: number;
};

interface BatchModeToggleProps {
  isBatch: boolean;
  onToggle: (isBatch: boolean) => void;
  selectedMaterial: MaterialType;
  className?: string;
}

const BatchModeToggle: React.FC<BatchModeToggleProps> = ({
  isBatch,
  onToggle,
  selectedMaterial,
  className = ''
}) => {
  // Get hourly rate based on material category
  const getBatchHourlyRate = (category: string): number => {
    switch (category) {
      case 'exotic':
        return 10;
      case 'reinforced':
        return 14;
      default: // standard
        return 7;
    }
  };

  const batchHourlyRate = getBatchHourlyRate(selectedMaterial.category);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Pricing Mode</h3>
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium ${!isBatch ? 'text-blue-600' : 'text-gray-500'}`}>
            Regular
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBatch}
              onChange={(e) => onToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className={`text-sm font-medium ${isBatch ? 'text-blue-600' : 'text-gray-500'}`}>
            Batch
          </span>
        </div>
      </div>

      {/* Pricing Mode Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        {!isBatch ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Regular Mode - Priority Processing
            </h4>
            <p className="text-sm text-gray-600">
              Fastest turnaround with tiered pricing based on print time. Your order gets priority in the queue.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(TIERED_PRICING_STRUCTURE).map(([key, tier]) => (
                <div key={key} className="bg-white p-2 rounded border border-gray-200">
                  <div className="font-medium text-gray-700">{tier.range}</div>
                  <div className="text-gray-500">
                    From ${tier.basePrice} + ${tier.rate}/hr
                    {'cap' in tier && <span className="block">Cap: ${tier.cap}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Batch Mode - Economical Pricing
            </h4>
            <p className="text-sm text-gray-600">
              More economical option with simple hourly rates. Your order will be processed when we have capacity.
            </p>
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Hourly Rate for {selectedMaterial.name}:</span>
                <span className="text-lg font-bold text-green-600">${batchHourlyRate}/hour</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Longer delivery time but significant savings on larger prints
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchModeToggle; 