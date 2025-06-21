import React, { useState } from 'react';
import { ModelStats } from '../types';
import { formatModelStats } from '../utils/3dFileParser';

interface ModelInfoProps {
  stats: ModelStats;
  format: string;
  parseTime: number;
}

const ModelInfo: React.FC<ModelInfoProps> = ({ stats, format, parseTime }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedStats = formatModelStats(stats);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-600 p-1 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">{format} Format</div>
            <div className="text-sm font-medium text-gray-800">
              {formattedStats.triangles} triangles
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
          <svg 
            className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">Volume</div>
            <div className="font-medium">{formattedStats.volume}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Dimensions</div>
            <div className="font-medium">{formattedStats.dimensions}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Surface Area</div>
            <div className="font-medium">{formattedStats.surfaceArea}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Parse Time</div>
            <div className="font-medium">{parseTime}ms</div>
          </div>
          
          {/* Material weight estimates */}
          {stats.estimatedWeight && (
            <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Estimated Weight by Material</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats.estimatedWeight).map(([material, weight]) => (
                  <div key={material} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <span className="font-medium">{material}</span>
                    <span className="text-gray-700">{weight.toFixed(1)}g</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelInfo; 