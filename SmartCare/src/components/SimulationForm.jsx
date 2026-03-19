import React from 'react';

export default function SimulationForm({ config, setConfig, onRun, onReset, isSimulating, hideButtons }) {
  
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: Number(value) }));
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="space-y-6">
      <div>
        <label className={labelClass}>Emergency Scenario</label>
        <select 
          className={inputClass}
          value={config.scenario}
          onChange={(e) => setConfig(prev => ({ ...prev, scenario: e.target.value }))}
        >
          <option value="Normal">Normal Operations</option>
          <option value="Mass Casualty">Mass Casualty Event</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Arrivals (/hr)</label>
          <input 
            type="number" min="1" max="100"
            value={config.arrivalRate}
            onChange={(e) => handleChange('arrivalRate', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Hours</label>
          <input 
            type="number" min="1" max="24"
            value={config.durationHours}
            onChange={(e) => handleChange('durationHours', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Hospital Resources</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Doctors</label>
            <input 
              type="number" min="1"
              value={config.doctors}
              className={inputClass}
              onChange={(e) => handleChange('doctors', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>ICU Beds</label>
            <input 
              type="number" min="0"
              value={config.icuBeds}
              onChange={(e) => handleChange('icuBeds', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ventilators</label>
            <input 
              type="number" min="0"
              value={config.ventilators}
              onChange={(e) => handleChange('ventilators', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ER Rooms</label>
            <input 
              type="number" min="1"
              value={config.erRooms}
              onChange={(e) => handleChange('erRooms', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {!hideButtons && (
        <div className="flex gap-4 pt-4">
          <button 
            onClick={onReset}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Reset
          </button>
          <button 
            onClick={onRun}
            disabled={isSimulating}
            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
          >
            Run Model
          </button>
        </div>
      )}
    </div>
  );
}
