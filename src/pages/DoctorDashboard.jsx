import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  History, 
  ChevronRight, 
  Activity, 
  Clock, 
  AlertCircle,
  Pill,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  Plus,
  X,
  Package
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [inventory, setInventory] = useState([]);

  // Prescription builder: array of { medicine, quantity }
  const [prescriptionItems, setPrescriptionItems] = useState([{ medicine: '', quantity: 1 }]);

  async function fetchQueue() {
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .eq('status', 'Waiting')
      .order('created_at', { ascending: true });
    
    if (!error) setQueue(data || []);
    setLoading(false);
  }

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('*').order('medicine_name');
    if (data) setInventory(data);
  }

  async function fetchPatientHistory(patientId) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (!error) setMedicalHistory(data || []);
  }

  useEffect(() => {
    fetchQueue();
    fetchInventory();

    const channel = supabase
      .channel('queue-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    fetchPatientHistory(p.patient_id);
  };

  // Add prescription row
  const addPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, { medicine: '', quantity: 1 }]);
  };

  // Remove prescription row
  const removePrescriptionItem = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  // Update prescription row
  const updatePrescriptionItem = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = field === 'quantity' ? parseInt(value) || 1 : value;
    setPrescriptionItems(updated);
  };

  const handleCompleteConsultation = async () => {
    const validItems = prescriptionItems.filter(item => item.medicine.trim() !== '');
    if (!diagnosis || validItems.length === 0) {
      alert('Please enter diagnosis and at least one prescription item.');
      return;
    }
    setIsUpdating(true);

    // Build prescription string for record
    const prescriptionText = validItems
      .map(item => `${item.medicine} x${item.quantity}`)
      .join(', ');

    // 1. Add Medical Record
    const { error: recordError } = await supabase
      .from('medical_records')
      .insert([{
        patient_id: selectedPatient.patient_id,
        diagnosis,
        prescription: prescriptionText
      }]);

    // 2. DELETE from Queue so patient disappears
    const { error: queueError } = await supabase
      .from('queue')
      .delete()
      .eq('id', selectedPatient.id);

    // 3. Auto-decrease pharmacy inventory for each prescribed medicine
    let stockErrors = [];
    for (const item of validItems) {
      const match = inventory.find(inv => 
        inv.medicine_name.toLowerCase() === item.medicine.toLowerCase()
      );
      if (match) {
        const newStock = Math.max(0, match.stock_count - item.quantity);
        const { error: stockErr } = await supabase
          .from('inventory')
          .update({ stock_count: newStock })
          .eq('id', match.id);
        if (stockErr) stockErrors.push(stockErr.message);
      }
    }

    setIsUpdating(false);
    if (!recordError && !queueError) {
      const stockMsg = stockErrors.length > 0 
        ? `\n⚠️ Some stock updates failed: ${stockErrors.join(', ')}` 
        : '\n✅ Pharmacy stock updated automatically.';
      alert(`Consultation for ${selectedPatient.patient_name} completed!${stockMsg}`);
      setSelectedPatient(null);
      setDiagnosis('');
      setPrescriptionItems([{ medicine: '', quantity: 1 }]);
      setMedicalHistory([]);
      fetchQueue();
      fetchInventory();
    } else {
      alert("Operation failed: " + (recordError?.message || queueError?.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-100">
              <Stethoscope className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Decision Suite</h1>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Authorized Physician Terminal • St. Mary's Health</p>
            </div>
          </div>
          <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className="px-6 py-2 border-r border-slate-50 text-center">
                <div className="text-2xl font-black text-indigo-600">{queue.length}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">In Queue</div>
             </div>
             <div className="px-6 py-2 text-center">
                <div className="text-2xl font-black text-teal-600">Optimal</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Load</div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Patient Queue */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            <div className="glass-card p-10 bg-white shadow-xl shadow-indigo-500/5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
                <span>Intake Priority Queue</span>
                <Clock size={14} className="text-indigo-600" />
              </h3>
              
              {loading ? (
                <div className="py-12 text-center">
                   <Activity className="animate-spin mx-auto text-indigo-200 mb-4" size={32} />
                   <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Syncing queue...</p>
                </div>
              ) : queue.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                   <CheckCircle2 className="mx-auto text-teal-200 mb-4" size={48} />
                   <p className="text-slate-400 font-bold italic">All clear. No patients in queue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {queue.map((p, i) => (
                    <button 
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left flex items-center justify-between group ${
                        selectedPatient?.id === p.id 
                          ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200' 
                          : ['HIGH','CRITICAL'].includes(p.priority?.toUpperCase())
                            ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                            : 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black transition-colors ${
                          selectedPatient?.id === p.id 
                            ? 'bg-white/20 text-white' 
                            : ['HIGH','CRITICAL'].includes(p.priority?.toUpperCase())
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          <span className="text-[8px] uppercase">RANK</span>
                          <span className="text-xl">#{i + 1}</span>
                        </div>
                        <div>
                          <h4 className={`text-lg font-black tracking-tight ${selectedPatient?.id === p.id ? 'text-white' : 'text-slate-900'}`}>
                            {p.patient_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                               selectedPatient?.id === p.id 
                                 ? 'bg-white/20 border-white/30 text-white' 
                                 : ['HIGH','CRITICAL'].includes(p.priority?.toUpperCase())
                                   ? 'bg-rose-100 border-rose-200 text-rose-700'
                                   : 'bg-emerald-100 border-emerald-200 text-emerald-700'
                             }`}>
                               {p.priority}
                             </span>
                             <span className={`text-[10px] font-bold ${selectedPatient?.id === p.id ? 'text-white/60' : 'text-slate-400'}`}>
                               {p.symptoms?.substring(0, 25)}...
                             </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`transition-transform ${selectedPatient?.id === p.id ? 'text-white translate-x-2' : 'text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1'}`} size={20} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clinical Assessment Suite */}
          <div className="lg:col-span-12 xl:col-span-8">
            {!selectedPatient ? (
              <div className="glass-card p-24 h-full bg-white flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 opacity-60">
                <Users className="text-slate-200 mb-8" size={100} strokeWidth={1} />
                <h3 className="text-2xl font-black text-slate-400 mb-2 uppercase tracking-tight">Consultation Inactive</h3>
                <p className="text-slate-300 font-bold max-w-sm">Select a patient from the priority queue to begin clinical assessment.</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8">
                {/* Active Patient Card */}
                <div className="glass-card p-10 bg-indigo-600 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                  
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center border border-white/20">
                        <User className="text-white" size={32} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-4xl font-black tracking-tight">{selectedPatient.patient_name}</h2>
                          <span className="text-indigo-100 font-black text-[10px] uppercase tracking-[0.2em] border border-white/20 px-3 py-1 rounded-full">LIVE CASE</span>
                        </div>
                        <p className="text-indigo-100 font-black text-[10px] uppercase tracking-[0.2em]">Priority: {selectedPatient.priority}</p>
                     </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                     <div className="bg-rose-500/40 backdrop-blur-md p-4 rounded-3xl border border-rose-300/20 min-w-[140px]">
                        <div className="text-[8px] font-black uppercase opacity-60 mb-2">Primary Symptom</div>
                        <div className="text-sm font-black italic">"{selectedPatient.symptoms}"</div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                   {/* Assessment Form */}
                   <div className="lg:col-span-7 glass-card p-10 bg-white shadow-xl shadow-indigo-500/5">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                        <Activity className="text-indigo-600" size={16} /> Clinical Assessment
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Diagnosis</label>
                          <textarea 
                            placeholder="Enter clinical assessment findings..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 min-h-[100px] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                          ></textarea>
                        </div>

                        {/* Prescription Builder */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Pill className="text-teal-600" size={14} /> Prescription
                            </label>
                            <button 
                              onClick={addPrescriptionItem}
                              className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
                            >
                              <Plus size={14} /> Add Medicine
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {prescriptionItems.map((item, index) => (
                              <div key={index} className="flex gap-3 items-center">
                                {/* Medicine dropdown from inventory */}
                                <div className="flex-1 relative">
                                  <select
                                    value={item.medicine}
                                    onChange={(e) => updatePrescriptionItem(index, 'medicine', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none cursor-pointer"
                                  >
                                    <option value="">Select medicine...</option>
                                    {inventory.map((inv) => (
                                      <option key={inv.id} value={inv.medicine_name}>
                                        {inv.medicine_name} (Stock: {inv.stock_count})
                                      </option>
                                    ))}
                                  </select>
                                  <Package className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                                </div>
                                {/* Quantity */}
                                <div className="w-24">
                                  <input 
                                    type="number" 
                                    min="1" 
                                    value={item.quantity}
                                    onChange={(e) => updatePrescriptionItem(index, 'quantity', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 font-bold text-center text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    placeholder="Qty"
                                  />
                                </div>
                                {/* Remove */}
                                {prescriptionItems.length > 1 && (
                                  <button 
                                    onClick={() => removePrescriptionItem(index)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                  >
                                    <X size={18} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Preview */}
                          {prescriptionItems.some(item => item.medicine) && (
                            <div className="mt-3 p-3 bg-teal-50 border border-teal-100 rounded-xl">
                              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Rx Preview</p>
                              <p className="text-sm font-bold text-teal-800">
                                {prescriptionItems.filter(i => i.medicine).map(i => `${i.medicine} ×${i.quantity}`).join(' • ')}
                              </p>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={handleCompleteConsultation}
                          disabled={isUpdating || !diagnosis || prescriptionItems.every(i => !i.medicine)}
                          className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                          {isUpdating ? <Activity className="animate-spin" size={20} /> : <CheckCircle2 size={22} className="text-teal-400" />}
                          Finalize & Update Pharmacy
                        </button>
                      </div>
                   </div>

                   {/* Patient History Sidebar */}
                   <div className="lg:col-span-5 glass-card p-10 bg-white border-l-8 border-indigo-600 flex flex-col">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
                         Clinical Timeline
                         <History className="text-indigo-600" size={16} />
                      </h3>
                      <div className="flex-1 overflow-auto pr-2 space-y-8 max-h-[500px]">
                         {medicalHistory.length === 0 ? (
                           <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                             <Calendar className="mx-auto text-slate-200 mb-2" size={32} />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Clinical Pathway</p>
                           </div>
                         ) : (
                           medicalHistory.map((record, i) => (
                             <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-1 before:w-2 before:h-2 before:bg-indigo-600 before:rounded-full before:z-10 after:absolute after:left-[3px] after:top-3 after:w-0.5 after:h-full after:bg-slate-50 last:after:hidden">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                   {new Date(record.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <h5 className="text-md font-black text-slate-900 tracking-tight leading-none mb-2">{record.diagnosis}</h5>
                                <p className="text-xs font-bold text-slate-500 italic leading-relaxed">"{record.prescription}"</p>
                             </div>
                           ))
                         )}
                      </div>
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
