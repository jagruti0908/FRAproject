import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-green-500 text-green-700 bg-green-50',
    blue: 'bg-blue-500 text-blue-700 bg-blue-50',
    yellow: 'bg-yellow-500 text-yellow-700 bg-yellow-50',
    purple: 'bg-purple-500 text-purple-700 bg-purple-50',
  };

  const [iconBg, textColor, cardBg] = colorClasses[color].split(' ');

  return (
    <div className={`${cardBg} rounded-lg p-6 shadow-md transition-transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${textColor} mt-1`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`${iconBg} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;