import React from "react";
import { PieChart, TrendingUp, BarChart3 } from "lucide-react";
import TopNavbar from "../components/TopNavbar";
import Card from "../components/Card";
import {
  claimDistributionData,
  yearlyProgressData,
  stateWiseData,
} from "../data/mockData";

interface ReportsProps {
  onMenuClick: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onMenuClick }) => {
  const maxValue = Math.max(...Object.values(stateWiseData));

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onMenuClick={onMenuClick} />

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Reports & Analytics
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Comprehensive insights into FRA implementation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Claims Distribution Pie Chart */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="w-5 h-5 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Claims Distribution
              </h3>
            </div>

            <div className="h-48 sm:h-64 flex items-center justify-center">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full transform -rotate-90"
                >
                  {/* IFR - 41.8% */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="16"
                    strokeDasharray="209 500"
                    strokeDashoffset="0"
                  />
                  {/* CR - 30.5% */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeDasharray="153 500"
                    strokeDashoffset="-209"
                  />
                  {/* CFR - 27.7% */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="16"
                    strokeDasharray="138 500"
                    strokeDashoffset="-362"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span className="text-xs sm:text-sm text-gray-700">
                    Individual Forest Rights
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  5,200 (41.8%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-xs sm:text-sm text-gray-700">
                    Community Rights
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  3,800 (30.5%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-xs sm:text-sm text-gray-700">
                    Community Forest Rights
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  3,450 (27.7%)
                </span>
              </div>
            </div>
          </Card>

          {/* Year-wise Progress Line Chart */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Year-wise Progress
              </h3>
            </div>

            <div className="h-48 sm:h-64">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Grid lines */}
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Data line */}
                <polyline
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3"
                  points="50,150 100,120 150,100 200,80 250,85 300,110"
                />

                {/* Data points */}
                {yearlyProgressData.values.map((_, index) => (
                  <circle
                    key={index}
                    cx={50 + index * 50}
                    cy={200 - yearlyProgressData.values[index] / 40}
                    r="4"
                    fill="#16a34a"
                  />
                ))}

                {/* X-axis labels */}
                {yearlyProgressData.labels.map((label, index) => (
                  <text
                    key={index}
                    x={50 + index * 50}
                    y={190}
                    textAnchor="middle"
                    className="text-xs sm:text-sm fill-gray-600"
                  >
                    {label}
                  </text>
                ))}
              </svg>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Claims processed per year
              </p>
            </div>
          </Card>
        </div>

        {/* State-wise Distribution */}
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              State-wise Claims Distribution
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(stateWiseData).map(([state, value]) => (
              <div key={state} className="flex items-center">
                <div className="w-24 sm:w-32 text-xs sm:text-sm text-gray-700 truncate">
                  {state}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(value / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 sm:w-20 text-right text-xs sm:text-sm font-medium text-gray-800">
                  {value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
