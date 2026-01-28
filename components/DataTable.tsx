
import React, { useState } from 'react';
import { DashboardData } from '../types';

interface Props {
  data: DashboardData;
}

const DataTable: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = data.rows.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-table-list text-slate-600"></i>
          Raw Responses
        </h2>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rows..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-sm shadow-sm z-[5]">
            <tr>
              {data.headers.map((header, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap min-w-[150px]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                  {data.headers.map((header, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4 text-slate-600">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={data.headers.length} className="px-6 py-12 text-center text-slate-400">
                  <i className="fa-solid fa-face-meh text-3xl mb-2 opacity-20"></i>
                  <p>No matches found for your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-medium">
        Showing {filteredRows.length} of {data.rows.length} responses
      </div>
    </section>
  );
};

export default DataTable;
