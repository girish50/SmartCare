import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ShieldPlus, ArrowRight, ShieldCheck, Lock, CheckCircle2, Copy, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patientCount, setPatientCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newId, setNewId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    phone: '',
    emergencyContact: '',
    address: '',
    allergies: '',
    sharing_password: ''
  });

  useEffect(() => {
    fetchCount();
  }, []);

  async function fetchCount() {
    const { count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    setPatientCount(count || 0);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate sequential ID
    const generatedId = `P${patientCount + 1001}`; // Starting from 1001 for professional look
    
    const { data, error } = await supabase
      .from('patients')
      .insert([
        { 
          patient_id: generatedId,
          full_name: formData.name,
          age: parseInt(formData.age),
          blood_group: formData.bloodGroup,
          phone: formData.phone,
          emergency_contact: formData.emergencyContact,
          address: formData.address,
          allergies: formData.allergies,
          sharing_password: formData.sharing_password
        }
      ])
      .select();

    setLoading(false);
    if (error) {
      alert("Registration failed: " + error.message);
    } else {
      setNewId(generatedId);
      setShowSuccess(true);
      // We don't navigate immediately anymore, showing modal first
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newId);
    alert("Patient ID copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl shadow-indigo-500/10 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-teal-500" size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Registration Success!</h2>
              <p className="text-slate-500 font-medium mb-8">Your digital health identity has been generated and secured.</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 relative group">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Your Unique Patient ID</span>
                <div className="flex justify-between items-center">
                   <div className="text-4xl font-black text-indigo-600 tracking-tight">{newId}</div>
                   <button 
                    onClick={copyToClipboard}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600"
                   >
                     <Copy size={20} />
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/patient')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-indigo-100"
                >
                  Enter Patient Portal <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4 shadow-sm">
            <UserPlus className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Join SmartCare</h1>
          <p className="text-slate-500 font-medium italic">Establishing Enterprise Security Protocol ID #{1001 + patientCount}</p>
        </div>

        <div className="glass-card p-8 md:p-12 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <ShieldPlus size={160} />
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
              <input 
                required
                type="text"
                placeholder="Johnathan Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Age</label>
              <input 
                required
                type="number"
                placeholder="28"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Blood Group</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
              <input 
                required
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Emergency Contact</label>
              <input 
                required
                type="tel"
                placeholder="+91 90000 11111"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Allergies (If any)</label>
              <input 
                type="text"
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Address</label>
              <input 
                type="text"
                placeholder="123 Main Street, City"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 p-6 bg-rose-50 rounded-2xl border border-rose-100 mb-4 shadow-inner">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="text-rose-500 w-5 h-5" />
                <h3 className="font-black text-rose-900 uppercase tracking-tight text-sm">Security: Sharing Password</h3>
              </div>
              <p className="text-xs text-rose-700 mb-4 font-bold leading-relaxed">
                Set a secret password to protect your full medical history. 
                Scanned emergency profiles will ONLY show vitals until this password is given.
              </p>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a secret sharing password"
                  style={{ color: '#000' }}
                  className="w-full bg-white border border-rose-200 rounded-xl px-4 py-4 pr-14 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-bold shadow-sm"
                  value={formData.sharing_password}
                  onChange={(e) => setFormData({...formData, sharing_password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-2xl hover:shadow-indigo-200 group active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                     <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                     Registering...
                  </div>
                ) : (
                  <>
                    Create My Digital Identity
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-12 flex items-center gap-3 p-4 bg-slate-50 rounded-xl justify-center border border-slate-100">
            <ShieldCheck className="text-teal-500 w-5 h-5" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Secured by SmartCare AI Hub Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
