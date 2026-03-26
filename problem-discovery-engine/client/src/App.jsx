import { motion, AnimatePresence } from 'framer-motion';
import { Search, Rocket, Zap, TrendingUp, RefreshCw, AlertCircle, TrendingDown, Star, Camera, Folder, X, ChevronRight, LogOut, Loader2, ShieldCheck, User as UserIcon, BarChart2, ChevronDown, Mail, Settings, LayoutGrid, PieChart, Activity, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

const UserAvatar = ({ user, className = "w-9 h-9", imageClassName = "", textClassName = "text-xs" }) => {
  if (user?.profilePicture && user.profilePicture !== "") {
    return (
      <img 
        src={user.profilePicture} 
        alt={user.username} 
        className={`${className} rounded-full border-2 border-purple-500/50 object-cover shadow-[0_0_10px_rgba(168,85,247,0.3)] ${imageClassName}`} 
      />
    );
  }
  
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : '?';
  
  return (
    <div className={`${className} rounded-full border-2 border-purple-500/50 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_10px_rgba(168,85,247,0.3)] ${imageClassName}`}>
       <span className={`text-white font-black ${textClassName}`}>{initial}</span>
    </div>
  );
};

const AnalysisDashboard = ({ clusters, onDeepDive }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Matrix */}
        <div className="lg:col-span-2 glass rounded-3xl p-8 border-white/10 relative overflow-hidden h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                <LayoutGrid className="text-purple-400" size={20} />
                Problem Priority Matrix
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Severity vs Frequency</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="text-[10px] font-bold text-slate-400">High Pain</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative border-l-2 border-b-2 border-white/10 ml-8 mb-8">
            {/* Axis Labels */}
            <div className="absolute -left-10 top-1/2 -rotate-90 text-[10px] font-black uppercase tracking-widest text-slate-600">Severity</div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-slate-600">Frequency (Mentions)</div>
            
            {/* Grid Helper Lines */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
               {[...Array(16)].map((_, i) => <div key={i} className="border border-white/5" />)}
            </div>

            {/* Matrix Quads Hints */}
            <div className="absolute top-0 right-0 p-4 text-red-500/20 font-black text-2xl select-none">CRITICAL</div>
            <div className="absolute bottom-0 right-0 p-4 text-purple-500/20 font-black text-2xl select-none">OPPORTUNITY</div>

            {/* Data Points */}
            {clusters.map((cluster, i) => {
              // Normalize for grid (assuming max freq ~100 as per AI prompt)
              const x = (Math.min(cluster.frequency, 100) / 100) * 100;
              const y = (cluster.severity / 10) * 100;
              
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.5, type: 'spring' }}
                  className="absolute cursor-pointer group/point"
                  style={{ left: `${x}%`, bottom: `${y}%`, transform: 'translate(-50%, 50%)' }}
                  onClick={() => onDeepDive(cluster)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-2xl transition-all group-hover/point:scale-150 z-10 ${cluster.severity > 7 ? 'bg-red-500 shadow-red-500/50' : 'bg-purple-500 shadow-purple-500/50'}`} />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 glass rounded-xl border-white/20 opacity-0 group-hover/point:opacity-100 transition-all pointer-events-none z-20 translate-y-2 group-hover/point:translate-y-0 shadow-2xl">
                     <p className="text-xs font-black text-white mb-1 truncate">{cluster.title}</p>
                     <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Freq: {cluster.frequency}</span>
                        <span>Sev: {cluster.severity}/10</span>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Trend Summary */}
        <div className="glass rounded-3xl p-8 border-white/10 flex flex-col h-[500px]">
          <h3 className="text-xl font-black flex items-center gap-2 mb-8">
            <Activity className="text-emerald-400" size={20} />
            Market Pulse
          </h3>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {clusters.map((cluster, i) => (
              <div key={i} className="group/trend p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all cursor-pointer" onClick={() => onDeepDive(cluster)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold truncate max-w-[140px]">{cluster.title}</h4>
                  <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                    cluster.trend === 'Up' ? 'bg-emerald-500/20 text-emerald-400' : 
                    cluster.trend === 'Down' ? 'bg-red-500/20 text-red-400' : 
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {cluster.trend === 'Up' ? <TrendingUp size={10} /> : cluster.trend === 'Down' ? <TrendingDown size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
                    {cluster.trend || 'Stable'}
                  </div>
                </div>
                {/* Mini Graph Dummy */}
                <div className="h-8 w-full flex items-end gap-1 px-1">
                   {[...Array(8)].map((_, j) => {
                     const height = cluster.trend === 'Up' ? 20 + (j * 10) : cluster.trend === 'Down' ? 90 - (j * 10) : 40 + Math.random() * 20;
                     return <div key={j} className={`flex-1 rounded-sm opacity-30 transition-all group-hover/trend:opacity-100 ${cluster.trend === 'Up' ? 'bg-emerald-400' : 'bg-slate-400'}`} style={{ height: `${height}%` }} />;
                   })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex gap-3 items-center">
            <Info className="text-indigo-400 shrink-0" size={20} />
            <p className="text-[11px] text-slate-400 leading-tight">Trends are inferred based on the sentiment and post timing from scraped content.</p>
          </div>
        </div>
      </div>
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

  // New State for View Toggle
  const [view, setView] = useState('list'); // 'list' or 'analysis'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    // Clear any previous discovery errors (like verification required)
    dispatch(setDiscoveryFailure(null));
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
      dispatch(setDiscoveryFailure("Please verify your email to discover new problems."));
      dispatch(openAuthModal('verify')); // Open auth modal in verify mode
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
              <div ref={dropdownRef} className="relative">
                {/* Navbar Profile Trigger Button */}
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-3 bg-white/5 backdrop-blur-md pl-2 pr-4 py-1.5 rounded-full border transition-all active:scale-95 group/profile ${isProfileOpen ? 'border-purple-500/50 bg-white/10 ring-4 ring-purple-500/10' : 'border-white/20 shadow-inner'}`}
                >
                  <div className="relative">
                    <UserAvatar user={user} />
                    {!user.isVerified && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 border-2 border-background rounded-full animate-pulse" />}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-[13px] font-black tracking-tight text-white leading-none">{user.username}</p>
                      {user.isVerified && <ShieldCheck size={12} className="text-sky-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Professional Profile Dropdown ("The Box") */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 glass rounded-3xl overflow-hidden shadow-2xl border border-white/15 z-[60] origin-top-right"
                    >
                      {/* Header Section */}
                      <div className="p-6 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-b border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                           <Rocket size={80} className="-rotate-12" />
                        </div>
                        <div className="relative flex items-center gap-4">
                           <div className="relative group/avatar cursor-pointer">
                              <UserAvatar 
                                user={user} 
                                className="w-14 h-14" 
                                imageClassName="shadow-xl group-hover:opacity-50 transition-all" 
                                textClassName="text-xl"
                              />
                              <button 
                                onClick={() => document.getElementById('avatar-input').click()}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full"
                                title="Change Profile Picture"
                              >
                                <Camera size={16} className="text-white" />
                              </button>
                              <input 
                                type="file" 
                                id="avatar-input" 
                                hidden 
                                onChange={handleAvatarChange} 
                                accept="image/*"
                              />
                           </div>
                           <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <h4 className="text-lg font-black text-white leading-none">{user.username}</h4>
                                {user.isVerified && <ShieldCheck size={14} className="text-sky-400" />}
                              </div>
                              <p className="text-xs text-slate-400 font-medium truncate max-w-[140px] flex items-center gap-1">
                                <Mail size={10} className="text-slate-500" /> {user.email}
                              </p>
                           </div>
                        </div>
                      </div>

                      {/* Menu Section */}
                      <div className="p-3">
                        {!user.isVerified && (
                          <button 
                            onClick={() => {
                              dispatch(openAuthModal('verify'));
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all group mb-2"
                          >
                            <div className="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
                              <ShieldCheck size={18} />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black">Verify Account</p>
                              <p className="text-[10px] opacity-70">Unlock full discovery access</p>
                            </div>
                          </button>
                        )}

                        <button 
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group"
                        >
                          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                            <Settings size={18} />
                          </div>
                          <span className="text-sm font-bold">Account Settings</span>
                          <div className="ml-auto px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-slate-500">Soon</div>
                        </button>

                        <div className="h-px bg-white/5 my-2 mx-2" />

                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all group"
                        >
                          <div className="p-2 bg-white/5 group-hover:bg-red-500/20 transition-all rounded-lg">
                            <LogOut size={18} />
                          </div>
                          <span className="text-sm font-bold">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            <div className="space-y-10">
              {/* View Toggle */}
              <div className="flex justify-center">
                <div className="p-1.5 glass rounded-2xl flex gap-1 border-white/5 shadow-2xl">
                   <button 
                    onClick={() => setView('list')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === 'list' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <LayoutGrid size={16} /> Result Cards
                   </button>
                   <button 
                    onClick={() => setView('analysis')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === 'analysis' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <PieChart size={16} /> Matrix Analysis
                   </button>
                </div>
              </div>

              {view === 'list' ? (
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
              ) : (
                <AnalysisDashboard clusters={clusters} onDeepDive={handleDeepDive} />
              )}
            </div>
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
