import React, { useState } from 'react';
import { MaterialType } from '../types';
import { getWeightForMaterial, formatWeight } from '../utils/3dFileParser';
import useAppStore from '../store';

// Enhanced material data with descriptions and properties
export interface EnhancedMaterial extends MaterialType {
  id: string;
  description: string;
  properties: {
    strength: 'Low' | 'Medium' | 'High';
    flexibility: 'Rigid' | 'Semi-Flexible' | 'Flexible';
    printingTime: 'Low' | 'Medium' | 'High';
  };
  color: string; // Visual color representation
  useCases: string[];
}

export const ENHANCED_MATERIALS: EnhancedMaterial[] = [
  {
    id: 'pla',
    name: 'PLA',
    pricePerKg: 25,
    category: 'standard',
    description: 'Biodegradable, easy to print, perfect for beginners',
    properties: {
      strength: 'Medium',
      flexibility: 'Rigid',
      printingTime: 'Low'
    },
    color: '#4CAF50',
    useCases: ['Prototypes', 'Decorative items', 'Educational models', 'Indoor use']
  },
  {
    id: 'abs',
    name: 'ABS',
    pricePerKg: 30,
    category: 'exotic',
    description: 'Strong, impact-resistant, suitable for functional parts',
    properties: {
      strength: 'High',
      flexibility: 'Semi-Flexible',
      printingTime: 'Medium'
    },
    color: '#2196F3',
    useCases: ['Functional parts', 'Automotive', 'Electronics cases', 'Tools']
  },
  {
    id: 'petg',
    name: 'PETG',
    pricePerKg: 35,
    category: 'exotic',
    description: 'Chemical resistant, clear printing, food-safe',
    properties: {
      strength: 'High',
      flexibility: 'Semi-Flexible',
      printingTime: 'Medium'
    },
    color: '#FF9800',
    useCases: ['Food containers', 'Medical devices', 'Transparent parts', 'Chemical storage']
  },
  {
    id: 'tpu',
    name: 'TPU',
    pricePerKg: 45,
    category: 'exotic',
    description: 'Flexible, rubber-like material for specialized applications',
    properties: {
      strength: 'Medium',
      flexibility: 'Flexible',
      printingTime: 'High'
    },
    color: '#9C27B0',
    useCases: ['Phone cases', 'Gaskets', 'Flexible hinges', 'Wearables']
  },
  {
    id: 'pla-cf',
    name: 'PLA-CF',
    pricePerKg: 60,
    category: 'reinforced',
    description: 'Carbon fiber reinforced PLA for stronger, stiffer parts',
    properties: {
      strength: 'High',
      flexibility: 'Rigid',
      printingTime: 'High'
    },
    color: '#212121',
    useCases: ['Engineering parts', 'Drone components', 'Structural elements', 'High-strength prototypes']
  }
];

interface MaterialSelectorProps {
  selectedMaterial: MaterialType;
  onMaterialChange: (material: MaterialType) => void;
  modelVolume?: number; // For weight calculation
  className?: string;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
  modelVolume,
  className = ''
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>(null);
  
  // Get store access for direct updates if needed
  const { setSelectedMaterial } = useAppStore();

  const handleMaterialSelect = (enhancedMaterial: EnhancedMaterial) => {
    const materialType: MaterialType = {
      name: enhancedMaterial.name,
      pricePerKg: enhancedMaterial.pricePerKg,
      category: enhancedMaterial.category
    };
    
    // Update via props for backwards compatibility
    onMaterialChange(materialType);
    
    // Also update store directly if needed
    setSelectedMaterial(materialType);
  };

  const toggleMaterialDetails = (materialId: string, event: React.MouseEvent) => {
    // Prevent material selection when clicking the expand button
    event.stopPropagation();
    setExpandedMaterialId(expandedMaterialId === materialId ? null : materialId);
  };

  const getPropertyColor = (property: string, value: string): string => {
    switch (value) {
      case 'Low':
      case 'Rigid':
        return 'text-green-600 bg-green-50';
      case 'Medium':
      case 'Semi-Flexible':
        return 'text-orange-600 bg-orange-50';
      case 'High':
      case 'Flexible':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {ENHANCED_MATERIALS.filter(m => m.category === 'standard').length} Standard • 
          {ENHANCED_MATERIALS.filter(m => m.category === 'exotic').length} Exotic • 
          {ENHANCED_MATERIALS.filter(m => m.category === 'reinforced').length} Reinforced
        </div>
        <button 
          onClick={() => setShowComparison(!showComparison)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showComparison ? 'Hide Comparison' : 'Compare Materials'}
        </button>
      </div>

      {/* Material List - One per row */}
      <div className="space-y-4">
        {ENHANCED_MATERIALS.map((material) => {
          const isSelected = selectedMaterial.name === material.name;
          const isExpanded = expandedMaterialId === material.id;
          const estimatedWeight = modelVolume ? getWeightForMaterial(modelVolume, material.name) : null;

          return (
            <div
              key={material.id}
              onClick={() => handleMaterialSelect(material)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300/50 bg-white'
              }`}
            >
              {/* Material Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Color indicator */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: material.color }}
                  />
                  <div>
                    <h4 className={`font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                      {material.name}
                    </h4>
                    {material.category === 'standard' && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        Standard
                      </span>
                    )}
                    {material.category === 'exotic' && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                        Exotic
                      </span>
                    )}
                    {material.category === 'reinforced' && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                        Reinforced
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Price */}
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                      ${material.pricePerKg}
                    </div>
                    <div className="text-xs text-gray-500">per kg</div>
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  <button 
                    onClick={(e) => toggleMaterialDetails(material.id, e)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    {isExpanded ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Brief Description - Always visible */}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {material.description}
              </p>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                  {/* Properties */}
                  <div className="space-y-2 mb-3">
                    <h5 className="font-medium text-gray-700 mb-2">Properties</h5>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Strength:</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${getPropertyColor('strength', material.properties.strength)}`}>
                        {material.properties.strength}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Flexibility:</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${getPropertyColor('flexibility', material.properties.flexibility)}`}>
                        {material.properties.flexibility}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Printing Time:</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${getPropertyColor('printingTime', material.properties.printingTime)}`}>
                        {material.properties.printingTime}
                      </span>
                    </div>
                  </div>

                  {/* Weight Estimate (if model volume available) */}
                  {estimatedWeight && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700 mb-2">Weight Estimate</h5>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">For your model:</span>
                        <span className="font-medium text-gray-800">
                          {formatWeight(estimatedWeight)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Use Cases */}
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700 mb-2">Best for</h5>
                    <div className="flex flex-wrap gap-1">
                      {material.useCases.map((useCase) => (
                        <span 
                          key={useCase}
                          className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Material Comparison Table */}
      {showComparison && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Material Comparison</h3>
            <button 
              onClick={() => setShowComparison(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strength
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flexibility
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Printing Time
                  </th>
                  {modelVolume && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Est. Weight
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best For
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ENHANCED_MATERIALS.map((material) => {
                  const isSelected = selectedMaterial.name === material.name;
                  const estimatedWeight = modelVolume ? getWeightForMaterial(modelVolume, material.name) : null;

                  return (
                    <tr 
                      key={material.id}
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      {/* Material Name */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: material.color }}
                          />
                          <div>
                            <div className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                              {material.name}
                            </div>
                            {material.category === 'standard' && (
                              <span className="inline-block px-1 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                                Standard
                              </span>
                            )}
                            {material.category === 'exotic' && (
                              <span className="inline-block px-1 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded">
                                Exotic
                              </span>
                            )}
                            {material.category === 'reinforced' && (
                              <span className="inline-block px-1 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded">
                                Reinforced
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          ${material.pricePerKg}/kg
                        </div>
                      </td>

                      {/* Strength */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getPropertyColor(material.properties.strength, material.properties.strength).split(' ')[0]}`}>
                          {material.properties.strength}
                        </span>
                      </td>

                      {/* Flexibility */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getPropertyColor(material.properties.flexibility, material.properties.flexibility).split(' ')[0]}`}>
                          {material.properties.flexibility}
                        </span>
                      </td>

                      {/* Printing Time */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getPropertyColor(material.properties.printingTime, material.properties.printingTime).split(' ')[0]}`}>
                          {material.properties.printingTime}
                        </span>
                      </td>

                      {/* Weight (if model volume available) */}
                      {modelVolume && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-800">
                            {estimatedWeight ? formatWeight(estimatedWeight) : 'N/A'}
                          </span>
                        </td>
                      )}

                      {/* Use Cases */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          {material.useCases.slice(0, 2).join(', ')}
                          {material.useCases.length > 2 && '...'}
                        </div>
                      </td>

                      {/* Select Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleMaterialSelect(material)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialSelector; 