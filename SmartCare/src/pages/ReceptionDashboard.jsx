import React, { useState } from 'react';
import { 
  Search, 
  QrCode, 
  ClipboardList, 
  Activity, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle2,
  Scan,
  UserPlus,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function ReceptionDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null); // { name, id }

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    // Search by sequential ID (P1001) or Phone
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`phone.eq.${searchQuery},patient_id.eq.${searchQuery.toUpperCase()}`)
      .single();
    
    if (data) {
      setSelectedPatient(data);
    } else {
      alert('Patient not found in SmartCare Registry. Please verify the ID or Phone Number.');
    }
  };
/*
  const runAITriage = () => {
    if (!symptoms) return;
    setIsProcessing(true);
    
    // Simulate AI Logic
    setTimeout(() => {
      const lowerSymptoms = symptoms.toLowerCase();
      let priority = 'LOW';
      let dept = 'General Medicine';
      let color = 'teal';

      if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('breath') || lowerSymptoms.includes('heart')) {
        priority = 'CRITICAL';
        dept = 'Cardiology / Emergency';
        color = 'rose';
      } else if (lowerSymptoms.includes('fever') && lowerSymptoms.includes('pain')) {
        priority = 'HIGH';
        dept = 'Internal Medicine';
        color = 'amber';
      }

      setTriageResult({ priority, dept, color });
      setIsProcessing(false);
    }, 1500);
  };

  */
 const runAITriage = () => {
  if (!symptoms) return;
  setIsProcessing(true);
  
  setTimeout(() => {
    const s = symptoms.toLowerCase();

    let priority = 'LOW';
    let dept = 'General Medicine';
    let color = 'teal';

    // 🔴 CRITICAL (ESI Level 1 - Immediate life-saving)
    if (
      s.includes('cardiac arrest') ||
      s.includes('no pulse') ||
      s.includes('not breathing') ||
      s.includes('respiratory failure') ||
      s.includes('oxygen low') ||
      s.includes('spo2 below 90') ||
      s.includes('severe chest pain') ||
      s.includes('heart attack') ||
      s.includes('stroke') ||
      s.includes('face drooping') ||
      s.includes('cannot speak') ||
      s.includes('unconscious') ||
      s.includes('gcs low') ||
      s.includes('seizure ongoing') ||
      s.includes('active seizure') ||
      s.includes('severe trauma') ||
      s.includes('road accident') ||
      s.includes('polytrauma') ||
      s.includes('severe burns') ||
      s.includes('third degree burn') ||
      s.includes('heavy bleeding') ||
      s.includes('hemorrhage') ||
      s.includes('shock') ||
      s.includes('bp very low') ||
      s.includes('anaphylaxis') ||
      s.includes('airway blocked') ||
      s.includes('poison ingestion') ||
      s.includes('drug overdose')
    ) {
      priority = 'CRITICAL';
      dept = 'Emergency / ICU';
      color = 'rose';
    }

    // 🟠 HIGH (ESI Level 2 - High risk / urgent)
    else if (
      s.includes('high fever above 39') ||
      s.includes('persistent fever') ||
      s.includes('tachycardia') || // high heart rate
      s.includes('bradycardia') || // low heart rate
      s.includes('bp high') ||
      s.includes('hypertension crisis') ||
      s.includes('moderate chest pain') ||
      s.includes('breathing difficulty') ||
      s.includes('asthma attack') ||
      s.includes('copd') ||
      s.includes('vomiting continuously') ||
      s.includes('severe dehydration') ||
      s.includes('diarrhea severe') ||
      s.includes('severe abdominal pain') ||
      s.includes('appendicitis') ||
      s.includes('kidney stone pain') ||
      s.includes('fracture') ||
      s.includes('dislocation') ||
      s.includes('infection spreading') ||
      s.includes('sepsis suspected') ||
      s.includes('urinary retention') ||
      s.includes('allergic reaction severe') ||
      s.includes('migraine severe')
    ) {
      priority = 'HIGH';
      dept = 'Internal Medicine / Emergency';
      color = 'amber';
    }

    // 🟡 MEDIUM (ESI Level 3 - Needs tests but stable)
    else if (
      s.includes('moderate fever') ||
      s.includes('cough with fever') ||
      s.includes('mild dehydration') ||
      s.includes('skin infection') ||
      s.includes('ear pain') ||
      s.includes('throat infection') ||
      s.includes('uti mild') ||
      s.includes('back pain') ||
      s.includes('joint pain')
    ) {
      priority = 'MEDIUM';
      dept = 'General Medicine';
      color = 'yellow';
    }

    // 🟢 LOW (ESI Level 4/5 - Minor)
    else {
      priority = 'LOW';
      dept = 'General Medicine';
      color = 'teal';
    }

    setTriageResult({ priority, dept, color });
    setIsProcessing(false);
  }, 1500);
};
  const completeCheckIn = async () => {
    setIsCheckingIn(true);
    // Add to live queue using the UUID (id) for DB integrity but tracking patient_id for display
    const { error } = await supabase
      .from('queue')
      .insert([
        { 
          patient_id: selectedPatient.id, // Database uses UUID
          patient_name: selectedPatient.full_name,
          symptoms: symptoms,
          priority: triageResult.priority,
          status: 'Waiting'
        }
      ]);

    setIsCheckingIn(false);
    if (!error) {
      setCheckInSuccess({ name: selectedPatient.full_name, id: selectedPatient.patient_id });
      setSelectedPatient(null);
      setSymptoms('');
      setTriageResult(null);
      setSearchQuery('');
    } else {
      alert("Check-in failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Popup Modal */}
      {checkInSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-600" size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Patient Added to Queue!</h2>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Patient ID</p>
              <p className="text-3xl font-black text-indigo-600">{checkInSuccess.id}</p>
            </div>
            <p className="text-lg font-bold text-slate-700 mb-6">{checkInSuccess.name}</p>
            <p className="text-sm text-slate-400 mb-6">is now in the <span className="font-bold text-emerald-600">LIVE doctor queue</span></p>
            <button 
              onClick={() => setCheckInSuccess(null)}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
            >
              OK, Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-100">
              <ClipboardList className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Intake Hub</h1>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">St. Mary's Enterprise Reception • Terminal #04</p>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
             <div className="text-right">
                <div className="text-xl font-black text-indigo-600">Active Shift</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receptionist: Zone A</div>
             </div>
             <div className="h-10 w-px bg-slate-100"></div>
             <Activity className="text-teal-500 animate-pulse" size={24} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Identify & Verification */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-10">
            <div className="glass-card p-10 bg-white shadow-xl shadow-indigo-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <Scan size={140} />
              </div>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2 relative z-10">
                <ShieldCheck size={14} className="text-indigo-600" /> Identity Verification
              </h3>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10 relative z-10">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text"
                    placeholder="Enter Phone or ID (e.g. P1001)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-5 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-slate-900 shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 py-5 uppercase tracking-widest text-[10px]">
                  Lookup
                </button>
              </form>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                <button className="flex flex-col items-center justify-center gap-5 p-10 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                  <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:bg-indigo-50 transition-colors">
                    <QrCode size={32} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Scan QR Token</span>
                </button>
                <button onClick={() => window.location.href='/register'} className="flex flex-col items-center justify-center gap-5 p-10 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/10 transition-all group">
                  <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:bg-teal-50 transition-colors">
                    <UserPlus size={32} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">New Registration</span>
                </button>
              </div>
            </div>

            {selectedPatient && (
              <div className="animate-in slide-in-from-left duration-700">
                <div className="glass-card p-12 bg-white border-l-8 border-indigo-600 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                      <User size={160} />
                   </div>
                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPatient.full_name}</h2>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Verified</span>
                        </div>
                        <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Patient ID: {selectedPatient.patient_id}</p>
                        <div className="flex items-center gap-4 text-slate-400 text-xs font-bold leading-none">
                          <div className="flex items-center gap-1"><Phone size={14} className="text-indigo-400" /> {selectedPatient.phone}</div>
                          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                          <div className="flex items-center gap-1 uppercase tracking-tighter">Age: {selectedPatient.age}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center bg-rose-50 p-4 rounded-2xl border border-rose-100 min-w-[80px]">
                        <div className="text-3xl font-black text-rose-600 leading-none mb-1">{selectedPatient.blood_group}</div>
                        <div className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Blood Type</div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6 relative z-10">
                      <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <AlertCircle size={12} className="text-rose-500" /> Registered Allergies
                        </div>
                        <div className="text-sm font-bold text-slate-900 italic leading-relaxed">
                          "{selectedPatient.allergies || 'NONE REPORTED'}"
                        </div>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Emergency Hub</div>
                        <div className="text-sm font-black text-slate-900">{selectedPatient.emergency_contact}</div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">Primary Contact</p>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Triage Decision Engine */}
          <div className="lg:col-span-12 xl:col-span-7">
             <div className={`glass-card p-12 h-full transition-all bg-white shadow-2xl shadow-indigo-500/5 relative overflow-hidden border border-slate-50 ${!selectedPatient ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30"></div>

                <div className="flex flex-col sm:flex-row items-center justify-between mb-12 relative z-10 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-100 group">
                      <Zap className="text-indigo-600 group-hover:scale-125 transition-transform" size={28} />
                    </div>
                    <div>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Neural Triage</h3>
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Severity Assessment Engine v4.0</p>
                    </div>
                  </div>
                  <div className="px-6 py-2 bg-slate-900 rounded-full text-[10px] font-black tracking-[0.3em] text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    PROMETHEUS CORE
                  </div>
                </div>

                <div className="mb-12 relative z-10">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Symptom Intake</label>
                  <textarea 
                    placeholder="Input detailed patient description: e.g. 'Sudden onset of dizziness, peripheral vision loss, elevated heart rate'..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 min-h-[220px] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner text-lg leading-relaxed"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  ></textarea>
                  <button 
                    onClick={runAITriage}
                    disabled={isProcessing || !symptoms}
                    className="w-full mt-8 py-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-50 disabled:text-slate-300 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-4 active:scale-[0.98] uppercase tracking-widest text-xs"
                  >
                    {isProcessing ? (
                      <>
                        <Activity className="animate-spin" size={24} /> Neural Processing...
                      </>
                    ) : (
                      <>
                        <Stethoscope size={24} /> Deploy AI Diagnosis
                      </>
                    )}
                  </button>
                </div>

                {triageResult && (
                  <div className="animate-in zoom-in-95 duration-700 relative z-10">
                    <div className={`p-10 rounded-[3rem] border-4 shadow-2xl ${
                      triageResult.color === 'rose' ? 'bg-rose-50 border-rose-100 shadow-rose-200/20' : 
                      triageResult.color === 'amber' ? 'bg-amber-50 border-amber-100 shadow-amber-200/20' : 
                      'bg-teal-50 border-teal-100 shadow-teal-200/20'
                    }`}>
                      <div className="flex justify-between items-center mb-8">
                        <span className={`text-[10px] font-black tracking-widest uppercase px-5 py-2 bg-white rounded-full border shadow-sm ${
                          triageResult.color === 'rose' ? 'text-rose-600 border-rose-100' : 
                          triageResult.color === 'amber' ? 'text-amber-600 border-amber-100' : 
                          'text-teal-600 border-teal-100'
                        }`}>
                          Validated Priority Matrix
                        </span>
                        <div className={`p-3 bg-white rounded-2xl shadow-sm text-${triageResult.color}-600`}>
                           <Activity size={24} />
                        </div>
                      </div>
                      
                      <div className="mb-10 text-center sm:text-left">
                        <p className={`text-6xl font-black mb-3 tracking-tighter ${
                          triageResult.color === 'rose' ? 'text-rose-600' : 
                          triageResult.color === 'amber' ? 'text-amber-600' : 
                          'text-teal-600'
                        }`}>
                          {triageResult.priority}
                        </p>
                        <p className="text-slate-500 font-black text-xl uppercase tracking-tight">
                          Clinical Route: <span className="text-slate-900 underline decoration-indigo-300 decoration-4 underline-offset-8">{triageResult.dept}</span>
                        </p>
                      </div>
                      
                      <button 
                        onClick={completeCheckIn}
                        disabled={isCheckingIn}
                        className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl shadow-slate-300 flex items-center justify-center gap-4 hover:bg-black transition-all group uppercase tracking-widest text-xs"
                      >
                        {isCheckingIn ? "Finalizing Registry..." : (
                          <>
                            <CheckCircle2 size={24} className="text-teal-400" /> Confirm LIVE Check-In
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
