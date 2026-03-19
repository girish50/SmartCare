import React from 'react';

export default function ResourceUtilization({ usageLogs }) {
  // Take last snapshot
  const latest = usageLogs[usageLogs.length - 1] || {};
  
  const resources = [
    { label: 'Doctor Availability', value: (latest.doctorsUsed / latest.totalDoctors) * 100, color: 'indigo' },
    { label: 'ICU Bed Saturation', value: (latest.icuBedsUsed / latest.totalIcuBeds) * 100, color: 'rose' },
    { label: 'Ventilator Utilization', value: (latest.ventUsed / latest.totalVents) * 100, color: 'teal' },
    { label: 'ER Room Occupancy', value: (latest.roomsUsed / latest.totalRooms) * 100, color: 'amber' }
  ];

  return (
    <div className="space-y-6 pt-2">
      {resources.map((res, i) => (
        <div key={i} className="group">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover:text-slate-900 transition-colors">
              <span>{res.label}</span>
              <span className={`text-${res.color}-600 font-black`}>{Math.round(res.value)}%</span>
           </div>
           <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
              <div 
                className={`h-full bg-${res.color}-500 transition-all duration-1000 shadow-sm`} 
                style={{ width: `${Math.min(100, res.value)}%` }}
              ></div>
           </div>
        </div>
      ))}
    </div>
  );
}
