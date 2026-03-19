import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ConditionBarChart({ data }) {
  const sorted = [...data].sort((a,b) => b.count - a.count).slice(0, 5);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            fontSize={10} 
            fontWeight="bold"
            stroke="#64748b"
            width={100}
          />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
          />
          <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20}>
            {sorted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : '#818CF8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
