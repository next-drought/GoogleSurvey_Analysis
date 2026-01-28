
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
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSurveyName, setNewSurveyName] = useState('');
  const [newSurveyUrl, setNewSurveyUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('survey_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      if (parsed.length > 0) setActiveProjectId(parsed[0].id);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    // We only save metadata and link URLs to localStorage. 
    // Local file content is kept in session for privacy and size limits.
    const toSave = projects.map(p => ({ ...p, localContent: p.source === 'local' ? p.localContent : undefined }));
    localStorage.setItem('survey_projects', JSON.stringify(toSave));
  }, [projects]);

  const parseCsvContent = (text: string): DashboardData => {
    const rows = text.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) throw new Error('The CSV seems empty or malformed.');

    const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
    const parsedRows = rows.slice(1).map(row => {
      const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/"/g, '').trim());
      const entry: any = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
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
    setIsLoading(true);
    setError(null);
    setData(null);
    setInsights([]);
    
    try {
      let csvText = '';
      if (project.source === 'link' && project.url) {
        const response = await fetch(project.url);
        if (!response.ok) throw new Error('Failed to fetch data from link.');
        csvText = await response.text();
      } else if (project.source === 'local' && project.localContent) {
        csvText = project.localContent;
      } else {
        throw new Error('No data source found for this survey.');
      }

      const parsedData = parseCsvContent(csvText);
      setData(parsedData);

      const aiInsights = await analyzeSurveyData(parsedData.rows);
      setInsights(aiInsights);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const active = projects.find(p => p.id === activeProjectId);
    if (active) {
      fetchData(active);
    }
  }, [activeProjectId, projects, fetchData]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurveyName || !newSurveyUrl) return;

    const newProject: SurveyProject = {
      id: crypto.randomUUID(),
      name: newSurveyName,
      url: newSurveyUrl,
      source: 'link',
      createdAt: Date.now()
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setNewSurveyName('');
    setNewSurveyUrl('');
    setShowAddModal(false);
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsLoading(true);
    const newLocalProjects: SurveyProject[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.csv')) {
        try {
          const content = await file.text();
          newLocalProjects.push({
            id: crypto.randomUUID(),
            name: file.name.replace('.csv', ''),
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
      setError("No valid CSV files found in the selected folder.");
    }
    
    setIsLoading(false);
    setShowAddModal(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (activeProjectId === id) {
        setActiveProjectId(filtered.length > 0 ? filtered[0].id : null);
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
        onAdd={() => setShowAddModal(true)}
        onDelete={handleDeleteProject}
      />

      <div className="flex-1 ml-64 min-h-screen pb-12">
        <DashboardHeader 
          onRefresh={() => activeProject && fetchData(activeProject)} 
          onReset={() => {}} 
          isLoading={isLoading} 
          title={activeProject?.name || "Select a Survey"}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
              <div>
                <strong className="font-bold">Error: </strong>
                <span>{error}</span>
              </div>
              <button onClick={() => setShowAddModal(true)} className="text-sm font-medium underline">Try Again</button>
            </div>
          )}

          {!activeProjectId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 text-3xl mb-6">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Survey Data</h2>
              <p className="text-slate-500 mb-8">Choose between importing a Google Sheet link or selecting a local folder containing your CSV exports.</p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex flex-col items-center gap-2"
                >
                  <i className="fa-solid fa-link"></i>
                  <span>Cloud Link</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-900 transition-all flex flex-col items-center gap-2"
                >
                  <i className="fa-solid fa-folder-tree"></i>
                  <span>Local Folder</span>
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="font-medium text-slate-600">Analyzing {activeProject?.name}...</p>
              <p className="text-xs text-slate-400 mt-2">Running AI models and generating visualizations</p>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Responses" value={data.rows.length} icon="fa-users" color="blue" />
                <StatCard title="Total Questions" value={data.headers.length - 1} icon="fa-circle-question" color="indigo" />
                <StatCard title="Last Updated" value={data.timestamp.split(',')[1] || "Just now"} icon="fa-clock" color="emerald" />
                <StatCard title="Source Type" value={activeProject?.source === 'local' ? 'Local File' : 'Cloud Sync'} icon={activeProject?.source === 'local' ? 'fa-file-csv' : 'fa-cloud'} color="amber" />
              </div>

              <AiInsights insights={insights} isLoading={isLoading} />
              <ChartSection data={data} />
              <DataTable data={data} />
            </div>
          ) : null}
        </main>
      </div>

      {/* Hidden Folder Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFolderUpload}
        style={{ display: 'none' }}
        {...({ webkitdirectory: "" } as any)} 
      />

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Import Survey</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
              <button className="flex-1 py-2 text-sm font-bold bg-white text-blue-600 rounded-lg shadow-sm">Cloud Link</button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Local Folder
              </button>
            </div>
            
            <form onSubmit={handleAddProject} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Survey Name</label>
                <input
                  type="text"
                  value={newSurveyName}
                  onChange={(e) => setNewSurveyName(e.target.value)}
                  placeholder="e.g. Q4 Feedback"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Google Sheets CSV Link</label>
                <input
                  type="text"
                  value={newSurveyUrl}
                  onChange={(e) => setNewSurveyUrl(e.target.value)}
                  placeholder="Paste Published CSV URL..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                Connect Cloud Survey
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
