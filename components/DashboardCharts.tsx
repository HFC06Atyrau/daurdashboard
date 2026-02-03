import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line,
  Scatter,
  PieChart,
  Pie,
  Legend,
  Area
} from 'recharts';
import { SalesRecord } from '../types';
import { formatCurrency, formatNumber } from '../services/dataService';
import { Translation } from '../translations';

interface ChartProps {
  data: SalesRecord[];
  labels: Translation;
}

// Dark theme palette: Neon Cyan, Hot Pink, Violet, Lime, Orange
const COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#a3e635', '#fb923c', '#e879f9', '#38bdf8', '#818cf8'];

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-md p-4 rounded-xl shadow-2xl z-50">
        {label && <p className="text-slate-300 text-sm font-semibold mb-2">{label}</p>}
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="text-sm font-bold flex items-center gap-2" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
            {formatter ? formatter(p.value, p.name) : `${p.name}: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<ChartProps> = ({ data, labels }) => {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="source" 
          type="category" 
          width={130} 
          tick={{ fontSize: 13, fill: '#cbd5e1', fontWeight: 600 }} 
          interval={0}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} cursor={{fill: '#ffffff05'}} />
        <Bar dataKey="revenue" name={labels.revenue} radius={[0, 6, 6, 0]} barSize={24}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const VolumeVsValueChart: React.FC<ChartProps> = ({ data, labels }) => {
    // Sort by Leads to make the volume bars look organized
    const sortedData = [...data].sort((a,b) => b.leads - a.leads);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={sortedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="source" 
            scale="point" 
            padding={{ left: 20, right: 20 }} 
            tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 500}} 
            interval={0} 
            angle={-45} 
            textAnchor="end" 
            height={80} 
            axisLine={false}
            tickLine={false}
          />
          {/* Left Y-Axis for Leads (Bars) */}
          <YAxis yAxisId="left" orientation="left" stroke="#38bdf8" tick={{fontSize: 12, fill: '#38bdf8', fontWeight: 600}} axisLine={false} tickLine={false} />
          {/* Right Y-Axis for Revenue (Line) */}
          <YAxis yAxisId="right" orientation="right" stroke="#f472b6" tick={{fontSize: 12, fill: '#f472b6', fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
          
          <Tooltip content={<CustomTooltip formatter={(value: number, name: string) => {
              if (name === labels.revenue) return formatCurrency(value);
              return value;
          }} />} cursor={{fill: '#ffffff05'}} />
          
          <Bar yAxisId="left" dataKey="leads" name={labels.leads} barSize={24} fill="#38bdf8" fillOpacity={0.6} radius={[6, 6, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name={labels.revenue} stroke="#f472b6" strokeWidth={4} dot={{r:5, fill: '#0f172a', strokeWidth: 2}} />
        </ComposedChart>
      </ResponsiveContainer>
    );
};

export const TopAvgCheckChart: React.FC<ChartProps> = ({ data, labels }) => {
    const sortedData = [...data].filter(d => d.avgCheck > 0).sort((a,b) => b.avgCheck - a.avgCheck).slice(0, 6);
    
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="source" 
                    type="category" 
                    width={130} 
                    tick={{ fontSize: 13, fill: '#cbd5e1', fontWeight: 600 }} 
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} cursor={{fill: '#ffffff05'}} />
                <Bar dataKey="avgCheck" name={labels.avgCheck} radius={[0, 6, 6, 0]} barSize={20}>
                     {sortedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#fb923c' : '#64748b'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export const EfficiencyChart: React.FC<ChartProps> = ({ data, labels }) => {
  const activeData = data.filter(d => d.leads > 0).sort((a, b) => b.efficiency - a.efficiency);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={activeData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis 
          dataKey="source" 
          scale="point" 
          padding={{ left: 20, right: 20 }} 
          tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 500}} 
          interval={0} 
          angle={-45} 
          textAnchor="end" 
          height={80} 
          axisLine={false}
          tickLine={false}
        />
        <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
        <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
        <Bar dataKey="efficiency" name={labels.conversion} barSize={12} fill="#334155" radius={[4, 4, 0, 0]} />
        <Line 
          type="monotone" 
          dataKey="efficiency" 
          name={labels.conversion}
          stroke="#2dd4bf" 
          strokeWidth={4} 
          dot={{ r: 5, fill: '#0f172a', stroke: '#2dd4bf', strokeWidth: 2 }} 
          activeDot={{ r: 7, strokeWidth: 0, fill: '#fff' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const ScatterAnalysis: React.FC<ChartProps> = ({ data, labels }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
       <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          type="number" 
          dataKey="leads" 
          name={labels.leads} 
          label={{ value: labels.leads, position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} 
          axisLine={false}
          tickLine={false}
          tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}}
        />
        <YAxis 
          type="number" 
          dataKey="avgCheck" 
          name={labels.avgCheck}
          label={{ value: labels.avgCheck, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} 
          axisLine={false}
          tickLine={false}
          tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} 
          content={<CustomTooltip formatter={(value: number, name: string) => {
            if (name === labels.avgCheck) {
              return `${name}: ${formatCurrency(value)}`;
            }
            return `${name}: ${formatNumber(value)}`;
          }} />} 
        />
        <Scatter name="Channels" data={data} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const RevenuePieChart: React.FC<ChartProps> = ({ data, labels }) => {
  const activeData = data.filter(d => d.revenue > 0);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={activeData}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={100}
          paddingAngle={5}
          dataKey="revenue"
          nameKey="source"
          stroke="none"
        >
          {activeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#020617" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatter={(value: number, name: string) => `${name}: ${formatCurrency(value)}`} />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          formatter={(value) => <span className="text-sm text-slate-300 font-medium ml-2">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ConversionBarChart: React.FC<ChartProps> = ({ data, labels }) => {
   const processed = data
      .filter(d => d.leads > 0)
      .map(d => ({
        ...d,
        lost: d.leads - d.successful
      }))
      .sort((a,b) => b.leads - a.leads)
      .slice(0, 8);

   return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={processed} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="source" 
          type="category" 
          width={120} 
          tick={{ fontSize: 13, fill: '#cbd5e1', fontWeight: 600 }} 
          interval={0} 
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
        <Legend 
          iconType="circle" 
          formatter={(value) => <span className="text-sm text-slate-300 font-medium ml-2">{value}</span>}
        />
        <Bar dataKey="successful" name={labels.successful} stackId="a" fill="#10b981" radius={[0,0,0,0]} barSize={20} />
        <Bar dataKey="lost" name={labels.lost} stackId="a" fill="#334155" radius={[0,6,6,0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
   );
};