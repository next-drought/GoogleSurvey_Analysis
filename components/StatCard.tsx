
import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber';
}

const StatCard: React.FC<Props> = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
          <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
