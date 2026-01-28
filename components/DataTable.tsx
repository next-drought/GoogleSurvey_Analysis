
import React, { useState } from 'react';
import { DashboardData } from '../types';

interface Props {
  data: DashboardData;
}

const DataTable: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out headers that contain PII keywords
  const safeHeaders = data.headers.filter(h => {
    const low = h.toLowerCase();
    return !['name', 'email', 'mail', 'affiliation', 'phone', 'contact', 'address'].some(pii => low.includes(pii));
  });

  const filteredRows = data.rows.filter(row => 
    safeHeaders.some(header => 
      String(row[header] || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-table-list text-slate-500"></i>
            Data Grid
          </h2>
          <span className="hidden md:inline px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded uppercase border border-emerald-100">
            Anonymized
          </span>
        </div>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Quick search..."
            className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-48 transition-all shadow-sm"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-left table-fixed">
          <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-md shadow-sm z-[5]">
            <tr>
              {safeHeaders.map((header, idx) => (
                <th key={idx} className="px-3 py-2.5 font-bold text-slate-700 text-[10px] uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis border-r border-slate-200 last:border-0 w-[200px]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-blue-50/30 transition-colors border-b border-slate-50">
                  {safeHeaders.map((header, cellIdx) => (
                    <td key={cellIdx} className="px-3 py-1.5 text-slate-600 text-[11px] leading-tight border-r border-slate-50 last:border-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {row[header] || <span className="text-slate-300 italic">n/a</span>}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={safeHeaders.length} className="px-3 py-10 text-center text-slate-400">
                  <p className="text-xs font-medium">No records found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
          Count: {filteredRows.length} / {data.rows.length}
        </span>
        <span className="text-[9px] text-slate-400 italic">
          High-density view active.
        </span>
      </div>
    </section>
  );
};

export default DataTable;
