import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Activity, 
  Trash2,
  Zap,
  TrendingDown,
  Clock,
  ChevronRight,
  ShieldCheck,
  Pill
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function PharmacyPortal() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newMed, setNewMed] = useState({ medicine_name: '', stock_count: 100, daily_burn_rate: 5, reorder_level: 20 });

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('*').order('medicine_name');
    if (data) setInventory(data);
    setLoading(false);
  }

  useEffect(() => {
    const init = async () => {
       await fetchInventory();
    };
    init();
    const sub = supabase.channel('inv-room').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetchInventory).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const handleDispense = async (id, currentStock) => {
    if (currentStock <= 0) {
      alert("Stock out!");
      return;
    }
    setProcessing(true);
    const { error } = await supabase
      .from('inventory')
      .update({ stock_count: currentStock - 1 })
      .eq('id', id);
    
    setProcessing(false);
    if (error) alert(error.message);
  };

  // Add new medicine
  const handleAddMedicine = async () => {
    if (!newMed.medicine_name.trim()) { alert('Please enter a medicine name!'); return; }
    setAdding(true);
    const { error } = await supabase.from('inventory').insert([{
      medicine_name: newMed.medicine_name.trim(),
      stock_count: parseInt(newMed.stock_count) || 100,
      daily_burn_rate: parseInt(newMed.daily_burn_rate) || 5,
      reorder_level: parseInt(newMed.reorder_level) || 20,
    }]);
    setAdding(false);
    if (error) { alert('Failed to add: ' + error.message); return; }
    setShowAddModal(false);
    setNewMed({ medicine_name: '', stock_count: 100, daily_burn_rate: 5, reorder_level: 20 });
    fetchInventory();
  };

  // Delete medicine
  const handleDelete = async (id, name) => {
    // Direct delete without browser confirm popup (which can be blocked)
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      fetchInventory();
    }
  };

  const filtered = inventory.filter(i => i.medicine_name.toLowerCase().includes(filter.toLowerCase()));

  // Startup Intelligence: Calculate predictive days remaining
  const getPredictiveDays = (stock, burnRate) => {
    if (!burnRate || burnRate <= 0) return '∞';
    const days = Math.floor(stock / burnRate);
    return days;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-600 rounded-[1.5rem] shadow-2xl shadow-emerald-100 group">
              <ShoppingCart className="text-white group-hover:scale-110 transition-transform" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Predictive Pharmacy Hub</h1>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">St. Mary's Neural Logistics • Zone B</p>
            </div>
          </div>
          <div className="flex bg-white p-3 border border-slate-100 rounded-3xl shadow-sm gap-2">
             <div className="px-6 py-2 text-center border-r border-slate-50">
                <div className="text-2xl font-black text-slate-900">{inventory.length}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Active SKUs</div>
             </div>
             <div className="px-6 py-2 text-center">
                <div className="text-2xl font-black text-rose-500">{inventory.filter(i => i.stock_count < 50).length}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Refill Alerts</div>
             </div>
          </div>
        </header>

        <div className="glass-card p-12 bg-white mb-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Package size={200} />
          </div>
          
          <div className="flex flex-col xl:flex-row gap-8 items-end mb-12 relative z-10">
            <div className="relative flex-1 w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Inventory Registry Lookup</label>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                <input 
                  type="text" 
                  placeholder="Scan SKU or Enter Clinical Name..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-6 py-6 font-black text-slate-700 outline-none focus:ring-8 focus:ring-emerald-50 focus:border-emerald-600 transition-all shadow-inner text-lg"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full xl:w-auto px-12 py-6 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-black shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] active:scale-95">
              <Zap size={20} className="text-emerald-400" />
              Register New Stock
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">
                  <th className="pb-6 pl-10">Neural Medication</th>
                  <th className="pb-6">Quantum Stock Status</th>
                  <th className="pb-6">Burn Analytics</th>
                  <th className="pb-6">Predictive Runway</th>
                  <th className="pb-6 text-center">Protocol</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-20 font-black text-slate-200 uppercase tracking-widest">Encrypting Terminal...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-20 text-slate-300 font-bold">No matching SKUs in regional registry.</td></tr>
                ) : filtered.map(item => {
                  const daysLeft = getPredictiveDays(item.stock_count, item.daily_burn_rate || 5);
                  const isLow = item.stock_count < 50;
                  
                  return (
                    <tr key={item.id} className="group hover:translate-x-2 transition-all duration-300">
                      <td className="bg-slate-50 rounded-l-[2rem] p-8 border-y border-l border-slate-100">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isLow ? 'bg-rose-50 text-rose-600 shadow-xl shadow-rose-100' : 'bg-emerald-50 text-emerald-600 shadow-xl shadow-emerald-100'}`}>
                            <Package size={24} className="group-hover:rotate-12 transition-transform" />
                          </div>
                          <div>
                             <span className="font-black text-xl text-slate-900 tracking-tight block">{item.medicine_name}</span>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SKU: #{item.id.slice(0,8).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="bg-slate-50 p-8 border-y border-slate-100">
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                             <span className={isLow ? 'text-rose-600' : 'text-slate-400'}>{item.stock_count} units</span>
                             <span className="text-slate-200 italic">Target: 1000</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                             <div className={`h-full transition-all duration-1000 ease-out ${isLow ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${Math.min((item.stock_count/1000)*100, 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="bg-slate-50 p-8 border-y border-slate-100">
                         <div className="flex items-center gap-3">
                            <TrendingDown className="text-rose-400" size={16} />
                            <div>
                               <div className="text-lg font-black text-slate-900 leading-none">{item.daily_burn_rate || 5}</div>
                               <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Units / Day</div>
                            </div>
                         </div>
                      </td>
                      <td className="bg-slate-50 p-8 border-y border-slate-100">
                        <div className={`inline-flex flex-col px-4 py-2 rounded-xl border ${isLow ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                           <span className="text-[8px] font-black uppercase italic tracking-widest">Stock Out in:</span>
                           <span className="text-lg font-black">{daysLeft} Days</span>
                        </div>
                      </td>
                      <td className="bg-slate-50 rounded-r-[2rem] p-8 border-y border-r border-slate-100 text-center">
                        <div className="flex gap-4 justify-center">
                          <button 
                            onClick={() => handleDispense(item.id, item.stock_count)}
                            disabled={processing || item.stock_count <= 0}
                            className={`px-8 py-3 font-black text-[10px] rounded-xl transition-all shadow-xl uppercase tracking-widest flex items-center gap-2 ${
                              isLow ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                            } disabled:opacity-50`}
                          >
                            {processing ? <Activity size={12} className="animate-spin" /> : <ChevronRight size={14} />}
                            Dispense
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.medicine_name)}
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Startup X-Factor: Advisory Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="glass-card p-10 bg-white border-l-8 border-indigo-600 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                 <Zap size={80} />
              </div>
              <h4 className="text-md font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                <Zap className="text-indigo-600" size={20} /> AI Stock Advisor
              </h4>
              <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed italic opacity-80">
                Predictive analytics suggest a 22% surge in demand for <span className="text-indigo-600">Antibiotics</span> due to regional temperature drops next week.
              </p>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:gap-4 flex items-center gap-2 transition-all">
                Approve Orders <ChevronRight size={14} />
              </button>
           </div>

           <div className="glass-card p-10 bg-white border-l-8 border-rose-500 shadow-2xl shadow-rose-500/5">
              <h4 className="text-md font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                <AlertTriangle className="text-rose-600" size={20} /> Critical Shortage
              </h4>
              <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed">
                <span className="text-rose-600 font-black uppercase">Urgent:</span> Amoxicillin stock is below the safety threshold. Clinical ROI risk detected for Pedatric Ward.
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 w-fit">
                 <Clock size={14} className="text-rose-500" />
                 <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">ETA REFILL: 14:00 Today</span>
              </div>
           </div>

           <div className="glass-card p-6 bg-indigo-600 text-white shadow-2xl shadow-indigo-100 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h4 className="text-md font-black uppercase tracking-tight mb-3 flex items-center gap-3">
                <ShieldCheck className="text-indigo-200" size={20} /> Batch Verification
              </h4>
              <p className="text-xs font-medium mb-4 leading-relaxed opacity-80 italic">
                All scheduled pharmacological protocols are synced with the Clinical Decision Suite for Patient P1022 - P1050.
              </p>
              <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-[8px] font-black uppercase tracking-[0.2em] text-center">
                 Ledger Integrity: 99.9%
              </div>
           </div>
        </div>

      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Package size={20} className="text-emerald-600" /> Register New Medicine</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Medicine Name</label>
                <input type="text" placeholder="e.g. Amoxicillin 500mg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={newMed.medicine_name} onChange={(e) => setNewMed({ ...newMed, medicine_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Stock</label>
                  <input type="number" min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-center focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={newMed.stock_count} onChange={(e) => setNewMed({ ...newMed, stock_count: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Burn/Day</label>
                  <input type="number" min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-center focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={newMed.daily_burn_rate} onChange={(e) => setNewMed({ ...newMed, daily_burn_rate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reorder</label>
                  <input type="number" min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-center focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={newMed.reorder_level} onChange={(e) => setNewMed({ ...newMed, reorder_level: e.target.value })} />
                </div>
              </div>
              <button onClick={handleAddMedicine} disabled={adding}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {adding ? <Activity size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
