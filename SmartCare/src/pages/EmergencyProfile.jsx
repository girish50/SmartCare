import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  User, 
  Phone, 
  Droplet, 
  AlertCircle,
  FileText,
  Calendar,
  Stethoscope,
  Activity,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function EmergencyProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('otp') || '';
  });
  const [records, setRecords] = useState([]);

  // Restore unlock state from localStorage (survives refresh)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`smartcare_unlock_${id}`));
      if (saved?.unlocked && saved?.expiresAt && Date.now() < saved.expiresAt) return true;
      // Also check the global share expiry
      const share = JSON.parse(localStorage.getItem('smartcare_share'));
      if (saved?.unlocked && share?.expiresAt && Date.now() < share.expiresAt) return true;
    } catch {}
    return false;
  });

  async function fetchRecords() {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false });
    
    if (!error) setRecords(data || []);
  }

  useEffect(() => {
    async function fetchPatient() {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', id)
        .single();
      
      if (!error && data) {
        setPatient(data);
      } else {
        const { data: uuidData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();
        if (uuidData) setPatient(uuidData);
      }
      setLoading(false);
    }
    fetchPatient();
    
    // Auto-unlock if OTP is in the URL or already unlocked in localStorage
    const params = new URLSearchParams(window.location.search);
    const urlOtp = params.get('otp');
    
    if (isUnlocked || urlOtp) {
      if (!isUnlocked && urlOtp) {
         let expiresAt = Date.now() + 30 * 60 * 1000;
         localStorage.setItem(`smartcare_unlock_${id}`, JSON.stringify({ unlocked: true, expiresAt }));
         setIsUnlocked(true);
      }
      fetchRecords();
    }
  }, [id]);

  // Save unlock + fetch records
  const unlockAndSave = () => {
    setIsUnlocked(true);
    fetchRecords();
    // Determine expiry: use share timer from localStorage, or default 30 min
    let expiresAt = Date.now() + 30 * 60 * 1000;
    try {
      const share = JSON.parse(localStorage.getItem('smartcare_share'));
      if (share?.expiresAt) expiresAt = share.expiresAt;
    } catch (e) { /* ignore */ }
    localStorage.setItem(`smartcare_unlock_${id}`, JSON.stringify({ unlocked: true, expiresAt }));
  };

  const handleUnlock = () => {
    // Check sharing password
    if (password === patient.sharing_password) {
      unlockAndSave();
      return;
    }
    // Check OTP from URL params
    const params = new URLSearchParams(window.location.search);
    const urlOtp = params.get('otp');
    if (urlOtp && password === urlOtp) {
      unlockAndSave();
      return;
    }
    alert("Verification Failed: Incorrect password or OTP.");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12">
      <Activity className="animate-spin text-rose-600 mb-4" size={48} />
      <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Accessing Secure Medical Vault...</p>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12 text-center">
      <ShieldAlert className="text-rose-200 mb-6" size={80} />
      <h2 className="text-3xl font-black text-slate-900 mb-4">Patient Identity Not Found</h2>
      <p className="text-slate-500 mb-8 font-medium max-w-sm mx-auto leading-relaxed">The scanned token does not match any authenticated record in the SmartCare enterprise cloud.</p>
      <a href="/" className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl">Return to Hub</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header - Emergency Alert Badge */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 bg-rose-600 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-rose-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
              <ShieldAlert size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">Emergency Profile</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">Secure Vault Access</span>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-90 italic">ID: {patient.patient_id}</p>
              </div>
            </div>
          </div>
          <div className="text-center md:text-right mt-6 md:mt-0 relative z-10 bg-white/20 p-4 rounded-3xl backdrop-blur-md min-w-[120px]">
            <div className="text-4xl font-black">{patient.blood_group}</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Blood Type</div>
          </div>
        </div>

        {/* Public Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="glass-card p-10 bg-white border-l-8 border-indigo-600 shadow-xl shadow-indigo-500/5 group hover:-translate-y-1 transition-all">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
              <span className="flex items-center gap-2"><User size={14} className="text-indigo-600" /> Administrative Info</span>
              <span className="text-indigo-600 font-black">PUBLIC VIEW</span>
            </h3>
            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Holder</div>
                <div className="text-2xl font-black text-slate-900">{patient.full_name}</div>
              </div>
              <div className="flex gap-12">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Age</div>
                  <div className="text-2xl font-black text-slate-900">{patient.age}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Status</div>
                  <div className="text-lg font-black text-teal-600">VERIFIED</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 bg-white border-l-8 border-rose-600 shadow-xl shadow-rose-500/5 group hover:-translate-y-1 transition-all">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
              <span className="flex items-center gap-2"><AlertCircle size={14} className="text-rose-600" /> Life-Saving Vitals</span>
              <span className="text-rose-600 font-black">CRITICAL DATA</span>
            </h3>
            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Documented Allergies</div>
                <div className="text-lg font-black text-rose-900 leading-relaxed italic">
                  "{patient.allergies || 'NONE REPORTED IN SYSTEM'}"
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Immediate Contact</div>
                <div className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Phone size={20} /></div>
                  {patient.emergency_contact}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Locked Section */}
        {!isUnlocked ? (
          <div className="glass-card p-16 text-center bg-white border-2 border-slate-100 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="w-24 h-24 bg-white border-8 border-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl relative animate-pulse">
              <Lock size={36} className="text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Clinical Records Encrypted</h2>
            <p className="text-slate-500 mb-12 max-w-sm mx-auto font-medium leading-relaxed italic">
               Enter the patient's sharing password or the OTP code provided to unlock full medical records.
            </p>
            
            <div className="max-w-xs mx-auto space-y-6">
              <div className="relative">
                <input 
                  type="password"
                  placeholder="Enter Password or OTP"
                  style={{ color: '#000' }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-center font-black text-xl tracking-widest focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button 
                onClick={handleUnlock}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-[0.98] uppercase tracking-widest text-[10px]"
              >
                <Unlock size={20} /> Unlock High-Level Records
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between p-6 bg-emerald-50 border border-emerald-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-500 rounded-full text-white">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">Neural Decryption Successful</span>
              </div>
              <button 
                onClick={() => setIsUnlocked(false)}
                className="p-3 hover:bg-emerald-100 rounded-xl transition-colors text-emerald-600"
              >
                <Lock size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between px-2">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <FileText className="text-indigo-600" /> Verified Medical Ledger
               </h2>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{records.length} Clincal Events</span>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.75rem] before:w-0.5 before:bg-slate-100 before:pointer-events-none">
              {records.length === 0 ? (
                <div className="text-center p-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                  <Activity className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No recorded clinical events in ledger</p>
                </div>
              ) : (
                records.map((record, idx) => (
                  <div key={idx} className="relative flex gap-8 group">
                    <div className="relative z-10 w-14 h-14 bg-white border-4 border-slate-50 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:border-indigo-600 group-hover:bg-indigo-50 shadow-sm transition-all">
                      <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">
                        {new Date(record.created_at).toLocaleString('default', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-xl font-black text-slate-900 leading-none">
                         {new Date(record.created_at).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 glass-card p-10 bg-white hover:border-indigo-100 transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/5">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Assessment</div>
                          <h4 className="text-2xl font-black text-slate-900 tracking-tight">{record.diagnosis}</h4>
                        </div>
                        <div className="px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
                          Verified Visit
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl mb-6 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center justify-between">
                           Primary Protocol
                           <span className="text-[8px] font-bold text-slate-300 italic">#{record.id.slice(0,8)}</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700 italic">"{record.prescription}"</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:underline">
                          <Stethoscope size={16} /> Clinical Notes
                        </div>
                        <div className="text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={14} /> {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="pt-10 text-center">
               <div className="inline-flex flex-col items-center gap-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End of Record</div>
                  <ChevronDown className="text-slate-200 animate-bounce" size={20} />
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
