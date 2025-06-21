import React from 'react';
import { ModelFile, MaterialType, OptionalService, CostBreakdown, ETACalculation } from '../types';
import { formatCost, formatPrintTime } from '../utils/costCalculator';
import { formatDeliveryDate, formatDuration } from '../utils/etaCalculator';

interface EstimateSummaryProps {
  modelFile?: ModelFile;
  selectedMaterial: MaterialType;
  isBatch: boolean;
  costBreakdown?: CostBreakdown;
  optionalServices: OptionalService[];
  etaCalculation?: ETACalculation;
  className?: string;
}

const EstimateSummary: React.FC<EstimateSummaryProps> = ({
  modelFile,
  selectedMaterial,
  isBatch,
  costBreakdown,
  optionalServices,
  etaCalculation,
  className = ''
}) => {
  // Calculate optional services total
  const optionalServicesTotal = optionalServices
    .filter(service => service.hours > 0)
    .reduce((total, service) => total + (service.hours * service.pricePerHour), 0);

  // Calculate grand total
  const grandTotal = (costBreakdown?.totalCost || 0) + optionalServicesTotal;

  // Check if we have enough data for a complete estimate
  const hasCompleteEstimate = modelFile?.parsedModel && costBreakdown;

  if (!hasCompleteEstimate) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 ${className}`}>
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gray-50 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Project Summary</h3>
          <p className="text-gray-500 max-w-md mx-auto">Upload a 3D model to see your complete cost estimate</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-bold">Project Estimate Summary</h3>
        </div>
        <p className="text-blue-100 text-sm ml-8">
          Complete cost breakdown for your 3D printing project
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-700 text-base border-b border-gray-200 pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Project Details
            </h4>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">File:</span>
                <span className="font-medium text-gray-800 max-w-[70%] truncate">
                  {modelFile.filename}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Volume:</span>
                <span className="font-medium text-gray-800">
                  {modelFile.parsedModel!.stats.volume.toFixed(2)} cm³
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Material:</span>
                <span className="font-medium text-gray-800 flex items-center">
                  {selectedMaterial.name}
                  {selectedMaterial.category === 'standard' && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                      Standard
                    </span>
                  )}
                  {selectedMaterial.category === 'exotic' && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                      Exotic
                    </span>
                  )}
                  {selectedMaterial.category === 'reinforced' && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                      Reinforced
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Pricing Mode:</span>
                <span className="font-medium text-gray-800">
                  {isBatch ? '📦 Batch Mode' : '⚡ Regular Mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-gray-700 text-base border-b border-gray-200 pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Dimensions & Weight
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center bg-white p-2 rounded border border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">Width</div>
                  <div className="font-medium">{modelFile.parsedModel!.stats.dimensions.width.toFixed(1)} mm</div>
                </div>
                <div className="text-center bg-white p-2 rounded border border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">Height</div>
                  <div className="font-medium">{modelFile.parsedModel!.stats.dimensions.height.toFixed(1)} mm</div>
                </div>
                <div className="text-center bg-white p-2 rounded border border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">Depth</div>
                  <div className="font-medium">{modelFile.parsedModel!.stats.dimensions.depth.toFixed(1)} mm</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium text-gray-800">
                    {costBreakdown.weightGrams < 1000 
                      ? `${costBreakdown.weightGrams.toFixed(1)}g`
                      : `${(costBreakdown.weightGrams / 1000).toFixed(2)}kg`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Triangles:</span>
                  <span className="font-medium text-gray-800">
                    {modelFile.parsedModel!.stats.triangleCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Surface Area:</span>
                  <span className="font-medium text-gray-800">
                    {modelFile.parsedModel!.stats.surfaceArea.toFixed(1)} cm²
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Timeline */}
        {costBreakdown && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Print Timeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded border border-blue-200 flex justify-between items-center">
                <div className="text-blue-700">Estimated Print Time:</div>
                <div className="font-bold text-blue-800 text-xl">
                  {formatPrintTime(costBreakdown.printTimeHours)}
                </div>
              </div>
              {etaCalculation && (
                <div className="bg-white p-4 rounded border border-blue-200 flex justify-between items-center">
                  <div className="text-blue-700">Estimated Delivery:</div>
                  <div className="font-bold text-blue-800">
                    {formatDeliveryDate(etaCalculation.estimatedDate)}
                    <span className="text-xs block text-right text-gray-500">
                      ({formatDuration(etaCalculation.totalDays)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-700 text-base border-b border-gray-200 pb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cost Breakdown
          </h4>

          {/* 3D Printing Costs */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              3D Printing Costs
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm p-2 bg-white rounded border border-gray-200">
                <span className="text-gray-600">Material Cost:</span>
                <span className="font-medium">{formatCost(costBreakdown.materialCost)}</span>
              </div>
              <div className="flex justify-between text-sm p-2 bg-white rounded border border-gray-200">
                <span className="text-gray-600">
                  Printing Cost {isBatch ? '(Hourly)' : '(Tiered)'}:
                </span>
                <span className="font-medium">{formatCost(costBreakdown.printingCost)}</span>
              </div>
              <div className="flex justify-between text-sm p-2 bg-orange-50 rounded border border-orange-200">
                <span className="text-orange-700">Support Material:</span>
                <span className="font-medium text-orange-700">{formatCost(costBreakdown.supportCost || 0)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between font-medium">
                <span className="text-gray-800">Printing Subtotal:</span>
                <span className="text-blue-700">{formatCost(costBreakdown.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Optional Services */}
          {optionalServices.filter(s => s.hours > 0).length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Optional Services
              </h5>
              <div className="space-y-2">
                {optionalServices
                  .filter(service => service.hours > 0)
                  .map((service) => (
                    <div key={service.name} className="flex justify-between text-sm p-2 bg-white rounded border border-purple-200">
                      <span className="text-purple-700">
                        {service.name} ({service.hours}h × {formatCost(service.pricePerHour)}/h):
                      </span>
                      <span className="font-medium text-purple-700">
                        {formatCost(service.hours * service.pricePerHour)}
                      </span>
                    </div>
                  ))}
                <div className="border-t border-purple-300 pt-2 flex justify-between font-medium">
                  <span className="text-purple-900">Services Subtotal:</span>
                  <span className="text-purple-700">{formatCost(optionalServicesTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grand Total */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">Project Total</div>
                <div className="text-blue-100 text-sm">
                  All costs included
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {formatCost(grandTotal)}
                </div>
                {costBreakdown.breakdown.minimumApplied && (
                  <div className="text-xs text-blue-200">
                    *Minimum ${costBreakdown.totalCost} applied
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-yellow-800 mb-2">Estimate Information:</div>
              <ul className="space-y-1 text-xs text-yellow-800">
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-1">•</span>
                  <span>Prices include material costs and professional printing services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-1">•</span>
                  <span>{isBatch ? 'Batch mode provides economical hourly rates' : 'Regular mode ensures fastest completion'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-1">•</span>
                  <span>Delivery times include production, preparation, and shipping</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-1">•</span>
                  <span>Final quote may vary based on file complexity and current queue</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-1">•</span>
                  <span>All prices are in Australian Dollars (AUD)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-green-50 rounded-lg p-5 border border-green-200 text-center">
          <h5 className="font-bold text-green-800 mb-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ready to Print?
          </h5>
          <p className="text-green-700 text-sm mb-4 max-w-md mx-auto">
            Contact Brisbane 3D Printing to confirm your quote and start your project
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Request Quote
            </button>
            <button className="px-5 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateSummary; 