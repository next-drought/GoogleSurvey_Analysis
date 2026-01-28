
import React, { useState } from 'react';
import { AIInsight } from '../types';

interface Props {
  insights: AIInsight[];
  isLoading: boolean;
}

const AiInsights: React.FC<Props> = ({ insights, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'negative': return 'bg-red-50 border-red-200 text-red-800';
      case 'critical': return 'bg-rose-50 border-rose-200 text-rose-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return 'fa-circle-check';
      case 'negative': return 'fa-circle-exclamation';
      case 'critical': return 'fa-triangle-exclamation';
      default: return 'fa-lightbulb';
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-900">AI Executive Insights</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Automated Intelligence Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isLoading && <span className="text-xs text-blue-600 animate-pulse font-bold">PROCESSSING...</span>}
          <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-slate-400 transition-transform duration-300`}></i>
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
          {insights.length === 0 && !isLoading ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fa-solid fa-robot text-4xl mb-3 opacity-20"></i>
              <p className="font-medium">No insights generated yet. Add more data or refresh.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className={`p-5 rounded-xl border ${getTypeColor(insight.type)} shadow-sm`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <i className={`fa-solid ${getTypeIcon(insight.type)} text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-2 leading-tight">{insight.title}</h3>
                      <p className="text-sm opacity-90 mb-4 leading-relaxed">{insight.observation}</p>
                      <div className="pt-3 border-t border-black/5">
                        <span className="inline-block px-2 py-0.5 rounded bg-black/5 text-[10px] font-black uppercase tracking-tighter mb-2">Recommendation</span>
                        <p className="text-sm italic font-medium">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AiInsights;
