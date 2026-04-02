import React, { useState } from 'react';
import { Activity, Users, AlertTriangle, Clock, RefreshCw, Play, Settings2, Zap } from 'lucide-react';
import SimulationForm from '../components/SimulationForm';
import PatientFlowTable from '../components/PatientFlowTable';
import SurgeChart from '../components/SurgeChart';
import SeverityPieChart from '../components/SeverityPieChart';
import ResourceUtilization from '../components/ResourceUtilization';
import ConditionBarChart from '../components/ConditionBarChart';
import AIRecommendations from '../components/AIRecommendations';
import { runMonteCarloSim } from '../simulation/simulationController';

export default function SimulationDashboard() {
  const [config, setConfig] = useState({
    scenario: 'Winter Outbreak',
    arrivalRate: 45,
    durationHours: 12,
    doctors: 12,
    icuBeds: 24,
    ventilators: 15,
    erRooms: 30
  });

  const [results, setResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRun = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const simResults = runMonteCarloSim(config);
      setResults(simResults);
      setIsSimulating(false);
    }, 800);
  };

  const handleReset = () => {
    setResults(null);
  };

  // Auto-run once on component mount so graphs are never idle
  useEffect(() => {
    handleRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white min-h-[800px] rounded-[2rem] shadow-sm overflow-hidden text-left">
      
      {/* Simulation Toolbar */}
      <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">ERNova Predictive Engine</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Monte Carlo Simulation • Infrastructure Stress Test</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} /> Reset Model
          </button>
          <button 
            onClick={handleRun}
            disabled={isSimulating}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSimulating ? <Activity className="animate-spin" size={14} /> : <Play size={14} />}
            {isSimulating ? "Calculating Peaks..." : "Execute Simulation"}
          </button>
        </div>
      </div>

      <div className="p-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Controls Panel */}
          <div className="lg:col-span-1">
             <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 sticky top-10">
                <div className="flex items-center gap-3 mb-8">
                  <Settings2 size={18} className="text-indigo-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Config Parameters</h3>
                </div>
                <SimulationForm 
                  config={config} 
                  setConfig={setConfig} 
                  onRun={handleRun} 
                  onReset={handleReset} 
                  isSimulating={isSimulating}
                  hideButtons={true} // We moved buttons to the toolbar
                />
             </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {!results ? (
              <div className="h-full min-h-[500px] border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 text-center p-12 bg-slate-50/20">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-50 mb-8">
                  <Zap size={48} className="text-slate-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Simulate Before You Move.</h3>
                <p className="max-w-md font-medium text-slate-400 text-lg">
                  Adjust the doctors, beds, and expected arrival rates to predict where the bottlenecks will strike.
                </p>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* Simulated KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Volume', value: results.patientsGenerated, icon: <Users />, color: 'indigo' },
                    { label: 'Critical Cases', value: results.criticalCases, icon: <AlertTriangle />, color: 'rose' },
                    { label: 'Avg Wait', value: results.avgWaitTime + 'm', icon: <Clock />, color: 'teal' },
                    { label: 'ER Utilization', value: '88%', icon: <Activity />, color: 'amber' }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className={`text-${stat.color}-600 mb-3`}>{stat.icon}</div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Primary Data Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                   <div className="glass-card p-8 border border-slate-100 bg-white">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Live Patient Intake Map</h4>
                      <PatientFlowTable patients={results.patients} />
                   </div>
                   <div className="glass-card p-8 border border-slate-100 bg-white">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Volume Over Time (Prediction)</h4>
                      <SurgeChart data={results.usageLogs} />
                   </div>
                </div>

                {/* AI Insights Banner */}
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-10">
                      <Activity size={100} />
                   </div>
                   <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Zap size={14} /> Intelligence recommendations
                   </h4>
                   <AIRecommendations insights={results.insights} />
                </div>

                {/* Distribution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                   <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Severity Distribution</h5>
                      <SeverityPieChart data={results.severityData} />
                   </div>
                   <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Condition Analysis</h5>
                      <ConditionBarChart data={results.conditionData} />
                   </div>
                   <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Resource Saturation</h5>
                      <ResourceUtilization usageLogs={results.usageLogs} />
                   </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
