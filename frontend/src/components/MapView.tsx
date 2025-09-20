import React from 'react';
import { Claim } from '../types';

interface MapViewProps {
  claims: Claim[];
  className?: string;
  showControls?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ claims, className = '', showControls = true }) => {
  return (
    <div className={`relative bg-green-50 rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200">
        {/* Map container */}
        <div className="w-full h-full relative">
          {/* Dummy map background */}
          <div className="absolute inset-0 bg-green-100 opacity-50">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Forest areas */}
              <rect x="50" y="50" width="80" height="60" fill="#16a34a" opacity="0.3" rx="4" />
              <rect x="200" y="80" width="100" height="80" fill="#16a34a" opacity="0.3" rx="4" />
              <rect x="80" y="160" width="90" height="70" fill="#16a34a" opacity="0.3" rx="4" />
              
              {/* Water bodies */}
              <ellipse cx="150" cy="120" rx="30" ry="15" fill="#3b82f6" opacity="0.4" />
              <ellipse cx="280" cy="200" rx="25" ry="12" fill="#3b82f6" opacity="0.4" />
              
              {/* Villages */}
              <circle cx="120" cy="100" r="3" fill="#f59e0b" />
              <circle cx="250" cy="140" r="3" fill="#f59e0b" />
              <circle cx="180" cy="200" r="3" fill="#f59e0b" />
              <circle cx="320" cy="180" r="3" fill="#f59e0b" />
            </svg>
          </div>
          
          {/* Claims markers */}
          {claims.slice(0, 10).map((claim, index) => (
            <div
              key={claim.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${20 + (index * 8) % 60}%`,
                top: `${30 + (index * 12) % 40}%`,
              }}
            >
              <div className={`w-4 h-4 rounded-full shadow-lg transition-all duration-200 group-hover:scale-150 ${
                claim.status === 'Verified' ? 'bg-green-600' :
                claim.status === 'Approved' ? 'bg-blue-600' :
                claim.status === 'Pending' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {claim.id} - {claim.type}
                <br />
                {claim.applicantName}
              </div>
            </div>
          ))}
        </div>
        
        {showControls && (
          <>
            {/* Map controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 space-y-2">
              <button className="block w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold transition-colors">+</button>
              <button className="block w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold transition-colors">-</button>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span>Verified Claims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Approved Claims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending Claims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Rejected Claims</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapView;