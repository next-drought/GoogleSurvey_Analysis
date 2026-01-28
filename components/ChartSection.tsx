
import React from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DashboardData } from '../types';

interface Props {
  data: DashboardData;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#64748b', '#06b6d4', '#f43f5e', '#94a3b8'];

const ChartSection: React.FC<Props> = ({ data }) => {
  // Helper to get frequencies for a specific column title (fuzzy match)
  const getFrequencyData = (possibleHeaders: string[]) => {
    // Attempt to find a header that contains ANY of the keywords
    const actualHeader = data.headers.find(h => {
      const lowerH = h.toLowerCase().trim();
      return possibleHeaders.some(p => lowerH.includes(p.toLowerCase()));
    });

    if (!actualHeader) return [];

    const distribution: any = {};
    data.rows.forEach(row => {
      let val = row[actualHeader];
      
      // Clean the value
      let label = 'Not Specified';
      if (val !== undefined && val !== null && String(val).trim() !== '' && String(val).toLowerCase() !== 'undefined') {
        const fullVal = String(val).trim();
        
        // Smarter label truncation: 
        // If it's short, keep it. If it's long, take first 3 words to preserve more context (e.g., "Agency - Full Service")
        const words = fullVal.split(/\s+/);
        if (words.length <= 4) {
          label = fullVal.replace(/[,:/\\()]/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          label = words.slice(0, 3).join(' ').replace(/[,:/\\()]/g, ' ').trim() + '...';
        }
        
        if (label === '' || label === '...') label = 'Not Specified';
      }

      distribution[label] = (distribution[label] || 0) + 1;
    });

    return Object.keys(distribution).map(name => ({
      name,
      value: distribution[name]
    })).sort((a, b) => b.value - a.value);
  };

  // Expanded keywords to catch "What is your role?", "Select your identity", etc.
  const roleData = getFrequencyData(['Author', 'Creator', 'Agency', 'Identity', 'Role', 'Status', 'Description']);
  const fieldData = getFrequencyData(['field of work', 'work', 'industry', 'profession', 'specialization', 'sector', 'business', 'area', 'department']);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      // Use the name to find the correct data source for percentage calculation
      const isRole = roleData.some(d => d.name === item.name && d.value === item.value);
      const dataSource = isRole ? roleData : fieldData;
      const total = dataSource.reduce((sum, d) => sum + d.value, 0);
      const percent = ((item.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100">
          <p className="text-sm font-bold text-slate-800">{item.name}</p>
          <p className="text-xs font-semibold text-blue-600">{item.value} responses ({percent}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Role Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-user-tie text-blue-600"></i>
            Identity / Role
          </h3>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">Identity</span>
        </div>
        <div className="h-[320px] w-full">
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Not Specified' ? '#cbd5e1' : COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm text-center px-8">
              <i className="fa-solid fa-magnifying-glass mb-2 text-2xl opacity-20"></i>
              <p>Could not detect Identity column.</p>
              <p className="text-[10px] mt-1 text-slate-400 not-italic">Scanned for: Author, Creator, Agency, Role, Status</p>
            </div>
          )}
        </div>
      </div>

      {/* Field of Work Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-briefcase text-indigo-600"></i>
            Field of Work
          </h3>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">Industry</span>
        </div>
        <div className="h-[320px] w-full">
          {fieldData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fieldData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fieldData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Not Specified' ? '#cbd5e1' : COLORS[(index + 2) % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm text-center px-8">
              <i className="fa-solid fa-magnifying-glass mb-2 text-2xl opacity-20"></i>
              <p>Could not detect Work Field column.</p>
              <p className="text-[10px] mt-1 text-slate-400 not-italic">Scanned for: Work, Industry, Profession, Sector, Business</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
