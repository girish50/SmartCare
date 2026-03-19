import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Users, 
  Stethoscope, 
  Settings, 
  Activity,
  Shield,
  Search,
  Zap,
  Globe,
  ShoppingCart,
  ChevronRight,
  ClipboardList,
  QrCode,
  Pill,
  ArrowRight,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const [liveStats, setLiveStats] = useState({ patients: 0, beds: 0, queue: 0 });

  useEffect(() => {
    async function fetchLive() {
      const { count: pCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
      const { count: qCount } = await supabase.from('queue').select('*', { count: 'exact', head: true });
      setLiveStats({ patients: pCount || 0, beds: 12, queue: qCount || 0 });
    }
    fetchLive();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================== HERO ==================== */}
      <section className="py-20 bg-white border-b border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-bold mb-8">
                <Globe className="w-3.5 h-3.5" /> Enterprise Hospital Platform v4.2
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                AI-Powered
                <span className="text-indigo-600 block">Smart Healthcare</span>
              </h1>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                Sequential Digital IDs, Neural Triage, Predictive Pharmacy, and Real-Time Hospital Analytics — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                  <UserPlus size={18} /> Register Now
                </Link>
                <Link to="/patient" className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2">
                  <QrCode size={18} /> Access My Records
                </Link>
              </div>
            </div>
            
            {/* Live Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Registered Patients', value: liveStats.patients, color: 'indigo', icon: <Users size={20} /> },
                { label: 'Available Beds', value: liveStats.beds, color: 'teal', icon: <Heart size={20} /> },
                { label: 'In Queue Now', value: liveStats.queue, color: 'amber', icon: <Activity size={20} /> },
              ].map((stat, i) => (
                <div key={i} className={`p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-center hover:-translate-y-1 transition-transform`}>
                  <div className={`inline-flex p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl mb-4`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== QUICK ACCESS GRID (ALL FEATURES) ==================== */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">All Service Portals</h2>
            <p className="text-slate-500 font-medium">Click any card below to access that section of the hospital system.</p>
          </div>
          <div className="px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-400 flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={14} className="text-emerald-500" /> All Systems Online
          </div>
        </div>

        {/* FOR PATIENTS - Row 1 */}
        <div className="mb-6">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 ml-1">For Patients</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/register" className="group p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex items-start gap-5">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <UserPlus size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">Register New Patient</h3>
                <p className="text-sm text-slate-500 mb-3">Get your SmartCare ID (P1001+), set sharing password, and join the system.</p>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">Open Registration <ChevronRight size={14} /></span>
              </div>
            </Link>

            <Link to="/patient" className="group p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/5 transition-all flex items-start gap-5">
              <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
                <Users size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">Patient Portal</h3>
                <p className="text-sm text-slate-500 mb-3">View your QR code, medical history, generate One-Time Health Passport keys.</p>
                <span className="text-xs font-bold text-teal-600 flex items-center gap-1 group-hover:gap-2 transition-all">My Records <ChevronRight size={14} /></span>
              </div>
            </Link>

            <Link to="/stats" className="group p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/5 transition-all flex items-start gap-5">
              <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                <Activity size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">Live Hospital Status</h3>
                <p className="text-sm text-slate-500 mb-3">Check real-time wait times, bed availability, and doctor counts before visiting.</p>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:gap-2 transition-all">View Stats <ChevronRight size={14} /></span>
              </div>
            </Link>
          </div>
        </div>

        {/* FOR STAFF - Row 2 */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1 mt-8">For Hospital Staff</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/reception" className="group p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:shadow-lg transition-all">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors inline-block mb-4">
                <ClipboardList size={22} />
              </div>
              <h3 className="text-md font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">Reception Desk</h3>
              <p className="text-xs text-slate-400 mb-3">Search patients by ID/Phone, AI triage, live check-in queue.</p>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">Enter <ArrowRight size={12} /></span>
            </Link>

            <Link to="/doctor" className="group p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-violet-400 hover:shadow-lg transition-all">
              <div className="p-3 bg-violet-50 rounded-xl text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors inline-block mb-4">
                <Stethoscope size={22} />
              </div>
              <h3 className="text-md font-black text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">Doctor Console</h3>
              <p className="text-xs text-slate-400 mb-3">Patient queue, diagnosis entry, prescription, clinical history.</p>
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest flex items-center gap-1">Enter <ArrowRight size={12} /></span>
            </Link>

            <Link to="/admin" className="group p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-slate-400 hover:shadow-lg transition-all">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors inline-block mb-4">
                <Settings size={22} />
              </div>
              <h3 className="text-md font-black text-slate-900 mb-1 group-hover:text-slate-600 transition-colors">Admin Dashboard</h3>
              <p className="text-xs text-slate-400 mb-3">Revenue advisor, medicine AI, operations, ERNova simulation.</p>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">Enter <ArrowRight size={12} /></span>
            </Link>

            <Link to="/pharmacy" className="group p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-emerald-400 hover:shadow-lg transition-all">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors inline-block mb-4">
                <ShoppingCart size={22} />
              </div>
              <h3 className="text-md font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">Smart Pharmacy</h3>
              <p className="text-xs text-slate-400 mb-3">Inventory tracking, AI stock alerts, dispense medicines, burn analytics.</p>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">Enter <ArrowRight size={12} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-4">How SmartCare Works</h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">The complete patient journey — from registration to treatment.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Patient fills registration form → gets a unique ID (P1001+) and sharing password.', icon: <UserPlus size={20} />, color: 'indigo' },
              { step: '02', title: 'Check-In', desc: 'Reception searches by ID/phone → AI triage rates urgency → added to live queue.', icon: <ClipboardList size={20} />, color: 'teal' },
              { step: '03', title: 'Consultation', desc: 'Doctor sees the queue → examines patient → writes diagnosis & prescription.', icon: <Stethoscope size={20} />, color: 'violet' },
              { step: '04', title: 'Pharmacy', desc: 'Patient takes prescription to pharmacy → medicine dispensed → stock auto-decreases.', icon: <Pill size={20} />, color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className="relative text-center p-8 group">
                {i < 3 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-slate-100"></div>}
                <div className={`relative z-10 w-16 h-16 mx-auto bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                  {item.icon}
                </div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Step {item.step}</div>
                <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== KEY FEATURES ==================== */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-12">What Makes SmartCare Unique</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Health Passport™', 
              desc: 'Sequential Patient IDs (P1001+) with QR codes. Generate one-time access keys for external specialists.',
              icon: <Shield className="text-indigo-600" size={24} />,
              bg: 'bg-indigo-50'
            },
            { 
              title: 'AI Neural Triage', 
              desc: 'Prometheus Engine analyzes symptoms and auto-routes patients to the correct department with urgency scores.',
              icon: <Zap className="text-amber-500" size={24} />,
              bg: 'bg-amber-50'
            },
            { 
              title: 'Predictive Analytics', 
              desc: 'ERNova simulation predicts wait times, revenue impact, and stock shortages before they happen.',
              icon: <Search className="text-teal-600" size={24} />,
              bg: 'bg-teal-50'
            }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
              <div className={`p-4 ${item.bg} rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-3">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-16 bg-indigo-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-black mb-4 tracking-tight">Ready to experience modern healthcare?</h2>
          <p className="text-indigo-100 mb-8 text-lg">Register in 30 seconds, get your Digital Health Passport, and access all services instantly.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 shadow-xl transition-all flex items-center gap-2">
              <UserPlus size={18} /> Start Registration <ArrowRight size={16} />
            </Link>
            <Link to="/stats" className="px-10 py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-400 transition-all border border-indigo-400 flex items-center gap-2">
              <Activity size={18} /> Check Hospital Status
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
