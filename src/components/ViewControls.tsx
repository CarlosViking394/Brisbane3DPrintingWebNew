import React from 'react';

interface ViewControlsProps {
  onViewChange: (position: [number, number, number], target?: [number, number, number]) => void;
  onResetView: () => void;
  onToggleGrid?: (showGrid: boolean) => void;
  showGrid?: boolean;
  className?: string;
}

const ViewControls: React.FC<ViewControlsProps> = ({ 
  onViewChange, 
  onResetView, 
  onToggleGrid,
  showGrid = true,
  className = '' 
}) => {
  const presetViews = [
    { 
      name: 'Top', 
      position: [0, 50, 0] as [number, number, number], 
      target: [0, 0, 0] as [number, number, number],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    },
    { 
      name: 'Front', 
      position: [0, 0, 50] as [number, number, number], 
      target: [0, 0, 0] as [number, number, number],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      )
    },
    { 
      name: 'Right', 
      position: [50, 0, 0] as [number, number, number], 
      target: [0, 0, 0] as [number, number, number],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )
    },
    { 
      name: 'ISO', 
      position: [35, 35, 35] as [number, number, number], 
      target: [0, 0, 0] as [number, number, number],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      )
    },
  ];

  return (
    <div className={`absolute top-4 left-4 z-10 ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 space-y-4">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          View Controls
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {presetViews.map((view) => (
            <button
              key={view.name}
              onClick={() => onViewChange(view.position, view.target)}
              className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 hover:text-blue-600 
                       bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 
                       hover:border-blue-300 transition-all duration-200"
              aria-label={`View model from ${view.name} perspective`}
            >
              <span className="mr-1.5">{view.icon}</span>
              {view.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col space-y-2">
          {onToggleGrid && (
            <button
              onClick={() => onToggleGrid(!showGrid)}
              className={`w-full px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center
                        ${showGrid 
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
              aria-pressed={showGrid}
              aria-label="Toggle grid visibility"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </button>
          )}
          
          <button
            onClick={onResetView}
            className="w-full px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 
                     hover:bg-blue-100 rounded-lg border border-blue-300 
                     transition-all flex items-center justify-center"
            aria-label="Reset view to default position"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewControls; 