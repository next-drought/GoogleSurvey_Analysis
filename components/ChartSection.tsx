
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { DashboardData } from '../types';

interface Props {
  data: DashboardData;
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#4b5563'];

const ChartSection: React.FC<Props> = ({ data }) => {
  // Find numeric headers (likely ratings)
  const numericHeaders = data.headers.filter(header => {
    if (header.toLowerCase().includes('timestamp')) return false;
    const sample = data.rows[0]?.[header];
    return !isNaN(Number(sample)) && sample !== '';
  });

  // Calculate distribution for the first numeric column
  const mainMetric = numericHeaders[0];
  const distribution: any = {};
  data.rows.forEach(row => {
    const val = String(row[mainMetric]);
    distribution[val] = (distribution[val] || 0) + 1;
  });

  const chartData = Object.keys(distribution).map(key => ({
    name: key,
    value: distribution[key]
  })).sort((a, b) => (isNaN(Number(a.name)) ? a.name.localeCompare(b.name) : Number(a.name) - Number(b.name)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Distribution Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-chart-simple text-indigo-600"></i>
          {mainMetric || 'Response Distribution'}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overview Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-chart-pie text-pink-600"></i>
          Response Breakdown
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
