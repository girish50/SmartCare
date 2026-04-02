import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SpotlightCard from './SpotlightCard';

export default function SurgeChart({ data }) {
  return (
    <SpotlightCard className="h-[500px] p-10 flex flex-col">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">ER Volumetric Projection</h3>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', fontSize: '12px', fontWeight: 'bold' }}
              itemStyle={{ color: '#4F46E5' }}
            />
            <Area 
              type="monotone" 
              dataKey="patientLoad" 
              name="Projected ER Load"
              stroke="#4F46E5" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorLoad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-8 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest italic">
        Real-time surge predictive mapping based on 10,000 Monte Carlo iterations
      </p>
    </SpotlightCard>
  );
}
