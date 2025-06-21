import React from 'react';
import { MaterialType } from '../types';
import { formatCost } from '../utils/costCalculator';

interface BatchModeToggleProps {
  isBatch: boolean;
  onToggle: (isBatch: boolean) => void;
  selectedMaterial: MaterialType;
  className?: string;
}

const TIERED_PRICING_STRUCTURE = [
  { timeRange: 'Less than 1 hour', minPrice: 10, maxPrice: 15, description: 'Quick prints and prototypes' },
  { timeRange: '1-3 hours', minPrice: 30, maxPrice: 45, description: 'Standard complexity models' },
  { timeRange: '3-6 hours', minPrice: 60, maxPrice: 90, description: 'Detailed and complex prints' },
  { timeRange: '6+ hours', minPrice: 100, maxPrice: 150, description: 'Large and intricate projects' },
];

const BatchModeToggle: React.FC<BatchModeToggleProps> = ({
  isBatch,
  onToggle,
  selectedMaterial,
  className = ''
}) => {
  const batchHourlyRate = selectedMaterial?.isExotic ? 10 : 7;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Batch Mode</h3>
        <div className="relative inline-block w-12 align-middle select-none">
          <input
            type="checkbox"
            name="batchMode"
            id="batchMode"
            checked={isBatch}
            onChange={() => onToggle(!isBatch)}
            className="sr-only"
          />
          <label
            htmlFor="batchMode"
            className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              isBatch ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                isBatch ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </label>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center mb-3">
          {isBatch ? (
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <h4 className="font-medium text-gray-800">
            {isBatch ? 'Batch Production' : 'Single Item'}
          </h4>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {isBatch
            ? 'Optimized for multiple identical items. Pricing is calculated per hour of print time.'
            : 'Standard pricing for a single item. Best for one-off prints or prototypes.'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Pricing Model</div>
            <div className="font-medium">
              {isBatch ? 'Hourly Rate' : 'Tiered Pricing'}
            </div>
          </div>
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Rate</div>
            <div className="font-medium">
              {isBatch
                ? `$${selectedMaterial.isExotic ? '10' : '7'}/hour`
                : 'Based on size'}
            </div>
          </div>
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Minimum Cost</div>
            <div className="font-medium">$15.00</div>
          </div>
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Best For</div>
            <div className="font-medium">
              {isBatch ? '5+ identical items' : '1-4 items'}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => onToggle(!isBatch)}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isBatch
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {isBatch ? 'Switch to Single Item' : 'Switch to Batch Mode'}
          </button>
        </div>
      </div>

      {isBatch && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Batch mode can save up to 40% on large orders.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchModeToggle; 