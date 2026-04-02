import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Activity, 
  FlaskConical, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Droplet,
  Banknote,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import SimulationDashboard from './SimulationDashboard';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState({
    patients: 0,
    wait: '18m',
    doctors: '14/18',
    occupancy: '82%',
    revenue: '$42,500',
    revenueTrend: '+12.5%'
  });
  const [inventory, setInventory] = useState([]);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [restocking, setRestocking] = useState(false);

  async function fetchAdminData() {
    setLoading(true);
    
    // 1. Fetch Patient Count
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // 2. Fetch Bed Occupancy
    const { data: bedData } = await supabase
      .from('beds')
      .select('*');
    
    let totalCap = 0;
    let totalOcc = 0;
    if (bedData) {
      bedData.forEach(b => {
        totalCap += b.total_capacity;
        totalOcc += b.occupied_count;
      });
    }

    // 3. Fetch Inventory
    const { data: invData } = await supabase
      .from('inventory')
      .select('*');

    // 4. Fetch Billing (New)
    try {
      const { data: billData } = await supabase
        .from('billing')
        .select('*')
        .order('created_at', { ascending: false });
      if (billData) setBillingData(billData);
    } catch (e) {
      console.log("Billing table not found, using mock data");
      setBillingData([
        { id: 1, amount: 2500, service_type: 'Lab Analysis', status: 'paid', created_at: new Date().toISOString() },
        { id: 2, amount: 1200, service_type: 'Pharmacy', status: 'insurance_processing', created_at: new Date().toISOString() },
        { id: 3, amount: 450, service_type: 'Consultation', status: 'pending', created_at: new Date().toISOString() }
      ]);
    }

    setStats({
      ...stats,
      patients: patientCount || 0,
      occupancy: totalCap > 0 ? `${Math.round((totalOcc/totalCap)*100)}%` : stats.occupancy
    });
    setInventory(invData || []);
    setLoading(false);
  }

  useEffect(() => {
    const init = async () => {
      await fetchAdminData();
    };
    init();
  }, []);

  // Download billing data as CSV
  const handleDownloadReport = () => {
    if (billingData.length === 0) {
      alert('No billing data to export!');
      return;
    }
    const headers = ['ID', 'Amount', 'Service Type', 'Status', 'Date'];
    const rows = billingData.map(b => [
      b.id?.substring(0, 8) || '-',
      b.amount,
      b.service_type,
      b.status,
      new Date(b.created_at).toLocaleDateString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartCare_Revenue_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get low-stock medicines
  const lowStockMeds = inventory.filter(m => m.stock_count <= (m.reorder_level || 10));

  // Batch restock all low-stock medicines
  const handleBatchRestock = async () => {
    setRestocking(true);
    for (const med of lowStockMeds) {
      await supabase.from('inventory').update({ stock_count: 100 }).eq('id', med.id);
    }
    setRestocking(false);
    setShowBatchModal(false);
    await fetchAdminData();
    alert(`✅ ${lowStockMeds.length} medicines restocked to 100 units each.`);
  };

  const navItems = [
    { id: 'analytics', label: 'Operations', icon: <LayoutDashboard size={18} /> },
    { id: 'revenue', label: 'Revenue Advisor', icon: <Banknote size={18} /> },
    { id: 'inventory', label: 'Medicine AI', icon: <Package size={18} /> },
    { id: 'simulation', label: 'Predictive ROI', icon: <TrendingUp size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">SmartCare Central Command</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Authorized Admin Terminal • Enterprise Hospital OS v4.2</p>
            </div>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-1 shadow-sm overflow-x-auto">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-3 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="p-24 text-center">
            <Activity className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Synchronizing Operations Cloud...</p>
          </div>
        ) : (
          <main className="animate-in fade-in duration-700">
            
            {activeTab === 'analytics' && (
              <div className="space-y-10">
                 {/* Top Level KPIs */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { label: 'Patient Load', value: stats.patients, sub: 'Daily Volume', icon: <Users />, color: 'indigo' },
                      { label: 'Infrastructure', value: stats.occupancy, sub: 'Bed Utilization', icon: <Droplet />, color: 'rose' },
                      { label: 'Daily Revenue', value: stats.revenue, sub: stats.revenueTrend, icon: <Banknote />, color: 'emerald' },
                      { label: 'AI Health Core', value: 'V4.2', sub: 'Status: Optimal', icon: <Zap />, color: 'amber' }
                    ].map((stat, i) => (
                      <div key={i} className="glass-card p-8 bg-white border-t-8 border-indigo-600 shadow-sm transition-all hover:-translate-y-1 group">
                        <div className={`p-4 bg-slate-50 text-indigo-600 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform`}>
                          {stat.icon}
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h4>
                        <div className="text-4xl font-black text-slate-900 tracking-tight mb-2">{stat.value}</div>
                        <p className={`text-[10px] font-bold ${stat.label.includes('Revenue') ? 'text-emerald-500' : 'text-slate-400'} italic`}>{stat.sub}</p>
                      </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                       <div className="glass-card p-10 bg-white border-t-8 border-indigo-600 shadow-sm hover:shadow-xl transition-all duration-500">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                              <Activity size={24} className="text-indigo-600" /> Live Clinical Workload Matrix
                            </h3>
                            <span className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest flex items-center gap-2">
                               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div> System Auto-Balancing Active
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {[
                               { dept: 'Emergency ER', utilization: 92, staff: '4/5', trend: 'Critical Surge', color: 'rose' },
                               { dept: 'General Ward A', utilization: 65, staff: '8/10', trend: 'Stable', color: 'emerald' },
                               { dept: 'ICU Unit', utilization: 88, staff: '6/6', trend: 'Near Capacity', color: 'amber' },
                               { dept: 'Pediatrics', utilization: 45, staff: '3/4', trend: 'Optimal', color: 'teal' },
                               { dept: 'Cardiology', utilization: 78, staff: '5/6', trend: 'High Volume', color: 'indigo' },
                               { dept: 'Neurology', utilization: 30, staff: '2/3', trend: 'Low Volume', color: 'slate' }
                             ].map((zone, i) => (
                                <div key={i} className={`p-6 rounded-2xl border ${zone.color === 'rose' ? 'bg-rose-50 border-rose-100' : zone.color === 'amber' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'} transition-transform hover:-translate-y-1`}>
                                   <div className="flex justify-between items-start mb-4">
                                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{zone.dept}</h4>
                                      <span className={`text-[9px] font-bold uppercase tracking-widest py-1 px-2 rounded-md ${zone.color === 'rose' ? 'bg-white text-rose-600' : zone.color === 'amber' ? 'bg-white text-amber-600' : 'bg-white text-indigo-600'}`}>
                                         {zone.trend}
                                      </span>
                                   </div>
                                   <div className="flex justify-between items-end mb-3">
                                      <span className={`text-4xl font-black tracking-tighter ${zone.color === 'rose' ? 'text-rose-600' : zone.color === 'amber' ? 'text-amber-600' : 'text-indigo-600'}`}>
                                         {zone.utilization}<span className="text-xl">%</span>
                                      </span>
                                      <span className="text-[10px] font-black uppercase text-slate-400">Capacity</span>
                                   </div>
                                   <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden mb-4 border border-slate-200/50">
                                      <div className={`h-full rounded-full ${zone.color === 'rose' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : zone.color === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${zone.utilization}%` }}></div>
                                   </div>
                                   <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest pt-3 border-t border-slate-200/50">
                                      <span className="text-slate-500 flex items-center gap-1"><Users size={12}/> {zone.staff} Docs Active</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                          
                          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                            <Activity className="text-slate-400" size={16} />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">AI Recommends re-routing 2 ER doctors to the ICU for the evening shift.</p>
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                       <div className="glass-card p-10 bg-white border-l-8 border-indigo-600">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Staff ROI Advisor</h3>
                          <div className="space-y-6">
                             <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Optimal Ratios</div>
                                <div className="text-2xl font-black text-slate-900">1 : 4.2</div>
                                <p className="text-[10px] text-indigo-400 font-bold mt-1">Provider per Active Patients</p>
                             </div>
                             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Efficiency</div>
                                <div className="text-2xl font-black text-slate-900">94.8%</div>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Resource Utilization Score</p>
                             </div>
                          </div>
                       </div>
                       <div className="glass-card p-10 bg-white border-l-8 border-rose-600">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">System Alerts</h3>
                          <div className="space-y-4">
                             <div className="flex gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                                <p className="text-xs font-bold text-rose-900 leading-relaxed">Infrastructure warning: ICU overflow imminent. Predicted surge in 2 hours.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'revenue' && (
               <div className="space-y-10 animate-in slide-in-from-right duration-500">
                  <div className="flex justify-between items-center">
                     <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revenue Advisor</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Enterprise Billing & Claim Intelligence</p>
                     </div>
                     <button 
                       onClick={handleDownloadReport}
                       className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-3">
                        <Banknote size={20} /> Generate Revenue Report
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[
                        { label: 'Gross Revenue', value: '$124,500', trend: '+18.2%', icon: <ArrowUpRight className="text-emerald-500" /> },
                        { label: 'Outstanding Claims', value: '$12,400', trend: '-2.4%', icon: <ArrowDownLeft className="text-rose-500" /> },
                        { label: 'Avg Collection Value', value: '$840', trend: 'Stable', icon: <Briefcase className="text-indigo-500" /> }
                     ].map((stat, i) => (
                        <div key={i} className="glass-card p-10 bg-white shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h4>
                              <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
                           </div>
                           <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                           <p className="text-[10px] font-bold text-slate-400 italic">30-day rolling aggregate</p>
                        </div>
                     ))}
                  </div>

                  <div className="glass-card p-10 bg-white">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Live Transaction Feed</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                 <th className="pb-6">Service Type</th>
                                 <th className="pb-6">Amount</th>
                                 <th className="pb-6 text-center">Status</th>
                                 <th className="pb-6 text-right">Timestamp</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {billingData.map((bill, i) => (
                                 <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-6 font-black text-slate-900">{bill.service_type}</td>
                                    <td className="py-6 font-black text-slate-900">${bill.amount}</td>
                                    <td className="py-6 text-center">
                                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                          bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                          bill.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                          'bg-indigo-50 text-indigo-600 border-indigo-100'
                                       }`}>
                                          {bill.status}
                                       </span>
                                    </td>
                                    <td className="py-6 text-right font-bold text-slate-400 text-xs italic">
                                       {new Date(bill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Medicine Stock Advisor</h2>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Predictive supply chain management</p>
                    </div>
                    <button 
                       onClick={() => setShowBatchModal(true)}
                       className="px-8 py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-100 flex items-center gap-3 hover:bg-teal-700 transition-all">
                       <Package size={20} /> Place Batch Order ({lowStockMeds.length} items)
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {inventory.map((item, i) => {
                      const daysLeft = Math.floor(item.stock_count / (item.daily_burn_rate || 5));
                      const isCritical = daysLeft < 5;
                      
                      return (
                        <div key={i} className={`glass-card p-10 bg-white border-t-8 ${isCritical ? 'border-rose-500' : 'border-teal-500'} shadow-sm`}>
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medication</p>
                              <h4 className="text-xl font-black text-slate-900">{item.medicine_name}</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${isCritical ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                              {isCritical ? 'CRITICAL' : 'OPTIMAL'}
                            </span>
                          </div>
                          
                          <div className="mb-8">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                              <span className="text-slate-400">Current Stock</span>
                              <span className="text-slate-900">{item.stock_count} units</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${isCritical ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (item.stock_count/1000)*100)}%` }}></div>
                            </div>
                          </div>

                          <div className={`p-6 rounded-2xl flex flex-col items-center text-center ${isCritical ? 'bg-rose-50' : 'bg-slate-50'}`}>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Prediction</p>
                             <div className={`text-2xl font-black ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>
                                ~{daysLeft} Days Left
                             </div>
                             <p className="text-[10px] font-bold text-slate-500 italic mt-2">Predicted based on historical surge data</p>
                          </div>
                        </div>
                      );
                    })}
                    
                    <button className="glass-card p-10 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-400 hover:bg-white transition-all">
                       <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:rotate-12 transition-all">
                          <FlaskConical size={32} className="text-indigo-600" />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Add Category</p>
                    </button>
                 </div>
              </div>
            )}

            {activeTab === 'simulation' && (
               <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                 <div className="bg-indigo-600 rounded-[2.5rem] p-12 mb-12 flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-indigo-100 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md">
                       <TrendingUp className="text-white w-12 h-12" />
                    </div>
                    <div className="relative z-10 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Financial Impact Forecasting</h2>
                          <p className="text-indigo-100 font-medium text-lg leading-relaxed mt-2 opacity-90 max-w-2xl">
                            ERNova predicts a potential revenue loss of <strong>$145,500</strong> this shift if clinical workflows are not optimized to meet the simulated Winter Outbreak surge.
                          </p>
                        </div>
                        <div className="bg-white/20 px-6 py-4 rounded-3xl text-center backdrop-blur">
                            <span className="block text-[8px] font-black text-white uppercase tracking-widest mb-1">Predicted Loss</span>
                            <span className="text-3xl font-black text-rose-300">-$145.5k</span>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <div className="rounded-3xl border-2 border-slate-100 p-8 bg-white shadow-2xl shadow-slate-200">
                    <SimulationDashboard />
                 </div>
               </div>
            )}

          </main>
        )}
      </div>

      {/* Batch Order Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Package size={20} className="text-teal-600" /> Batch Restock Order</h2>
              <button onClick={() => setShowBatchModal(false)} className="p-2 text-slate-400 hover:text-slate-900 text-xl">✕</button>
            </div>
            {lowStockMeds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-bold">All stock levels are adequate. No restock needed! ✅</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">The following <strong>{lowStockMeds.length} medicines</strong> are below reorder level and will be restocked to <strong>100 units</strong>:</p>
                <div className="space-y-2">
                  {lowStockMeds.map((med, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-rose-50 rounded-xl border border-rose-100">
                      <div>
                        <p className="font-bold text-slate-900">{med.medicine_name}</p>
                        <p className="text-xs text-rose-600 font-bold">Current: {med.stock_count} units (Reorder at: {med.reorder_level})</p>
                      </div>
                      <span className="text-lg font-black text-teal-600">→ 100</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleBatchRestock}
                  disabled={restocking}
                  className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {restocking ? <Activity size={16} className="animate-spin" /> : <Package size={16} />}
                  Confirm Restock ({lowStockMeds.length} items)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
