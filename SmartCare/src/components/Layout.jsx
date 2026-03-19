import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Stethoscope, 
  Menu, 
  X, 
  Home, 
  UserPlus, 
  Users, 
  ClipboardList, 
  Settings, 
  ShoppingCart, 
  Activity, 
  ChevronDown,
  Shield
} from 'lucide-react';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStaffOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setStaffOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const mainLinks = [
    { to: '/', label: 'Home', icon: <Home size={15} /> },
    { to: '/register', label: 'Register', icon: <UserPlus size={15} /> },
    { to: '/stats', label: 'Live Stats', icon: <Activity size={15} /> },
  ];

  const staffLinks = [
    { to: '/patient', label: 'Patient Portal', icon: <Users size={16} />, desc: 'View records & QR codes' },
    { to: '/reception', label: 'Reception Desk', icon: <ClipboardList size={16} />, desc: 'Check-in & AI triage' },
    { to: '/doctor', label: 'Doctor Console', icon: <Stethoscope size={16} />, desc: 'Queue & consultations' },
    { to: '/admin', label: 'Admin Command', icon: <Settings size={16} />, desc: 'Operations & analytics' },
    { to: '/pharmacy', label: 'Smart Pharmacy', icon: <ShoppingCart size={16} />, desc: 'Inventory & dispensing' },
  ];

  const isStaffPage = ['/patient','/reception','/doctor','/admin','/pharmacy'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary font-sans">
      <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-all">
                <Stethoscope className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-900">
                Smart<span className="text-indigo-600">Care</span>
              </span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive(link.to) 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              
              {/* Staff Access Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button 
                  onClick={() => setStaffOpen(!staffOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isStaffPage
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield size={15} /> Staff Access 
                  <ChevronDown size={13} className={`transition-transform duration-200 ${staffOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {staffOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-2 z-[100]">
                    {staffLinks.map((link) => (
                      <Link 
                        key={link.to} 
                        to={link.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive(link.to) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive(link.to) ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                          {link.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{link.label}</div>
                          <div className="text-[10px] text-slate-400">{link.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {mainLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
                    isActive(link.to) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >{link.icon} {link.label}</Link>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Access</p>
                {staffLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
                      isActive(link.to) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >{link.icon} {link.label}</Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 w-full pt-14">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-slate-100 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-black text-slate-900">SmartCare Enterprise</span>
          </div>
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} SmartCare. AI-Powered Hospital Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}
