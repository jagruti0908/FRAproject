import React from 'react';
import { User, Bell, Shield, Database } from 'lucide-react';
import TopNavbar from '../components/TopNavbar';
import Card from '../components/Card';

interface SettingsProps {
  onMenuClick: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onMenuClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onMenuClick={onMenuClick} />
      
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Settings</h2>
            <p className="text-sm sm:text-base text-gray-600">Manage your account and system preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Settings */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Profile Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@forest.gov.in"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Forest Department</option>
                    <option>Revenue Department</option>
                    <option>Tribal Affairs</option>
                  </select>
                </div>
                
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Update Profile
                </button>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-800">New Claims</p>
                    <p className="text-sm text-gray-600">Get notified about new FRA claims</p>
                  </div>
                  <button className="w-12 h-6 bg-green-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 transition-transform"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-800">Status Updates</p>
                    <p className="text-sm text-gray-600">Claim verification and approval updates</p>
                  </div>
                  <button className="w-12 h-6 bg-green-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 transition-transform"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-800">System Alerts</p>
                    <p className="text-sm text-gray-600">Important system notifications</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-0.5 transition-transform"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-800">Email Reports</p>
                    <p className="text-sm text-gray-600">Weekly and monthly summary reports</p>
                  </div>
                  <button className="w-12 h-6 bg-green-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 transition-transform"></div>
                  </button>
                </div>
              </div>
            </Card>

            {/* Security Settings */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Security</h3>
              </div>
              
              <div className="space-y-4">
                <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-sm sm:text-base font-medium text-gray-800">Change Password</p>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </button>
                
                <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-sm sm:text-base font-medium text-gray-800">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </button>
                
                <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-sm sm:text-base font-medium text-gray-800">Active Sessions</p>
                  <p className="text-sm text-gray-600">Manage your active login sessions</p>
                </button>
              </div>
            </Card>

            {/* System Settings */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">System</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Regional Languages</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                  </select>
                </div>
                
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;