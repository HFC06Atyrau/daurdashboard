import React, { useState } from 'react';
import { SalesRecord, Language } from '../types';
import { generateInsights } from '../services/geminiService';
import { Sparkles, Loader2, AlertCircle, Bot, Zap, X } from 'lucide-react';
import { Translation } from '../translations';

interface AIProps {
  data: SalesRecord[];
  lang: Language;
  labels: Translation;
}

export const AIInsightsPanel: React.FC<AIProps> = ({ data, lang, labels }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateInsights(data, lang);
      if (result) {
        setInsights(result);
      }
    } catch (err) {
      setError(labels.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] rounded-3xl p-1 border border-indigo-500/20 h-full flex flex-col shadow-2xl relative overflow-hidden group">
      {/* Animated Border Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-1000"></div>
      
      <div className="bg-[#0f172a] rounded-[22px] p-6 h-full flex flex-col relative z-10">
        
        <div className="flex items-center gap-3 mb-6 border-b border-indigo-500/10 pb-4">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{labels.aiAdvisor}</h2>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Gemini 3.0 Live</p>
                </div>
            </div>
        </div>
        
        {!insights ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                    <Sparkles className="w-12 h-12 text-indigo-400 relative z-10" />
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-white font-semibold">{labels.readyToAnalyze}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                        {labels.readyToAnalyzeSub}
                    </p>
                </div>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center text-indigo-400">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <span className="text-xs font-medium tracking-wide">{labels.generating}</span>
                    </div>
                ) : (
                    <button
                    onClick={handleGenerate}
                    className="w-full py-4 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                    >
                        <Zap className="w-4 h-4 fill-slate-900" />
                        <span>{labels.generate}</span>
                    </button>
                )}
                
                {error && (
                    <div className="text-red-400 text-xs flex items-center gap-2 bg-red-950/30 px-4 py-3 rounded-lg border border-red-900/50">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>
        ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                     <div className="prose prose-invert prose-sm max-w-none">
                         <div className="whitespace-pre-line text-slate-300 text-sm leading-7 font-normal">
                            {insights.replace(/\*\*/g, '').replace(/###/g, '')}
                        </div>
                     </div>
                </div>
                 <button
                    onClick={() => setInsights(null)}
                    className="mt-6 w-full py-3 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors uppercase tracking-wider"
                >
                    <X className="w-3 h-3" />
                    {labels.closeReport}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};