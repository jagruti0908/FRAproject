import React, { useState } from 'react';
import { Search, FileText, MapPin, Calendar } from 'lucide-react';
import TopNavbar from '../components/TopNavbar';
import Card from '../components/Card';
import { sampleClaims } from '../data/mockData';

interface CommunityPortalProps {
  onMenuClick: () => void;
}

const CommunityPortal: React.FC<CommunityPortalProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const found = sampleClaims.find(claim => 
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.applicantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResult(found || null);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onMenuClick={onMenuClick} />
      
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Community Portal</h2>
            <p className="text-sm sm:text-base text-gray-600">Check your FRA claim status and get updates</p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Search Your Claim</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your Claim ID or Name (try: FRA-2024-0001 or Ramesh Kumar)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </Card>

          {/* Search Results */}
          {searchResult && (
            <Card className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Claim Details</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Claim ID</label>
                      <p className="text-sm sm:text-base text-gray-800 font-mono">{searchResult.id}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Applicant Name</label>
                      <p className="text-sm sm:text-base text-gray-800">{searchResult.applicantName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Claim Type</label>
                      <span className={`inline-block px-2 py-1 text-sm rounded ${
                        searchResult.type === 'IFR' ? 'bg-green-100 text-green-700' :
                        searchResult.type === 'CR' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {searchResult.type === 'IFR' ? 'Individual Forest Rights' :
                         searchResult.type === 'CR' ? 'Community Rights' :
                         'Community Forest Rights'}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                        searchResult.status === 'Verified' ? 'bg-green-100 text-green-700' :
                        searchResult.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                        searchResult.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {searchResult.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-sm sm:text-base text-gray-800">{searchResult.village}, {searchResult.state}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Submission Date</label>
                        <p className="text-sm sm:text-base text-gray-800">{new Date(searchResult.submissionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Area (Hectares)</label>
                      <p className="text-sm sm:text-base text-gray-800">{searchResult.area}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Processing Timeline</h4>
                <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1">Submitted</span>
                  </div>
                  <div className="flex-1 h-1 bg-green-600"></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['Verified', 'Approved'].includes(searchResult.status) ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1">Verified</span>
                  </div>
                  <div className={`flex-1 h-1 ${
                    searchResult.status === 'Approved' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      searchResult.status === 'Approved' ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1">Approved</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {searchQuery && !searchResult && !isSearching && (
            <Card>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">No Results Found</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  We couldn't find any claims matching "{searchQuery}". 
                  Please check your Claim ID or contact your local forest office.
                </p>
              </div>
            </Card>
          )}

          {/* Information Cards */}
          {!searchResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">How to Use</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Enter your Claim ID (format: FRA-YYYY-NNNN)</li>
                  <li>• Or search by your registered name</li>
                  <li>• View real-time status updates</li>
                  <li>• Check processing timeline</li>
                </ul>
              </Card>
              
              <Card>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Contact your local Forest Department office:</p>
                  <p>📞 1800-XXX-XXXX (Toll Free)</p>
                  <p>✉️ fra.support@forest.gov.in</p>
                  <p>🕒 Mon-Fri: 9:00 AM - 5:00 PM</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPortal;