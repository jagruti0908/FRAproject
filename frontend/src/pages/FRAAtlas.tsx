import React, { useState } from 'react';
import { Layers, Filter } from 'lucide-react';
import TopNavbar from '../components/TopNavbar';
import MapView from '../components/MapView';
import Card from '../components/Card';
import { sampleClaims } from '../data/mockData';

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

interface FRAAtlasProps {
  onMenuClick: () => void;
}

const FRAAtlas: React.FC<FRAAtlasProps> = ({ onMenuClick }) => {
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'forest', name: 'Forest Boundaries', visible: true, color: '#16a34a' },
    { id: 'villages', name: 'Villages', visible: true, color: '#f59e0b' },
    { id: 'water', name: 'Water Bodies', visible: true, color: '#3b82f6' },
    { id: 'claims', name: 'FRA Claims', visible: true, color: '#dc2626' },
  ]);

  const [selectedState, setSelectedState] = useState<string>('all');
  const [showControls, setShowControls] = useState(false);

  const toggleLayer = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const states = ['all', 'Madhya Pradesh', 'Odisha', 'Tripura', 'Telangana'];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onMenuClick={onMenuClick} />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Controls Panel */}
        <div className={`lg:w-80 bg-white shadow-lg p-4 sm:p-6 overflow-y-auto ${
          showControls ? 'block' : 'hidden lg:block'
        }`}>
          {/* Mobile toggle button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="lg:hidden mb-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg"
          >
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </button>
          
          {/* Layers Control */}
          <Card className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Map Layers</h3>
            </div>
            
            <div className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: layer.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{layer.name}</span>
                  </div>
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      layer.visible ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      layer.visible ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Filters</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state === 'all' ? 'All States' : state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Legend */}
          <Card>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-sm text-gray-700">Forest Boundaries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Villages</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Water Bodies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">FRA Claims</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Mobile controls toggle */}
        <div className="lg:hidden p-4 bg-white border-b">
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{showControls ? 'Hide Controls' : 'Show Controls & Filters'}</span>
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1">
          <MapView 
            claims={sampleClaims.filter(claim => 
              selectedState === 'all' || claim.state === selectedState
            )} 
            className="h-full" 
          />
        </div>
      </div>
    </div>
  );
};

export default FRAAtlas;