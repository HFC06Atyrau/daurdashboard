import React from 'react';
import { SalesRecord } from '../types';
import { formatCurrency, formatNumber } from '../services/dataService';
import { Translation } from '../translations';

interface TableProps {
  data: SalesRecord[];
  labels: Translation;
}

export const DataTable: React.FC<TableProps> = ({ data, labels }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
          <tr>
            <th className="px-6 py-4 font-semibold tracking-wider">{labels.source}</th>
            <th className="px-6 py-4 font-semibold text-right tracking-wider">{labels.leads}</th>
            <th className="px-6 py-4 font-semibold text-right tracking-wider">{labels.successful}</th>
            <th className="px-6 py-4 font-semibold text-right tracking-wider">{labels.conversion}</th>
            <th className="px-6 py-4 font-semibold text-right tracking-wider">{labels.revenue}</th>
            <th className="px-6 py-4 font-semibold text-right tracking-wider">{labels.avgCheck}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {data.map((row, index) => (
            <tr key={index} className="group hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white transition-colors">{row.source}</td>
              <td className="px-6 py-4 text-right text-slate-400 group-hover:text-slate-300">{row.leads}</td>
              <td className="px-6 py-4 text-right text-slate-400 group-hover:text-slate-300">{row.successful}</td>
              <td className="px-6 py-4 text-right">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                  row.efficiency > 50 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  row.efficiency > 20 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {formatNumber(row.efficiency)}%
                </span>
              </td>
              <td className="px-6 py-4 text-right font-medium text-slate-200 group-hover:text-white">{formatCurrency(row.revenue)}</td>
              <td className="px-6 py-4 text-right text-slate-400 group-hover:text-slate-300">{formatCurrency(row.avgCheck)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};