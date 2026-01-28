
import React from 'react';
import { SurveyProject } from '../types';

interface Props {
  projects: SurveyProject[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const Sidebar: React.FC<Props> = ({ projects, activeId, onSelect, onAdd, onDelete }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-magnifying-glass-chart text-xs"></i>
        </div>
        <h1 className="font-bold text-white tracking-tight truncate">Insight Library</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-2">Data Sources</div>
          {projects.length === 0 ? (
            <div className="px-2 py-4 text-xs text-slate-600 italic">No surveys connected</div>
          ) : (
            <div className="space-y-1">
              {projects.map((p) => (
                <div 
                  key={p.id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    activeId === p.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-slate-800 hover:text-slate-100'
                  }`}
                  onClick={() => onSelect(p.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <i className={`fa-solid ${p.source === 'local' ? 'fa-file-csv' : 'fa-link'} text-[10px] opacity-50 ${activeId === p.id ? 'opacity-100' : ''}`}></i>
                    <span className="truncate text-sm font-medium">{p.name}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                    className={`opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity ${activeId === p.id ? 'text-blue-200' : ''}`}
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={onAdd}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border border-slate-700"
        >
          <i className="fa-solid fa-plus"></i>
          Add Data Source
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
