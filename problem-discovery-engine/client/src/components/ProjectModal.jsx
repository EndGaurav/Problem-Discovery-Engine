import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Folder, Trash2, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = '/api/projects';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function ProjectModal({ isOpen, onClose, clusterToSave, onSaveSuccess, onOpenCluster }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // list, create, clusters
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (!selectedProject) setView('list');
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      if (selectedProject) {
        setSelectedProject(response.data.find(p => p._id === selectedProject._id));
      }
    } catch (err) {
      setError("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_BASE, 
        { name: newProjectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([response.data, ...projects]);
      setNewProjectName('');
      setView('list');
    } catch (err) {
      setError("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToProject = async (projectId) => {
    if (!clusterToSave) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/${projectId}/save`, clusterToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSaveSuccess();
    } catch (err) {
      setError("Failed to save cluster");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      setError("Failed to delete folder");
    }
  };

  const handleRemoveCluster = async (projectId, clusterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE}/${projectId}/clusters/${clusterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedProject(response.data);
      fetchProjects();
    } catch (err) {
      setError("Failed to remove item");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl glass rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
             {view !== 'list' && (
               <button 
                onClick={() => {
                  setView('list');
                  setSelectedProject(null);
                }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
               >
                 <X size={20} className="rotate-45" /> {/* Back icon */}
               </button>
             )}
             <h2 className="text-xl font-bold flex items-center gap-2">
              <Folder size={20} className="text-purple-400" />
              {view === 'clusters' ? selectedProject?.name : (clusterToSave ? 'Save to Folder' : 'Your Folders')}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {view === 'list' && (
            <>
              <button 
                onClick={() => setView('create')}
                className="w-full p-4 glass rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group border-dashed border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <Plus size={18} className="text-purple-400" />
                  </div>
                  <span className="font-bold text-slate-300">Create New Folder</span>
                </div>
                <ChevronRight size={18} className="text-slate-600" />
              </button>

              <div className="space-y-3 pt-2">
                {projects.map(project => (
                  <div 
                    key={project._id}
                    onClick={() => {
                      if (clusterToSave) {
                        handleSaveToProject(project._id);
                      } else {
                        setSelectedProject(project);
                        setView('clusters');
                      }
                    }}
                    className={`w-full p-4 glass rounded-2xl flex items-center justify-between transition-all group border-white/5 cursor-pointer hover:bg-white/5 hover:border-purple-500/30`}
                  >
                    <div className="flex items-center gap-3">
                      <Folder size={18} className="text-indigo-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-200">{project.name}</p>
                        <p className="text-xs text-slate-500">{project.clusters.length} items</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!clusterToSave && (
                        <button 
                          onClick={(e) => handleDeleteProject(e, project._id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <ChevronRight size={18} className="text-slate-600" />
                    </div>
                  </div>
                ))}
                
                {projects.length === 0 && !loading && (
                  <p className="text-center py-10 text-slate-500 italic">No folders yet. Create one to get started.</p>
                )}
                
                {loading && (
                  <div className="flex justify-center py-10">
                    <Loader2 size={24} className="animate-spin text-purple-500" />
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'create' && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input 
                autoFocus
                type="text"
                placeholder="Folder Name (e.g. AI SaaS Ideas)"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full h-14 glass rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setView('list')}
                  className="flex-1 h-12 glass rounded-2xl font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  disabled={loading || !newProjectName.trim()}
                  className="flex-[2] h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Folder'}
                </button>
              </div>
            </form>
          )}

          {view === 'clusters' && selectedProject && (
            <div className="space-y-4">
              {selectedProject.clusters.map(c => (
                <div 
                  key={c._id} 
                  onClick={() => onOpenCluster(c)}
                  className="p-4 glass rounded-2xl border-white/5 space-y-3 relative group/card cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-purple-500/20"
                >
                  <div className="flex justify-between items-start pr-8">
                    <h3 className="font-bold text-slate-100 group-hover/card:text-purple-400 transition-colors leading-tight">{c.title}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCluster(selectedProject._id, c._id);
                      }}
                      className="absolute top-4 right-4 p-2 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover/card:opacity-100 z-10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{c.summary}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-red-500/10 rounded-full text-[10px] text-red-300 font-bold border border-red-500/10">Severity: {c.severity}/10</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 rounded-full text-[10px] text-indigo-300 font-bold border border-indigo-500/10 underline decoration-indigo-500/30">{formatNumber(c.frequency)} mentions</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 group-hover/card:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
              {selectedProject.clusters.length === 0 && (
                <p className="text-center py-10 text-slate-500 italic">This folder is empty.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
