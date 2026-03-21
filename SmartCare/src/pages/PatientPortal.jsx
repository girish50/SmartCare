import React, { useState, useEffect } from 'react';
import { 
  User, QrCode, Share2, ChevronRight, Droplet, AlertCircle, Calendar,
  Lock, Eye, EyeOff, Copy, Check, ShieldPlus, Zap, Key, Activity,
  Clock, X, Timer, Shield, Clipboard, Plus, LogOut
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../utils/supabaseClient';

export default function PatientPortal() {
  const [phone, setPhone] = useState('');
  const [patient, setPatient] = useState(() => {
    try {
      const p = localStorage.getItem('smartcare_patient_session');
      return p ? JSON.parse(p) : null;
    } catch { return null; }
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Bio-data editing
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // OTP-based sharing — restore from localStorage on mount
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTimer, setShareTimer] = useState(10);
  const [shareLink, setShareLink] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('smartcare_share')); return s?.link || ''; } catch { return ''; }
  });
  const [shareLinkActive, setShareLinkActive] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('smartcare_share'));
      if (s?.expiresAt && Date.now() < s.expiresAt) return true;
      return false;
    } catch { return false; }
  });
  const [shareCountdown, setShareCountdown] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('smartcare_share'));
      if (s?.expiresAt) return Math.max(0, Math.floor((s.expiresAt - Date.now()) / 1000));
      return 0;
    } catch { return 0; }
  });
  const [generatedOTP, setGeneratedOTP] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('smartcare_share')); return s?.otp || ''; } catch { return ''; }
  });

  // Password update
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Search patient
  const handleSearch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('patients')
      .select('*')
      .or(`phone.eq.${phone},patient_id.eq.${phone.toUpperCase()}`)
      .single();
    
    if (data) {
      setPatient(data);
      localStorage.setItem('smartcare_patient_session', JSON.stringify(data));
      setEditData({
        full_name: data.full_name, age: data.age, blood_group: data.blood_group,
        phone: data.phone, emergency_contact: data.emergency_contact,
        address: data.address || '', allergies: data.allergies || ''
      });
      const { data: recs } = await supabase
        .from('medical_records').select('*')
        .eq('patient_id', data.id)
        .order('created_at', { ascending: false });
      setRecords(recs || []);
    } else {
      alert('Patient not found. Try your Patient ID (e.g. P1001) or phone number.');
    }
    setLoading(false);
  };

  // Realtime updates for medical records
  useEffect(() => {
    if (!patient?.id) return;
    
    // Subscribe to new medical records for this specific patient
    const channel = supabase
      .channel('public:medical_records')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'medical_records', 
        filter: `patient_id=eq.${patient.id}` 
      }, payload => {
        setRecords(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [patient?.id]);

  // Save bio-data
  const handleSaveBioData = async () => {
    setSaving(true);
    const { error } = await supabase.from('patients').update(editData).eq('id', patient.id);
    setSaving(false);
    if (!error) {
      setPatient({ ...patient, ...editData });
      localStorage.setItem('smartcare_patient_session', JSON.stringify({ ...patient, ...editData }));
      setEditMode(false);
      alert('Bio-data updated!');
    } else alert('Update failed: ' + error.message);
  };

  // Update sharing password
  const handlePasswordUpdate = async () => {
    if (oldPassword !== patient.sharing_password) { alert('Current password is incorrect!'); return; }
    if (!newPassword || newPassword.length < 3) { alert('New password must be at least 3 characters.'); return; }
    setPwSaving(true);
    const { error } = await supabase.from('patients').update({ sharing_password: newPassword }).eq('id', patient.id);
    setPwSaving(false);
    if (!error) {
      setPatient({ ...patient, sharing_password: newPassword });
      localStorage.setItem('smartcare_patient_session', JSON.stringify({ ...patient, sharing_password: newPassword }));
      setShowPasswordModal(false); setOldPassword(''); setNewPassword('');
      alert('Password updated!');
    } else alert('Update failed: ' + error.message);
  };

  // Generate OTP + timed share link — persists to localStorage
  const generateOTPShare = () => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const link = `${window.location.origin}/e/${patient.patient_id}?token=${token}&otp=${otp}`;
    const expiresAt = Date.now() + shareTimer * 60 * 1000;
    // Save to localStorage so it survives page refresh
    localStorage.setItem('smartcare_share', JSON.stringify({ otp, link, expiresAt }));
    setGeneratedOTP(otp);
    setShareLink(link);
    setShareLinkActive(true);
    setShareCountdown(shareTimer * 60);
    setShowShareModal(false);
  };

  // Revoke share helper
  const revokeShare = () => {
    setShareLinkActive(false);
    setShareLink('');
    setShareCountdown(0);
    setGeneratedOTP('');
    localStorage.removeItem('smartcare_share');
  };

  // Countdown timer
  useEffect(() => {
    if (shareCountdown <= 0) {
      if (shareLinkActive) {
        setTimeout(() => revokeShare(), 0);
      }
      return;
    }
    const interval = setInterval(() => setShareCountdown(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [shareCountdown, shareLinkActive]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('smartcare_patient_session');
    localStorage.removeItem('smartcare_share');
    setPatient(null);
    setRecords([]);
    setPhone('');
  };

  const emergencyUrl = patient ? `${window.location.origin}/e/${patient.patient_id}` : '';

  // LOGIN SCREEN
  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4">
              <User className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Portal</h1>
            <p className="text-slate-500 text-sm mt-2">Enter your Patient ID or phone to access your records.</p>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Patient ID (P1001) or Phone Number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-900"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} disabled={loading || !phone}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95">
              {loading ? <Activity size={18} className="animate-spin" /> : <ChevronRight size={18} />}
              Access My Records
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PORTAL
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Patient Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            <div className="flex items-start gap-6">
              <div className="p-5 bg-indigo-50 rounded-2xl"><User className="text-indigo-600" size={32} /></div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SmartCare Identity</div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patient.full_name}</h1>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold">{patient.patient_id}</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold flex items-center gap-1"><Droplet size={14} /> {patient.blood_group}</span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold">Age: {patient.age}</span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold">📞 {patient.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setEditMode(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all text-sm">✏️ Update Bio-Data</button>
              <button onClick={() => setShowPasswordModal(true)} className="px-5 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-all text-sm flex items-center gap-2"><Lock size={14} /> Change Password</button>
              <button onClick={() => setShowShareModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm flex items-center gap-2"><Key size={16} /> Share via OTP</button>
              <button onClick={handleLogout} className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm flex items-center gap-2"><LogOut size={14} /> Log Out</button>
            </div>
          </div>
        </div>

        {/* Bio-Data Edit Modal */}
        {editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900">Update Bio-Data</h2>
                <button onClick={() => setEditMode(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'full_name', label: 'Full Name', type: 'text' },
                  { key: 'age', label: 'Age', type: 'number' },
                  { key: 'blood_group', label: 'Blood Group', type: 'text' },
                  { key: 'phone', label: 'Phone', type: 'tel' },
                  { key: 'emergency_contact', label: 'Emergency Contact', type: 'tel' },
                  { key: 'address', label: 'Address', type: 'text' },
                  { key: 'allergies', label: 'Allergies', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{field.label}</label>
                    <input type={field.type}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={editData[field.key] || ''}
                      onChange={(e) => setEditData({ ...editData, [field.key]: field.key === 'age' ? parseInt(e.target.value) || '' : e.target.value })} />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveBioData} disabled={saving}
                className="w-full mt-6 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Activity size={16} className="animate-spin" /> : <Check size={16} />} Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Password Update Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Lock size={20} className="text-rose-600" /> Change Password</h2>
                <button onClick={() => { setShowPasswordModal(false); setOldPassword(''); setNewPassword(''); }} className="p-2 text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                  <div className="relative">
                    <input type={showOldPw ? 'text' : 'password'} style={{ color: '#000' }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 font-bold focus:ring-2 focus:ring-rose-500/20 outline-none"
                      value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600">
                      {showOldPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input type={showNewPw ? 'text' : 'password'} style={{ color: '#000' }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                      {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button onClick={handlePasswordUpdate} disabled={pwSaving}
                  className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {pwSaving ? <Activity size={16} className="animate-spin" /> : <Lock size={16} />} Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Key size={20} className="text-indigo-600" /> Generate OTP Access</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>
              <div className="space-y-5">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-sm text-indigo-700 font-bold">A <strong>6-digit OTP</strong> will be generated that you can share verbally with anyone. They enter this OTP to view your general info for a limited time.</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Access Duration</label>
                  <div className="flex items-center gap-3">
                    {[5, 10, 15, 30].map((mins) => (
                      <button key={mins} onClick={() => setShareTimer(mins)}
                        className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                          shareTimer === mins ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}>
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={generateOTPShare}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Zap size={16} /> Generate OTP ({shareTimer} min access)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TWO QR SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* EMERGENCY QR */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-50 rounded-xl"><AlertCircle className="text-rose-600" size={20} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Emergency QR Code</h3>
                <p className="text-xs text-slate-400 font-medium">Anyone can scan — shows only vitals (ID, blood, allergies)</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <QRCodeCanvas value={emergencyUrl} size={180} level="H" />
              </div>
              <div className="w-full">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Emergency Link</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value={emergencyUrl} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 truncate" />
                  <button onClick={() => copyText(emergencyUrl)} className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* OTP ACCESS CARD */}
          <div className="bg-white rounded-3xl p-8 border-2 border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Shield size={120} /></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-xl"><Key className="text-indigo-600" size={20} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-900">OTP Access Protocol</h3>
                <p className="text-xs text-slate-400 font-medium">Timed OTP access to general patient info</p>
              </div>
            </div>

            {!shareLinkActive ? (
              <div className="space-y-4">
                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
                  <Shield className="text-indigo-300 mx-auto mb-3" size={48} />
                  <p className="text-sm text-indigo-600 font-bold">No active OTP session</p>
                  <p className="text-xs text-indigo-400 mt-1">Click "Share via OTP" to generate a timed access code.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">How OTP Sharing Works</h4>
                  <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                    <li>Click "Share via OTP" and set a timer</li>
                    <li>A <strong>6-digit OTP</strong> is generated instantly</li>
                    <li>Share this OTP verbally with the person</li>
                    <li>They enter the OTP to view your general info</li>
                    <li>When the timer expires, the OTP stops working</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active OTP + QR */}
                <div className="flex flex-col items-center gap-4">
                  {/* OTP Display */}
                  <div className="w-full p-5 bg-indigo-600 rounded-2xl text-center relative">
                    <div className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-2">Your OTP Code</div>
                    <div className="text-4xl font-black text-white tracking-[0.5em] font-mono">{generatedOTP}</div>
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-rose-500 text-white text-xs font-black rounded-full flex items-center gap-1">
                      <Timer size={12} /> {formatCountdown(shareCountdown)}
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <QRCodeCanvas value={shareLink} size={140} level="H" />
                  </div>
                  <div className="w-full flex gap-2">
                    <input type="text" readOnly value={shareLink} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-600 truncate" />
                    <button onClick={() => copyText(shareLink)} className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                  <p className="text-xs text-amber-700 font-bold">⏱️ OTP expires in {formatCountdown(shareCountdown)}</p>
                </div>
                <button onClick={revokeShare}
                  className="w-full py-3 text-rose-600 text-sm font-bold bg-rose-50 rounded-xl hover:bg-rose-100 transition-all">
                  Revoke OTP Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-50 rounded-xl"><Calendar className="text-teal-600" size={20} /></div>
            <h2 className="text-lg font-black text-slate-900">Clinical History</h2>
            <span className="ml-auto text-sm text-slate-400 font-bold">{records.length} Records</span>
          </div>
          {records.length === 0 ? (
            <div className="text-center py-16 text-slate-300">
              <Activity className="mx-auto mb-4" size={48} />
              <p className="font-bold text-lg">No medical records yet</p>
              <p className="text-sm mt-1">Records will appear here after your first consultation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((rec, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <span className="font-black text-slate-900">{rec.diagnosis || 'Consultation'}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">
                      {new Date(rec.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {rec.prescription && (
                    <p className="text-sm text-slate-500 ml-6"><span className="font-bold text-slate-700">Rx:</span> {rec.prescription}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
