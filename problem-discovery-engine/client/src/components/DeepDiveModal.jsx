import { motion } from 'framer-motion';
import { X, Target, Users, Map, ShieldAlert, Rocket, ChevronRight, Loader2 } from 'lucide-react';

export default function DeepDiveModal({ isOpen, onClose, data, cluster, loading }) {
  if (!isOpen) return null;

  const renderContent = (val) => {
    if (typeof val === 'string') return val;
    if (!val) return 'No data available.';
    return JSON.stringify(val, null, 2);
  };

  const renderList = (val) => {
    if (typeof val === 'string') {
      return val.split('\n').filter(s => s.trim());
    }
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
       return Object.entries(val).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
    }
    return [];
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl glass rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1 block">AI Deep Dive Analysis</span>
            <h2 className="text-2xl font-black">{cluster?.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 size={48} className="animate-spin text-purple-500 mb-6" />
              <h3 className="text-xl font-bold mb-2">Analyzing market and roadmaps...</h3>
              <p className="text-slate-400">Our AI is researching competitors and estimating feasibility.</p>
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Market Opportunity */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-purple-400">
                  <Target size={24} />
                  <h3 className="text-lg font-bold">Market Opportunity</h3>
                </div>
                <div className="p-5 glass rounded-2xl bg-purple-500/5 border-purple-500/10">
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {renderContent(data.marketOpportunity)}
                  </p>
                </div>
              </section>

              {/* Competitor Analysis */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-red-400">
                  <Users size={24} />
                  <h3 className="text-lg font-bold">Competitor Analysis</h3>
                </div>
                <div className="p-5 glass rounded-2xl bg-red-500/5 border-red-500/10">
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {renderContent(data.competitorAnalysis)}
                  </p>
                </div>
              </section>

              {/* MVP Blueprint */}
              <section className="col-span-1 md:col-span-2 space-y-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <Map size={24} />
                  <h3 className="text-lg font-bold">MVP Launch Roadmap</h3>
                </div>
                <div className="p-5 glass rounded-2xl bg-amber-500/5 border-amber-500/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {renderList(data.mvpBlueprint).map((step, i) => (
                     <div key={i} className="flex gap-3 items-start border-l-2 border-amber-500/20 pl-4 py-1">
                        <span className="text-amber-500/50 font-black text-xl leading-none">{i+1}</span>
                        <p className="text-slate-400 text-sm leading-tight">{step.replace(/^\d+\.\s*/, '')}</p>
                     </div>
                   ))}
                </div>
              </section>

              {/* Technical Feasibility */}
              <section className="col-span-1 md:col-span-2 space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <ShieldAlert size={24} />
                  <h3 className="text-lg font-bold">Feasibility & Roadblocks</h3>
                </div>
                <div className="p-5 glass rounded-2xl bg-emerald-500/5 border-emerald-500/10 flex items-center gap-6">
                  <Rocket className="text-emerald-500/20 shrink-0 hidden sm:block" size={48} />
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {renderContent(data.technicalFeasibility)}
                  </p>
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-10 text-red-400">
              Failed to load analysis. Please try again.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10"
          >
            Close Analysis
          </button>
        </div>
      </motion.div>
    </div>
  );
}
