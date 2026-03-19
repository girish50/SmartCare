import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Stethoscope, ShieldCheck, Eye, EyeOff, 
  Activity, ChevronRight, UserPlus, LogIn, Mail, Lock, Heart
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'patient', label: 'Patient', icon: <User size={20} />, color: 'indigo', desc: 'Access your medical records' },
  { id: 'staff', label: 'Staff', icon: <Briefcase size={20} />, color: 'teal', desc: 'Reception & Pharmacy' },
  { id: 'doctor', label: 'Doctor', icon: <Stethoscope size={20} />, color: 'rose', desc: 'Consultations & Queue' },
  { id: 'admin', label: 'Admin', icon: <ShieldCheck size={20} />, color: 'amber', desc: 'Full system access' },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [isRegister, setIsRegister] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', patientId: '', specialization: ''
  });

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  // Patient login
  const handlePatientLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', formData.patientId.toUpperCase())
      .single();
    
    setLoading(false);
    if (error || !data) { alert('Patient ID not found!'); return; }
    if (data.sharing_password !== formData.password) { alert('Incorrect password!'); return; }
    login({ name: data.full_name, id: data.patient_id, uuid: data.id }, 'patient');
    navigate('/patient');
  };

  // Staff/Doctor/Admin register
  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill all fields!'); return;
    }
    setLoading(true);
    const table = selectedRole === 'doctor' ? 'doctor_users' : selectedRole === 'admin' ? 'admin_users' : 'staff_users';
    
    const insertData = {
      name: formData.name,
      email: formData.email.toLowerCase(),
      password: formData.password,
    };
    if (selectedRole === 'doctor') insertData.specialization = formData.specialization || 'General';

    const { error } = await supabase.from(table).insert([insertData]);
    setLoading(false);
    if (error) {
      if (error.message.includes('duplicate')) alert('Email already registered!');
      else alert('Registration failed: ' + error.message);
      return;
    }
    alert('Registration successful! You can now login.');
    setIsRegister(false);
  };

  // Staff/Doctor/Admin login
  const handleStaffLogin = async () => {
    setLoading(true);
    const table = selectedRole === 'doctor' ? 'doctor_users' : selectedRole === 'admin' ? 'admin_users' : 'staff_users';
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('email', formData.email.toLowerCase())
      .single();
    
    setLoading(false);
    if (error || !data) { alert('Account not found!'); return; }
    if (data.password !== formData.password) { alert('Incorrect password!'); return; }
    
    login({ name: data.name, email: data.email, id: data.id }, selectedRole);
    
    const redirectMap = { staff: '/reception', doctor: '/doctor', admin: '/admin' };
    navigate(redirectMap[selectedRole] || '/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === 'patient') {
      handlePatientLogin();
    } else if (isRegister) {
      handleRegister();
    } else {
      handleStaffLogin();
    }
  };

  const currentRole = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4">
            <Heart className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SmartCare Login</h1>
          <p className="text-sm text-slate-500 mt-2">Select your role and sign in to access the system.</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => { setSelectedRole(role.id); setIsRegister(false); }}
              className={`p-3 rounded-xl text-center transition-all border-2 ${
                selectedRole === role.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-center mb-1">{role.icon}</div>
              <div className="text-[10px] font-black uppercase tracking-widest">{role.label}</div>
            </button>
          ))}
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">{currentRole.icon}</div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isRegister ? `Register as ${currentRole.label}` : `${currentRole.label} Login`}
              </h2>
              <p className="text-xs text-slate-400">{currentRole.desc}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Patient uses Patient ID */}
            {selectedRole === 'patient' ? (
              <>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Patient ID</label>
                  <input type="text" placeholder="e.g. P1001" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none uppercase"
                    value={formData.patientId} onChange={(e) => update('patientId', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sharing Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} placeholder="Your sharing password" required
                      style={{ color: '#000' }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={formData.password} onChange={(e) => update('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  New patient? <a href="/register" className="text-indigo-600 font-bold hover:underline">Register first →</a>
                </p>
              </>
            ) : (
              <>
                {/* Staff/Doctor/Admin use email + password */}
                {isRegister && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" placeholder="Enter your full name" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={formData.name} onChange={(e) => update('name', e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="email" placeholder="your@email.com" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={formData.email} onChange={(e) => update('email', e.target.value)} />
                  </div>
                </div>
                {isRegister && selectedRole === 'doctor' && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Specialization</label>
                    <input type="text" placeholder="e.g. Cardiology, General"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={formData.specialization} onChange={(e) => update('specialization', e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type={showPw ? 'text' : 'password'} placeholder="Enter password" required
                      style={{ color: '#000' }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={formData.password} onChange={(e) => update('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-indigo-600 font-bold hover:underline text-center w-full">
                  {isRegister ? '← Already have an account? Login' : 'New here? Register →'}
                </button>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 mt-2">
              {loading ? <Activity size={18} className="animate-spin" /> : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          <a href="/" className="hover:text-indigo-600 font-bold">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}
