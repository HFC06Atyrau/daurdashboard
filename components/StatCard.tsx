import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color: string; // Expecting tailwind text colors like 'text-emerald-400'
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon: Icon, color }) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl p-6 glass-panel transition-all duration-500 hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-2xl hover:border-white/10">
      
      {/* Dynamic Glow Effect */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700 ${color.replace('text-', 'bg-')}`}></div>
      
      {/* Additional subtle gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent`}></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out shadow-sm`}>
            <Icon className={`w-6 h-6 ${color} transition-colors duration-300`} />
          </div>
          {subValue && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 group-hover:border-white/10 transition-colors">
              {subValue}
            </span>
          )}
        </div>
        
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 group-hover:text-slate-300 transition-colors">{title}</h3>
          <p className="text-3xl font-bold text-slate-100 tracking-tight group-hover:scale-[1.02] origin-left transition-transform duration-300">{value}</p>
        </div>
      </div>
    </div>
  );
};