import React from 'react';
import SpotlightCard from './SpotlightCard';

export default function PatientFlowTable({ patients }) {
  // Show only first 50 to not overwhelm DOM
  const displayPatients = patients.slice(0, 50);

  return (
    <SpotlightCard className="h-[500px] p-10 flex flex-col items-stretch w-full">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex justify-between items-center">
        Live Intake Analysis
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest font-black">
          {patients.length} Processed
        </span>
      </h3>
      
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-500">
          <thead className="text-[10px] uppercase font-black tracking-widest text-slate-400 sticky top-0 bg-white z-20">
            <tr>
              <th className="pb-4 pr-4">Patient UID</th>
              <th className="pb-4">Condition</th>
              <th className="pb-4">Clinical Priority</th>
              <th className="pb-4">Wait Time</th>
              <th className="pb-4">Pathway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayPatients.map((p, idx) => {
              let sevColor = 'text-teal-600 bg-teal-50 border-teal-100'; // Default minor/cyan
              if (p.severityLevel === 5) sevColor = 'text-rose-600 bg-rose-50 border-rose-100';
              if (p.severityLevel === 4) sevColor = 'text-amber-600 bg-amber-50 border-amber-100';
              if (p.severityLevel === 3) sevColor = 'text-indigo-600 bg-indigo-50 border-indigo-100';

              return (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-black text-slate-900">{p.id.slice(0, 8)}</td>
                  <td className="py-4 font-bold text-slate-500">{p.condition}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${sevColor}`}>
                      {p.severityCategory}
                    </span>
                  </td>
                  <td className="py-4 font-black text-slate-900">{p.waitTime}<span className="text-[10px] text-slate-400 font-bold ml-1">min</span></td>
                  <td className="py-4 font-bold text-slate-400 flex items-center gap-2 italic">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div> {p.treatedIn}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {patients.length > 50 && (
         <div className="text-center pt-6 text-[10px] text-slate-400 font-black uppercase tracking-widest border-t border-slate-50 mt-4">
           + {patients.length - 50} more patients in current simulation
         </div>
      )}
    </SpotlightCard>
  );
}
