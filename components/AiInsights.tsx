
import React from 'react';
import { AIInsight } from '../types';

interface Props {
  insights: AIInsight[];
  isLoading: boolean;
}

const AiInsights: React.FC<Props> = ({ insights, isLoading }) => {
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
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-wand-magic-sparkles text-blue-600"></i>
          AI Executive Insights
        </h2>
        {isLoading && <span className="text-xs text-blue-600 animate-pulse font-medium">Updating...</span>}
      </div>
      
      <div className="p-6">
        {insights.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-slate-400">
            <i className="fa-solid fa-robot text-3xl mb-2 opacity-20"></i>
            <p>No insights generated yet. Add more data or refresh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-5 rounded-xl border ${getTypeColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <i className={`fa-solid ${getTypeIcon(insight.type)} mt-1`}></i>
                  <div>
                    <h3 className="font-bold mb-1 leading-tight">{insight.title}</h3>
                    <p className="text-sm opacity-90 mb-3">{insight.observation}</p>
                    <div className="mt-2 pt-2 border-t border-black/5">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Recommendation</p>
                      <p className="text-sm italic">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AiInsights;
