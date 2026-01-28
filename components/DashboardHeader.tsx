
import React from 'react';

interface Props {
  onRefresh: () => void;
  onHome: () => void;
  isLoading: boolean;
  title: string;
}

const DashboardHeader: React.FC<Props> = ({ onRefresh, onHome, isLoading, title }) => {
  const isHomeView = title === "SurveyInsight Pro";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {!isHomeView && (
            <button 
              onClick={onHome}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              title="Back to Home"
            >
              <i className="fa-solid fa-house text-xs"></i>
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-900 truncate">{title}</h1>
          {!isHomeView && (
            <span className="hidden sm:inline px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded tracking-wider">Dashboard</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {!isHomeView && (
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
            >
              <i className={`fa-solid fa-arrows-rotate ${isLoading ? 'animate-spin' : ''}`}></i>
              <span className="hidden md:inline">Refresh Analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
