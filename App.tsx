
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeSurveyData } from './services/geminiService';
import { DashboardData, AIInsight, SurveyProject } from './types';
import DashboardHeader from './components/DashboardHeader';
import StatCard from './components/StatCard';
import ChartSection from './components/ChartSection';
import AiInsights from './components/AiInsights';
import DataTable from './components/DataTable';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [projects, setProjects] = useState<SurveyProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('survey_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      // We don't auto-select anymore to allow users to see the home screen on fresh load if they want
    }
  }, []);

  useEffect(() => {
    const toSave = projects.map(p => ({ ...p, localContent: p.source === 'local' ? p.localContent : undefined }));
    localStorage.setItem('survey_projects', JSON.stringify(toSave));
  }, [projects]);

  const parseCsvContent = (text: string): DashboardData => {
    const cleanText = text.replace(/^\uFEFF/, '');
    const rows = cleanText.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 1) throw new Error('The CSV seems empty.');

    const headerLine = rows[0];
    const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => 
      h.replace(/^"|"$/g, '').trim()
    );

    if (rows.length < 2) {
      return { headers, rows: [], timestamp: new Date().toLocaleString() };
    }

    const parsedRows = rows.slice(1).map(row => {
      const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => 
        v.replace(/^"|"$/g, '').trim()
      );
      const entry: any = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] !== undefined ? values[index] : '';
      });
      return entry;
    });

    return {
      headers,
      rows: parsedRows,
      timestamp: new Date().toLocaleString()
    };
  };

  const fetchData = useCallback(async (project: SurveyProject) => {
    setError(null);
    setInsights([]);
    
    try {
      if (project.source !== 'local' || !project.localContent) {
        throw new Error('No local data content found.');
      }

      const parsedData = parseCsvContent(project.localContent);
      setData(parsedData);

      setIsAiAnalyzing(true);
      const sanitizedRows = parsedData.rows.map(row => {
        const clean: any = {};
        Object.keys(row).forEach(k => {
          const lowK = k.toLowerCase();
          if (!['name', 'email', 'mail', 'affiliation', 'phone', 'contact', 'address'].some(pii => lowK.includes(pii))) {
            clean[k] = row[k] || 'Not Specified';
          }
        });
        return clean;
      });

      const aiInsights = await analyzeSurveyData(sanitizedRows);
      setInsights(aiInsights);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsAiAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const active = projects.find(p => p.id === activeProjectId);
    if (active) {
      fetchData(active);
    } else {
      setData(null);
      setInsights([]);
    }
  }, [activeProjectId, projects, fetchData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newLocalProjects: SurveyProject[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.csv')) {
        try {
          const content = await file.text();
          newLocalProjects.push({
            id: crypto.randomUUID(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            localContent: content,
            source: 'local',
            createdAt: Date.now()
          });
        } catch (err) {
          console.error(`Error reading ${file.name}`, err);
        }
      }
    }

    if (newLocalProjects.length > 0) {
      setProjects(prev => [...prev, ...newLocalProjects]);
      setActiveProjectId(newLocalProjects[0].id);
    } else {
      setError("No valid CSV files were selected.");
    }
    
    if (e.target) e.target.value = '';
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (activeProjectId === id) {
        setActiveProjectId(null);
      }
      return filtered;
    });
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        projects={projects} 
        activeId={activeProjectId} 
        onSelect={setActiveProjectId} 
        onHome={() => setActiveProjectId(null)}
        onAdd={() => fileInputRef.current?.click()}
        onDelete={handleDeleteProject}
      />

      <div className="flex-1 ml-64 min-h-screen pb-12">
        <DashboardHeader 
          onRefresh={() => activeProject && fetchData(activeProject)} 
          onHome={() => setActiveProjectId(null)}
          isLoading={isAiAnalyzing} 
          title={activeProject?.name || "SurveyInsight Pro"}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold underline">Try Again</button>
            </div>
          )}

          {!activeProjectId ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
              <div className="flex flex-col items-center justify-center pt-12 text-center max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-blue-600 text-4xl mb-8 animate-pulse shadow-xl shadow-blue-500/10">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Turn Survey Data into Clarity</h2>
                <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                  Professional anonymization and AI-driven trend analysis for your Google Forms exports. 
                  Everything stays in your browser.
                </p>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-600/40 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-4 group"
                >
                  <i className="fa-solid fa-plus-circle text-2xl group-hover:rotate-90 transition-transform"></i>
                  <span>New Survey Dashboard</span>
                </button>
              </div>

              {/* Instructions Section */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <i className="fa-brands fa-google text-blue-500"></i>
                      Google Forms: How to get CSV?
                    </h3>
                    <div className="space-y-4">
                      {[
                        { step: "01", text: "Open your Google Form in your browser." },
                        { step: "02", text: "Click the 'Responses' tab at the top center." },
                        { step: "03", text: "Click the green 'Link to Sheets' icon (top right)." },
                        { step: "04", text: "In the Sheet, go to File > Download > Comma Separated Values (.csv)." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-blue-600 font-black text-sm pt-0.5">{item.step}</span>
                          <p className="text-slate-600 text-sm font-medium leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-shield-halved text-emerald-400"></i>
                        Privacy First
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Our dashboard automatically detects and hides PII (Personally Identifiable Information) like Emails, Names, and Phone numbers before any analysis begins.
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white border border-slate-200 rounded-3xl">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-bolt text-amber-500"></i>
                        Fast & Local
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Data is parsed instantly in your browser. AI insights are generated via high-speed Gemini processing for professional-grade reporting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <StatCard title="Total Responses" value={data.rows.length} icon="fa-users" color="blue" />
                <StatCard title="Last Updated" value={data.timestamp.split(',')[1] || "Just now"} icon="fa-clock-rotate-left" color="emerald" />
              </div>

              <ChartSection data={data} />
              <DataTable data={data} />
              
              <AiInsights insights={insights} isLoading={isAiAnalyzing} />
            </div>
          ) : null}
        </main>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept=".csv"
        multiple
      />
    </div>
  );
};

export default App;
