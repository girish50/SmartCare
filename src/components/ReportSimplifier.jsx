import React from 'react';
import { Sparkles, ArrowRight, BrainCircuit, ShieldCheck, Microscope } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

export default function ReportSimplifier({ reportData }) {
  // Simulate AI explanation based on lab values
  const simplify = (data) => {
    if (data.includes('Hemoglobin: 9.5')) {
      return {
        summary: "Iron levels are below clinical target (13–17 g/dL).",
        explanation: "This suggests mild anemia, which typically manifests as persistent fatigue or breathlessness.",
        recommendations: ["Increase iron-rich intake (spinach, lentils)", "Avoid caffeine post-meals", "Consult Dr. regarding B12"],
        severity: "Moderate"
      };
    }
    return {
      summary: "Clinical markers appear within normal range.",
      explanation: "All biometrics detected are aligned with healthy reference standards for your age group.",
      recommendations: ["Maintain current nutritional balance", "Ensure regular hydration"],
      severity: "Normal"
    };
  };

  const insight = simplify(reportData);

  return (
    <SpotlightCard className="p-10 border-indigo-500/10 bg-white shadow-2xl shadow-indigo-100/20">
      <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-50">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
          <BrainCircuit size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Report Simplifier</h3>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">St. Mary's Neural Diagnosis v2.1</p>
        </div>
      </div>

      <div className="space-y-10">
        <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <Microscope size={64} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ingested Clinical Data</p>
           <code className="text-indigo-600 font-mono text-sm block leading-relaxed font-bold">
             {reportData}
           </code>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center gap-2 text-teal-600 mb-4">
             <Sparkles size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Extraction</span>
           </div>
           <p className="text-xl font-black text-slate-900 mb-3 tracking-tight">{insight.summary}</p>
           <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 italic">
             "{insight.explanation}"
           </p>
        </div>

        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Patient Protocol Advised</p>
           <div className="space-y-4">
             {insight.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all border-l-8 border-l-indigo-600">
                  <ShieldCheck size={20} className="text-indigo-600" />
                  <span className="text-sm font-bold text-slate-700">{rec}</span>
                </div>
             ))}
           </div>
        </div>

        <div className="pt-8 border-t border-slate-50">
           <button className="w-full flex items-center justify-between group py-2">
              <span className="text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">Schedule Clinical Consultation</span>
              <div className="p-2 bg-slate-50 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                <ArrowRight size={18} />
              </div>
           </button>
        </div>
      </div>
    </SpotlightCard>
  );
}
