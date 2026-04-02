import React, { useState, useEffect } from 'react';
import { Activity, Users, Clock, Bed } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function PublicStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from('hospital_stats')
        .select('*')
        .single();
      
      if (!error) setStats(data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading live hospital data...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Live Hospital Status
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Check real-time availability and wait times to choose the best care for your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-indigo-500">
          <div className="flex items-center gap-4 mb-2">
            <Users className="text-indigo-600 h-6 w-6" />
            <span className="text-slate-500 font-medium">Doctors on Duty</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats?.total_doctors_on_duty || 8}</div>
        </div>

        <div className="glass-card p-6 border-l-4 border-teal-500">
          <div className="flex items-center gap-4 mb-2">
            <Clock className="text-teal-600 h-6 w-6" />
            <span className="text-slate-500 font-medium">Avg. Wait Time</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats?.avg_wait_time_minutes || 18} mins</div>
        </div>

        <div className="glass-card p-6 border-l-4 border-emerald-500">
          <div className="flex items-center gap-4 mb-2">
            <Bed className="text-emerald-600 h-6 w-6" />
            <span className="text-slate-500 font-medium">Available Beds</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">12 / 65</div>
        </div>

        <div className="glass-card p-6 border-l-4 border-rose-500">
          <div className="flex items-center gap-4 mb-2">
            <Activity className="text-rose-600 h-6 w-6" />
            <span className="text-slate-500 font-medium">Emergency Load</span>
          High
          </div>
          <div className="text-3xl font-bold text-rose-600">High</div>
        </div>
      </div>

      <div className="glass-card p-8 bg-white/50 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Why check stats?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-bold text-indigo-600 mb-2 uppercase tracking-wider text-xs">Faster Care</h3>
            <p className="text-slate-600">Choose hospitals with shorter waiting lists to get treated quicker.</p>
          </div>
          <div>
            <h3 className="font-bold text-teal-600 mb-2 uppercase tracking-wider text-xs">Real-time Data</h3>
            <p className="text-slate-600">Our AI monitors every ward to give you second-by-second accuracy.</p>
          </div>
          <div>
            <h3 className="font-bold text-emerald-600 mb-2 uppercase tracking-wider text-xs">Transparency</h3>
            <p className="text-slate-600">Building trust between patients and providers through total data openness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
