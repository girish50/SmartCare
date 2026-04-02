import React from 'react';
import { Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AIRecommendations({ insights }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight, idx) => (
        <div key={idx} className="flex gap-4 p-4 bg-white/50 rounded-2xl border border-white/50 group transition-all hover:bg-white shadow-sm hover:shadow-lg hover:shadow-indigo-500/5">
          <div className="mt-1">
            {insight.type === 'critical' ? (
              <AlertTriangle className="text-rose-500" size={20} />
            ) : insight.type === 'warning' ? (
              <Zap className="text-amber-500" size={20} />
            ) : (
              <CheckCircle2 className="text-teal-500" size={20} />
            )}
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
              AI Insight Vector
            </h5>
            <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
              "{insight.text}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
