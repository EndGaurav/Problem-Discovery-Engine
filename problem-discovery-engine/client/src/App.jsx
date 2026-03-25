import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Rocket, Zap, TrendingUp, RefreshCw, AlertCircle, TrendingDown, Star, Camera, Folder, X, ChevronRight, LogOut, Loader2, ShieldCheck, User as UserIcon, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setCredentials, updateUser, openAuthModal, closeAuthModal } from './store/slices/authSlice';
import { setKeyword, toggleSource, setDiscoveryStart, setDiscoverySuccess, setDiscoveryFailure, updateClusters } from './store/slices/discoverySlice';
import { setProjects, openProjectModal, closeProjectModal } from './store/slices/projectSlice';
import { openDeepDiveModal, closeDeepDiveModal, setDeepDiveData, setDeepDiveTarget, setDeepDiveLoading } from './store/slices/deepDiveSlice';
import ProjectModal from './components/ProjectModal';
import AuthModal from './components/AuthModal';
import DeepDiveModal from './components/DeepDiveModal';

const API_BASE = '/api';

const ALL_SOURCES = ['Reddit', 'Hacker News', 'X', 'Product Hunt'];

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ProblemCard = ({ cluster, index, onSave, onDeepDive }) => {
  const [expanded, setExpanded] = useState(false);

  const safeStr = (val) => {
    if (typeof val === 'string') return val;
    if (!val) return '';
    return JSON.stringify(val);
  };

  const safeTags = (val) => {
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    if (Array.isArray(val)) return val;
    return [];
  };

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
            {safeStr(cluster.title)}
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
        {safeStr(cluster.summary)}
      </p>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Zap size={14} className="text-amber-400 fill-amber-400 shrink-0" />
          <span className="font-semibold text-amber-100 whitespace-nowrap">AI Solution:</span>
        </div>
        <span className="text-slate-400 text-sm md:text-base line-clamp-1 italic">{safeStr(cluster.solution)}</span>
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
                {safeTags(cluster.techStack).map((tech, i) => (
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
  const dispatch = useDispatch();
  
  // Redux State
  const { user, token, isAuthModalOpen } = useSelector(state => state.auth);
  const { keyword, clusters, loading, error, selectedSources } = useSelector(state => state.discovery);
  const { projects, isModalOpen: isProjectModalOpen, clusterToSave } = useSelector(state => state.projects);
  const { isModalOpen: isDeepDiveOpen, data: deepDiveData, target: deepDiveTarget, loading: deepDiveLoading } = useSelector(state => state.deepDive);

  useEffect(() => {
    if (user) {
      fetchUserProjects();
    }
  }, [user, token]); // Added token to dependency array

  const fetchUserProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      dispatch(setProjects(response.data));
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  const handleAuthSuccess = (data) => {
    dispatch(setCredentials(data));
    // Auth modal close is handled by the auth slice or the modal itself
    fetchUserProjects();
  };

  useEffect(() => {
    if (clusters.length > 0) {
      const marked = clusters.map(c => ({
        ...c,
        isSaved: projects.some(p => (p.clusters || []).some(pc => pc.title === c.title))
      }));
      
      // Only dispatch if the saved status actually changed to prevent loops
      const hasChanged = JSON.stringify(marked) !== JSON.stringify(clusters);
      if (hasChanged) {
        dispatch(updateClusters(marked));
      }
    }
  }, [projects]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.put(`${API_BASE}/auth/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      dispatch(updateUser({ profilePicture: response.data.profilePicture }));
    } catch (err) {
      console.error("Failed to update avatar");
      // Optionally dispatch an error to a global error state or display a toast
    }
  };

  const handleSaveToProjectPrompt = (cluster) => {
    if (!user) {
      dispatch(openAuthModal());
      return;
    }
    dispatch(openProjectModal(cluster));
  };

  const handleDeepDive = async (cluster) => {
    dispatch(setDeepDiveTarget(cluster));
    dispatch(setDeepDiveData(null));
    dispatch(openDeepDiveModal());
    dispatch(setDeepDiveLoading(true));

    try {
      const response = await axios.post(`${API_BASE}/deep-dive`, 
        { cluster },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setDeepDiveData(response.data));
    } catch (err) {
      console.error("Deep dive failed", err);
      // Optionally dispatch an error to a global error state
    } finally {
      dispatch(setDeepDiveLoading(false));
    }
  };

  const handleDiscovery = async (e) => {
    if (e) e.preventDefault();
    if (!keyword) return;

    if (!user) {
      dispatch(openAuthModal());
      return;
    }

    if (!user.isVerified) {
      dispatch(setDiscoveryFailure("Please verify your email to discover new problems.")); // Using discovery error for this
      dispatch(openAuthModal()); // Open auth modal to prompt verification
      return;
    }

    dispatch(setDiscoveryStart());
    try {
      const response = await axios.post(`${API_BASE}/discover`, 
        { keyword, sources: selectedSources },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const markedClusters = response.data.clusters.map(c => ({
        ...c,
        isSaved: projects.some(p => p.clusters.some(pc => pc.title === c.title))
      }));
      
      dispatch(setDiscoverySuccess(markedClusters));
    } catch (err) {
      console.error(err);
      dispatch(setDiscoveryFailure(err.response?.data?.message || "Failed to discover problems. Make sure the backend is running."));
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-purple-500">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Rocket className="text-white" size={20} />
             </div>
             <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Discovery Engine</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <button 
                onClick={() => dispatch(openProjectModal())}
                className="px-4 md:px-6 py-2.5 glass rounded-full text-xs md:text-sm font-bold bg-white/5 hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/5 group"
              >
                <Folder size={16} className="group-hover:scale-110 transition-transform" /> 
                <span className="hidden sm:inline">Bookmarks</span>
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md pl-2 pr-4 py-1.5 rounded-full border border-white/20 shadow-inner group/profile">
                <div className="relative group/avatar cursor-pointer">
                  <img 
                    src={user.profilePicture} 
                    alt={user.username} 
                    className="w-9 h-9 rounded-full border-2 border-purple-500/50 object-cover group-hover/avatar:opacity-50 transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                  />
                  <button 
                    onClick={() => document.getElementById('avatar-input').click()}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/60 rounded-full"
                    title="Change Avatar"
                  >
                    <Camera size={14} className="text-white" />
                  </button>
                  <input 
                    type="file" 
                    id="avatar-input" 
                    hidden 
                    onChange={handleAvatarChange} 
                    accept="image/*"
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-black tracking-tight text-white leading-none">{user.username}</p>
                    {user.isVerified && <ShieldCheck size={12} className="text-sky-400" />}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-[9px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors font-bold uppercase mt-0.5"
                  >
                    <LogOut size={9} /> Logout
                  </button>
                </div>
              </div>
            ) : (
            <button
              onClick={() => dispatch(openAuthModal())}
              className="px-6 py-2 glass rounded-full text-sm font-bold bg-white/5 hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
            >
              <UserIcon size={16} /> Login
            </button>
          )}
          </div>
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
          <form onSubmit={handleDiscovery} className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-400 group-hover:scale-110 transition-transform" />
            <input 
              type="text" 
              placeholder="Domain (e.g. Fintech, Edtech, SaaS)" 
              className="w-full h-16 md:h-20 glass rounded-full pl-16 pr-32 md:pr-40 focus:outline-none focus:ring-4 focus:ring-purple-500/20 text-md md:text-lg font-medium transition-all"
              value={keyword}
              onChange={(e) => dispatch(setKeyword(e.target.value))}
            />
            <button 
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 md:h-14 px-6 md:px-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-black text-xs md:text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin md:size-[18px]" /> : 'Discover'}
            </button>
          </form>

          {/* Sources Selector */}
          <div className="flex flex-col items-center gap-2 mt-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Research Sources</span>
            <div className="flex flex-wrap justify-center gap-2 p-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 shadow-inner">
              {ALL_SOURCES.map(source => {
                const isActive = selectedSources.includes(source);
                return (
                  <button
                    key={source}
                    onClick={() => dispatch(toggleSource(source))}
                    className={`px-5 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${
                      isActive 
                        ? 'bg-purple-600/10 text-white border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-purple-400 animate-pulse' : 'bg-slate-700'}`} />
                    {source}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col items-center mt-6 md:mt-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Suggested Topics</span>
            <div className="flex justify-center gap-2 md:gap-4 flex-wrap px-4">
              {['SaaS', 'Test Flakiness', 'Crypto UX', 'Fitness Apps'].map(tag => (
                <button
                  key={tag}
                  onClick={() => dispatch(setKeyword(tag))}
                  className="px-3 py-1 md:px-4 md:py-1.5 glass rounded-full text-[10px] md:text-sm text-slate-400 hover:bg-white/10 border-white/5 transition-all active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
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
            onClose={() => dispatch(closeAuthModal())} 
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        {isProjectModalOpen && (
          <ProjectModal 
            isOpen={isProjectModalOpen}
            onClose={() => dispatch(closeProjectModal())}
            clusterToSave={clusterToSave}
            onOpenCluster={handleDeepDive}
            onSaveSuccess={() => {
              dispatch(closeProjectModal());
              fetchUserProjects();
            }}
          />
        )}
        {isDeepDiveOpen && (
          <DeepDiveModal 
            isOpen={isDeepDiveOpen}
            onClose={() => dispatch(closeDeepDiveModal())}
            cluster={deepDiveTarget}
            data={deepDiveData}
            loading={deepDiveLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
