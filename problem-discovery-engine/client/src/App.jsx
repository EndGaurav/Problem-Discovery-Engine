import { useState, useEffect } from 'react';
import { Search, Info, TrendingUp, AlertCircle, Zap, ExternalLink, RefreshCw, BarChart2, User as UserIcon, LogOut, ShieldCheck, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import AuthModal from './components/AuthModal';
import ProjectModal from './components/ProjectModal';
import DeepDiveModal from './components/DeepDiveModal';
import { Star, Folder, Plus, Trash2, ChevronRight, Bookmark, Rocket } from 'lucide-react';

const API_BASE = '/api';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ProblemCard = ({ cluster, index, onSave, onDeepDive }) => {
  const [expanded, setExpanded] = useState(false);

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave(cluster);
  };

  const handleDeepDiveClick = (e) => {
    e.stopPropagation();
    onDeepDive(cluster);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass rounded-2xl p-4 md:p-6 transition-all duration-300 hover:border-purple-500/50 hover-glow card-gradient mb-4 md:mb-6 cursor-pointer ${expanded ? 'col-span-1 md:col-span-2' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-tight">
            {cluster.title}
          </h3>
        </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={handleSaveClick}
              className="p-2 glass rounded-full hover:bg-white/10 transition-colors text-amber-400 border-amber-400/20"
              title="Save to Project"
            >
              <Star size={18} fill={cluster.isSaved ? "currentColor" : "none"} />
            </button>
            <span className="px-2 py-1 md:px-3 md:py-1 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs font-semibold text-slate-400">
              {formatNumber(cluster.frequency)} mentions
            </span>
            <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 bg-red-500/10 border border-red-500/20 rounded-full">
              <AlertCircle size={10} className="md:size-[12px] text-red-400" />
              <span className="text-[10px] md:text-xs font-bold text-red-400">Severity: {cluster.severity}/10</span>
            </div>
          </div>
        </div>

      <p className="text-slate-400 mb-4 md:mb-6 text-sm md:text-base line-clamp-2 leading-relaxed">
        {cluster.summary}
      </p>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Zap size={14} className="text-amber-400 fill-amber-400 shrink-0" />
          <span className="font-semibold text-amber-100 whitespace-nowrap">AI Solution:</span>
        </div>
        <span className="text-slate-400 text-sm md:text-base line-clamp-1 italic">{cluster.solution}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6 pt-6 border-t border-white/10 space-y-4"
          >
            <div>
              <h4 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Technical Path</h4>
              <div className="flex flex-wrap gap-2">
                {cluster.techStack?.split(',').map((tech, i) => (
                  <span key={i} className="px-2 py-1 md:px-3 md:py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 font-medium">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={handleDeepDiveClick}
              className="w-full py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 text-purple-300 font-bold hover:bg-purple-600/30 transition-all group"
            >
              <Rocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              AI Deep Dive Analysis
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Projects state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [clusterToSave, setClusterToSave] = useState(null);
  const [activeTab, setActiveTab] = useState('discovery'); // discovery, projects
  const [projects, setProjects] = useState([]);

  // Deep Dive state
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState(null);
  const [deepDiveTarget, setDeepDiveTarget] = useState(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchProjects();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    fetchProjects();
  };

  useEffect(() => {
    if (clusters.length > 0 && projects.length > 0) {
      setClusters(prev => prev.map(c => ({
        ...c,
        isSaved: projects.some(p => p.clusters.some(pc => pc.title === c.title))
      })));
    }
  }, [projects]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_BASE}/auth/update-avatar`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedUser = { ...user, profilePicture: response.data.profilePicture };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload avatar");
    }
  };

  const handleSaveToProjectPrompt = (cluster) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setClusterToSave(cluster);
    setIsProjectModalOpen(true);
  };

  const handleDeepDive = async (cluster) => {
    setDeepDiveTarget(cluster);
    setDeepDiveData(null);
    setIsDeepDiveOpen(true);
    setDeepDiveLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/deep-dive`, 
        { cluster },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeepDiveData(response.data);
    } catch (err) {
      console.error("Deep dive failed", err);
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!user.isVerified) {
      setError("Please verify your email to discover new problems.");
      setIsAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/discover`, 
        { keyword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const markedClusters = response.data.clusters.map(c => ({
        ...c,
        isSaved: projects.some(p => p.clusters.some(pc => pc.title === c.title))
      }));
      
      setClusters(markedClusters);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to discover problems. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-purple-500">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
           {/* Logo placeholder if needed */}
        </div>
        <div className="pointer-events-auto flex items-center gap-4">
          {user && (
            <button 
              onClick={() => {
                setClusterToSave(null);
                setIsProjectModalOpen(true);
              }}
              className="px-4 md:px-6 py-2 glass rounded-full text-xs md:text-sm font-bold bg-white/5 hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 text-purple-300 border-purple-500/20"
            >
              <Folder size={16} /> <span className="hidden sm:inline">My Projects</span>
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-3 glass pl-2 pr-4 py-2 rounded-full border-white/10">
              <div className="relative group/avatar cursor-pointer">
                <img 
                  src={user.profilePicture} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full border-2 border-purple-500/50 object-cover group-hover/avatar:opacity-50 transition-all shadow-inner" 
                />
                <button 
                  onClick={() => document.getElementById('avatar-input').click()}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full"
                  title="Change Avatar"
                >
                  <Camera size={12} className="text-white" />
                </button>
                <input 
                  id="avatar-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-none flex items-center gap-1">
                  {user.username}
                  {user.isVerified && <ShieldCheck size={12} className="text-sky-400" />}
                </p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2 glass rounded-full text-sm font-bold bg-white/5 hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
            >
              <UserIcon size={16} /> Login
            </button>
          )}
        </div>
      </nav>

      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] md:w-[40%] h-[40%] bg-purple-600/10 blur-[80px] md:blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] md:w-[40%] h-[40%] bg-indigo-600/10 blur-[80px] md:blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-24">
        <header className="text-center mb-10 md:mb-16 pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-2 md:p-3 glass rounded-2xl mb-4 md:mb-6"
          >
            <BarChart2 size={24} className="md:size-[32px] text-purple-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent px-4"
          >
            Discovery Engine
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto px-4 leading-relaxed"
          >
            We don't give you ideas. We show you what people are already struggling with.
          </motion.p>
        </header>

        {/* Search Bar */}
        <section className="mb-12 md:mb-20">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group px-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={user ? "Enter a keyword..." : "Login to start discovering..."}
              className="w-full h-14 md:h-16 glass rounded-2xl pl-12 md:pl-16 pr-20 md:pr-32 text-sm md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all group-hover:bg-white/10"
            />
            <Search className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-slate-500 size-5 md:size-6" />
            <button
              disabled={loading}
              className="absolute right-4 md:right-5 top-2 md:top-3 h-10 md:h-10 px-4 md:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 text-xs md:text-base shadow-lg shadow-purple-500/20"
            >
              {loading ? <RefreshCw size={14} className="animate-spin md:size-[18px]" /> : 'Discover'}
            </button>
          </form>
          
          <div className="flex justify-center gap-2 md:gap-4 mt-6 md:mt-8 flex-wrap px-4">
            {['SaaS', 'Test Flakiness', 'Crypto UX', 'Fitness Apps'].map(tag => (
              <button
                key={tag}
                onClick={() => setKeyword(tag)}
                className="px-3 py-1 md:px-4 md:py-1.5 glass rounded-full text-[10px] md:text-sm text-slate-400 hover:bg-white/10 border-white/5 transition-all active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Results Grid */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center mb-10 flex items-center justify-center gap-3 text-sm"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          {clusters.length > 0 && (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {clusters.map((cluster, i) => (
                <ProblemCard 
                  key={i} 
                  cluster={cluster} 
                  index={i} 
                  onSave={handleSaveToProjectPrompt}
                  onDeepDive={handleDeepDive}
                />
              ))}
            </motion.div>
          )}

          {loading && clusters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
              <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-purple-400 font-bold animate-pulse text-sm md:text-base text-center px-6">Scraping Reddit and analyzing pain points...</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        {isProjectModalOpen && (
          <ProjectModal 
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            clusterToSave={clusterToSave}
            onSaveSuccess={() => {
              setIsProjectModalOpen(false);
              setClusterToSave(null);
              fetchProjects();
            }}
          />
        )}
        {isDeepDiveOpen && (
          <DeepDiveModal 
            isOpen={isDeepDiveOpen}
            onClose={() => setIsDeepDiveOpen(false)}
            cluster={deepDiveTarget}
            data={deepDiveData}
            loading={deepDiveLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
