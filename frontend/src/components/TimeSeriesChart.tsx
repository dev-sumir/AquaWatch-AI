"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

interface Observation {
  date: string;
  ndwi: number;
  ndvi: number;
}

interface TimeSeriesChartProps {
  data: Observation[];
  baselineMean?: number;
  metricUsed?: string;
}

export default function TimeSeriesChart({ data, baselineMean, metricUsed = 'ndwi' }: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-400">No time-series data available</div>;
  }

  const chartData = data.map(obs => ({
    ...obs,
    date: new Date(obs.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const isNdviPrimary = metricUsed === 'ndvi';
  const baselineColor = isNdviPrimary ? "#10b981" : "#ef4444";

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorNdwi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            dy={10} 
            minTickGap={30}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            domain={['dataMin - 0.1', 'dataMax + 0.1']} 
            tickFormatter={(val) => val.toFixed(2)}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          
          {baselineMean !== undefined && (
            <ReferenceLine 
              y={baselineMean} 
              stroke={baselineColor} 
              strokeDasharray="4 4" 
              label={{ position: 'insideTopLeft', value: `Baseline (${metricUsed.toUpperCase()})`, fill: baselineColor, fontSize: 12, fontWeight: 600 }} 
            />
          )}
          
          <Area 
            type="monotone" 
            dataKey="ndwi" 
            name="Water Clarity (NDWI)"
            stroke="#2563eb" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorNdwi)" 
          />
          <Area 
            type="monotone" 
            dataKey="ndvi" 
            name="Vegetation (NDVI)"
            stroke="#059669" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorNdvi)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
