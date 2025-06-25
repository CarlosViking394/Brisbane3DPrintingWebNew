import React, { useState, useEffect } from 'react';
import { ETACalculation, CostBreakdown, MaterialType } from '../types';
import { 
  calculateETA, 
  calculateETAWithoutLocation, 
  formatDeliveryDate, 
  formatDuration,
  getDeliveryUrgency 
} from '../utils/etaCalculator';

interface ETACalculatorProps {
  costBreakdown?: CostBreakdown;
  materialCategory?: 'standard' | 'exotic' | 'reinforced';
  className?: string;
}

const ETACalculator: React.FC<ETACalculatorProps> = ({
  costBreakdown,
  materialCategory = 'standard',
  className = ''
}) => {
  const [etaCalculation, setEtaCalculation] = useState<ETACalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [showLocationDetails, setShowLocationDetails] = useState(false);

  // Get color scheme based on material category
  const getColors = () => {
    switch (materialCategory) {
      case 'exotic':
        return {
          primary: 'text-purple-600',
          bg: 'bg-purple-100',
          border: 'border-purple-200',
          highlight: 'bg-purple-100 text-purple-700',
          buttonBg: 'bg-purple-600 hover:bg-purple-700',
          text: 'text-purple-700'
        };
      case 'reinforced':
        return {
          primary: 'text-orange-600',
          bg: 'bg-orange-100',
          border: 'border-orange-200',
          highlight: 'bg-orange-100 text-orange-700',
          buttonBg: 'bg-orange-600 hover:bg-orange-700',
          text: 'text-orange-700'
        };
      default: // standard
        return {
          primary: 'text-blue-600',
          bg: 'bg-blue-100',
          border: 'border-blue-200',
          highlight: 'bg-blue-100 text-blue-700',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          text: 'text-blue-700'
        };
    }
  };

  const colors = getColors();

  // Calculate ETA when print time changes
  useEffect(() => {
    if (costBreakdown?.printTimeHours) {
      calculateETAEstimate();
    } else {
      setEtaCalculation(null);
    }
  }, [costBreakdown?.printTimeHours]);

  const calculateETAEstimate = async () => {
    if (!costBreakdown?.printTimeHours) return;

    setIsCalculating(true);
    
    try {
      // Check geolocation permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setLocationPermission(permission.state);
      }

      // Calculate ETA with geolocation
      const eta = await calculateETA(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
    } catch (error) {
      console.warn('ETA calculation failed:', error);
      // Fallback to calculation without geolocation
      const eta = calculateETAWithoutLocation(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLocationRequest = async () => {
    if (!costBreakdown?.printTimeHours) return;

    setIsCalculating(true);
    try {
      const eta = await calculateETA(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
      setLocationPermission('granted');
    } catch (error) {
      console.warn('Location request failed:', error);
      setLocationPermission('denied');
      const eta = calculateETAWithoutLocation(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
    } finally {
      setIsCalculating(false);
    }
  };

  const urgency = etaCalculation ? getDeliveryUrgency(etaCalculation.totalDays) : null;

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg border ${colors.border} ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-2 ${colors.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Delivery Estimate
        </h3>
        {etaCalculation && urgency && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${urgency.color} bg-current/10`}>
            {urgency.description}
          </span>
        )}
      </div>

      {isCalculating ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 mt-4">Calculating delivery estimate...</p>
        </div>
      ) : etaCalculation ? (
        <div className="space-y-6">
          {/* Main Delivery Date */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-2">Estimated Delivery</div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {formatDeliveryDate(etaCalculation.estimatedDate)}
            </div>
            <div className="text-sm text-gray-600">
              {etaCalculation.estimatedDate.toLocaleDateString('en-AU', { 
                timeZone: 'Australia/Brisbane',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="inline-block px-4 py-1 mt-3 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {formatDuration(etaCalculation.totalDays)} total time
            </div>
          </div>

          {/* Location Status */}
          {etaCalculation.isGeolocationUsed ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-green-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-green-800">Location-based estimate</span>
              </div>
              {etaCalculation.userLocation && (
                <button
                  onClick={() => setShowLocationDetails(!showLocationDetails)}
                  className="text-sm text-green-600 hover:text-green-800 hover:underline flex items-center font-medium"
                  aria-expanded={showLocationDetails}
                  aria-label="Toggle location details"
                >
                  {showLocationDetails ? 
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Hide details
                    </span> : 
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      View details
                    </span>
                  }
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-yellow-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-yellow-800">
                  {etaCalculation.locationError || 'Using standard delivery estimate'}
                </span>
              </div>
              {locationPermission !== 'denied' && (
                <button
                  onClick={handleLocationRequest}
                  className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center font-medium"
                  aria-label="Enable location for accurate estimate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Enable Location
                </button>
              )}
            </div>
          )}

          {/* Location Details */}
          {showLocationDetails && etaCalculation.userLocation && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Location Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                  <span className="text-sm text-gray-600">Distance to Brisbane:</span>
                  <span className="text-sm font-medium text-gray-800">{etaCalculation.userLocation.distance?.toFixed(1)} km</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                  <span className="text-sm text-gray-600">Shipping time:</span>
                  <span className="text-sm font-medium text-gray-800">{formatDuration(etaCalculation.shippingDays)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ETA Breakdown */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${colors.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Delivery Timeline
            </h4>
            
            <div className="space-y-3">
              {/* Print Time */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md">
                <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">3D Printing</span>
                    <span className={`text-sm ${colors.highlight} px-3 py-1 rounded-full`}>
                      {formatDuration(etaCalculation.printTimeDays)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prep Time */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md">
                <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Preparation & Quality Control</span>
                    <span className={`text-sm ${colors.highlight} px-3 py-1 rounded-full`}>
                      {formatDuration(etaCalculation.prepDays)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Queue Delay */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md">
                <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Production Queue</span>
                    <span className={`text-sm ${colors.highlight} px-3 py-1 rounded-full`}>
                      {formatDuration(etaCalculation.queueDelayDays)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md">
                <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      Shipping {etaCalculation.isGeolocationUsed ? '(to your location)' : '(standard)'}
                    </span>
                    <span className={`text-sm ${colors.highlight} px-3 py-1 rounded-full`}>
                      {formatDuration(etaCalculation.shippingDays)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className={`p-4 ${colors.bg} rounded-xl border ${colors.border} transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${colors.primary} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <div className={`font-bold ${colors.text} mb-2`}>Delivery Information:</div>
                <ul className={`space-y-2 text-sm ${colors.text}`}>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${colors.primary}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All items are shipped from Brisbane, Australia
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${colors.primary}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Delivery times include production and shipping
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${colors.primary}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {etaCalculation.isGeolocationUsed ? 'Location-based' : 'Standard'} shipping estimate
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${colors.primary}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Actual delivery may vary based on current workload
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">Upload a Model</h4>
            <p className="text-gray-600 max-w-md mx-auto">Get delivery estimates based on your location and print time</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ETACalculator; 