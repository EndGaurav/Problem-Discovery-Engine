import { useState, useEffect } from 'react';
import { Search, Info, TrendingUp, AlertCircle, Zap, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const ProblemCard = ({ cluster, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/50 hover-glow card-gradient mb-6 cursor-pointer ${expanded ? 'col-span-1 md:col-span-2' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {cluster.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-400">
            {cluster.frequency} mentions
          </span>
          <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <AlertCircle size={12} className="text-red-400" />
            <span className="text-xs font-bold text-red-400">Severity: {cluster.severity}/10</span>
          </div>
        </div>
      </div>

      <p className="text-slate-400 mb-6 line-clamp-2">
        {cluster.summary}
      </p>

      <div className="flex items-center gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Zap size={14} className="text-amber-400 fill-amber-400" />
          <span className="font-semibold text-amber-100">AI Suggested Solution:</span>
          <span className="text-slate-400">{cluster.solution}</span>
        </div>
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
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Technical Path</h4>
              <div className="flex flex-wrap gap-2">
                {cluster.techStack?.split(',').map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/discover`, { keyword });
      setClusters(response.data.clusters);
    } catch (err) {
      console.error(err);
      setError("Failed to discover problems. Make sure the backend is running and GEMINI_API_KEY is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-purple-500">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-3 glass rounded-2xl mb-6"
          >
            <BarChart2 size={32} className="text-purple-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black mb-6 tracking-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent"
          >
            Discovery Engine
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 text-xl max-w-2xl mx-auto"
          >
            We don't give you ideas. We show you what people are already struggling with.
          </motion.p>
        </header>

        {/* Search Bar */}
        <section className="mb-20">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a keyword (e.g. testing, e-commerce, fitness)..."
              className="w-full h-16 glass rounded-2xl pl-16 pr-24 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all group-hover:bg-white/10"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <button
              disabled={loading}
              className="absolute right-3 top-3 h-10 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Discover'}
            </button>
          </form>
          
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            {['SaaS', 'Test Flakiness', 'Crypto UX', 'Fitness Apps'].map(tag => (
              <button
                key={tag}
                onClick={() => setKeyword(tag)}
                className="px-4 py-1.5 glass rounded-full text-sm text-slate-400 hover:bg-white/10 border-white/5 transition-all"
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
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center mb-10 flex items-center justify-center gap-3"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          {clusters.length > 0 && (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clusters.map((cluster, i) => (
                <ProblemCard key={i} cluster={cluster} index={i} />
              ))}
            </motion.div>
          )}

          {loading && clusters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-purple-400 font-bold animate-pulse">Scraping Reddit and analyzing pain points...</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
