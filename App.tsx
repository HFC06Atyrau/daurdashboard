import React, { useMemo, useState, useEffect } from 'react';
import { 
  Activity, 
  Wallet, 
  Users, 
  Target, 
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  MoreHorizontal,
  Languages,
  CheckCircle2,
  Scale,
  RotateCcw
} from 'lucide-react';
import { getProcessedData, calculateKPIs, formatCurrency, formatNumber } from './services/dataService';
import { StatCard } from './components/StatCard';
import { RevenueChart, EfficiencyChart, ScatterAnalysis, RevenuePieChart, ConversionBarChart, VolumeVsValueChart, TopAvgCheckChart } from './components/DashboardCharts';
import { DataTable } from './components/DataTable';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { FileUploader } from './components/FileUploader';
import { TRANSLATIONS } from './translations';
import { Language, SalesRecord } from './types';

const App = () => {
  const [lang, setLang] = useState<Language>('ru');
  const [activeData, setActiveData] = useState<SalesRecord[]>([]);
  const [isCustomData, setIsCustomData] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize with default data
  useEffect(() => {
    setActiveData(getProcessedData());
  }, []);

  const kpis = useMemo(() => calculateKPIs(activeData), [activeData]);
  
  const t = TRANSLATIONS[lang];

  const toggleLang = () => {
    setLang(prev => prev === 'ru' ? 'en' : 'ru');
  };

  const handleDataLoaded = (data: SalesRecord[]) => {
    setActiveData(data);
    setIsCustomData(true);
    setUploadError(null);
  };

  const handleResetData = () => {
    setActiveData(getProcessedData());
    setIsCustomData(false);
    setUploadError(null);
  };

  const handleError = (msg: string) => {
    setUploadError(msg);
    setTimeout(() => setUploadError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-tight font-manrope">{t.appTitle}<span className="text-indigo-400">.</span></h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
               {/* Upload / Reset Controls */}
               {isCustomData ? (
                 <button 
                  onClick={handleResetData}
                  className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20"
                 >
                   <RotateCcw className="w-4 h-4" />
                   <span className="uppercase hidden sm:inline">{t.resetData}</span>
                 </button>
               ) : (
                 <FileUploader onDataLoaded={handleDataLoaded} onError={handleError} labels={t} />
               )}

               <div className="w-px h-8 bg-white/10 hidden md:block"></div>
               
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCustomData ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isCustomData ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isCustomData ? t.customData : t.liveData}
                  </span>
               </div>
               
               <button 
                onClick={toggleLang}
                className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
               >
                  <Languages className="w-4 h-4" />
                  <span className="uppercase">{lang}</span>
               </button>

               <button className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors hidden sm:flex">
                  <span>{t.settings}</span>
                  <MoreHorizontal className="w-4 h-4" />
               </button>
            </div>
          </div>
          
          {/* Error Message Toast */}
          {uploadError && (
            <div className="absolute top-24 right-6 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-5 duration-300">
              {uploadError}
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <StatCard 
            title={t.totalRevenue} 
            value={formatCurrency(kpis.totalRevenue)}
            icon={Wallet} 
            color="text-indigo-400"
          />
          <StatCard 
            title={t.totalLeads} 
            value={formatNumber(kpis.totalLeads)}
            icon={Users} 
            color="text-sky-400"
          />
           <StatCard 
            title={t.successfulDeals} 
            value={formatNumber(kpis.totalSuccessful)}
            icon={CheckCircle2} 
            color="text-rose-400"
          />
          <StatCard 
            title={t.conversionRate} 
            value={`${formatNumber(kpis.avgEfficiency)}%`}
            icon={Target} 
            color="text-emerald-400"
          />
          <StatCard 
            title={t.avgCheck} 
            value={formatCurrency(kpis.avgCheckGlobal)}
            subValue={t.currency}
            icon={TrendingUp} 
            color="text-amber-400"
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Top Charts Row: Main Revenue & Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                      <h3 className="text-lg font-bold text-white">{t.revenueBySource}</h3>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{t.revenueBySourceSub}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
                <RevenueChart data={activeData} labels={t} />
              </div>

              <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <PieIcon className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{t.distribution}</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{t.marketShare}</p>
                    </div>
                 </div>
                <div className="flex-1 flex items-center justify-center">
                    <RevenuePieChart data={activeData} labels={t} />
                </div>
              </div>
            </div>

            {/* Middle Row: Volume vs Value & Efficiency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="glass-panel p-8 rounded-3xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <Scale className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                         <h3 className="text-lg font-bold text-white">{t.volumeVsValue}</h3>
                         <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{t.volumeVsValueSub}</p>
                    </div>
                 </div>
                 <VolumeVsValueChart data={activeData} labels={t} />
              </div>
              <div className="glass-panel p-8 rounded-3xl">
                 <h3 className="text-lg font-bold text-white mb-6">{t.efficiencyMatrix}</h3>
                 <EfficiencyChart data={activeData} labels={t} />
              </div>
            </div>
            
             {/* Bottom Row: Sales Funnel, Avg Check Ranking, Scatter */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="glass-panel p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-6">{t.salesFunnel}</h3>
                    <ConversionBarChart data={activeData} labels={t} />
                 </div>
                 <div className="glass-panel p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-6">{t.avgCheckRanking}</h3>
                    <TopAvgCheckChart data={activeData} labels={t} />
                 </div>
             </div>

             {/* Scatter Analysis (Full Width) */}
             <div className="glass-panel p-8 rounded-3xl">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">{t.qualityAnalysis}</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{t.qualityAnalysisSub}</p>
                    </div>
                </div>
                <ScatterAnalysis data={activeData} labels={t} />
             </div>

             {/* Table */}
             <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">{t.detailedReport}</h3>
                    <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors">{t.exportCsv}</button>
                </div>
                <DataTable data={activeData} labels={t} />
            </div>

          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 space-y-6">
               <AIInsightsPanel data={activeData} lang={lang} labels={t} />
               
               {/* Promo Card */}
               <div className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-teal-500/20">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                      <ArrowUpRight className="w-32 h-32 text-teal-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 relative z-10">{t.proInsights}</h4>
                  <p className="text-teal-200/60 text-sm mb-6 relative z-10 leading-relaxed">
                    {t.connectCrm}
                  </p>
                  <button className="relative z-10 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-bold rounded-lg border border-teal-500/20 transition-all uppercase tracking-wider">
                      {t.comingSoon}
                  </button>
               </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;