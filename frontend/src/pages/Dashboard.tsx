import React from 'react';
import { FileText, CheckCircle, Clock, Award } from 'lucide-react';
import TopNavbar from '../components/TopNavbar';
import StatCard from '../components/StatCard';
import MapView from '../components/MapView';
import Card from '../components/Card';
import { dashboardStats, sampleClaims } from '../data/mockData';

interface DashboardProps {
  onMenuClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onMenuClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onMenuClick={onMenuClick} />
      
      <div className="p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <StatCard
            title="Total Claims"
            value={dashboardStats.totalClaims}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Verified Claims"
            value={dashboardStats.verifiedClaims}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Pending Claims"
            value={dashboardStats.pendingClaims}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Titles Granted"
            value={dashboardStats.titlesGranted}
            icon={Award}
            color="purple"
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <Card className="h-64 sm:h-80 lg:h-96">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Claims Distribution Map</h3>
              <MapView claims={sampleClaims} className="h-48 sm:h-64 lg:h-80" />
            </Card>
          </div>
          
          {/* Recent Claims */}
          <div className="xl:col-span-1">
            <Card className="h-64 sm:h-80 lg:h-96">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Recent Claims</h3>
              <div className="space-y-3 overflow-y-auto h-48 sm:h-64 lg:h-80">
                {sampleClaims.map((claim) => (
                  <div key={claim.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800 text-sm">{claim.id}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        claim.status === 'Verified' ? 'bg-green-100 text-green-700' :
                        claim.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                        claim.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{claim.applicantName}</p>
                    <p className="text-xs text-gray-500 truncate">{claim.village}, {claim.state}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        claim.type === 'IFR' ? 'bg-green-100 text-green-700' :
                        claim.type === 'CR' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {claim.type}
                      </span>
                      <span className="text-xs text-gray-500">{claim.area} hectares</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;