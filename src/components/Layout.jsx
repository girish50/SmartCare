import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, Menu, X, Home, UserPlus, Users, ClipboardList, 
  Settings, ShoppingCart, Activity, ChevronDown, Shield, LogIn, LogOut, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, role, logout, canAccess } = useAuth();

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

  // Close on route change
  useEffect(() => {
    setStaffOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define staff links based on role
  const allStaffLinks = [
    { to: '/patient', label: 'Patient Portal', icon: <Users size={16} />, desc: 'View records & QR codes', page: 'patient' },
    { to: '/reception', label: 'Reception Desk', icon: <ClipboardList size={16} />, desc: 'Check-in & AI triage', page: 'reception' },
    { to: '/doctor', label: 'Doctor Console', icon: <Stethoscope size={16} />, desc: 'Queue & consultations', page: 'doctor' },
    { to: '/admin', label: 'Admin Command', icon: <Settings size={16} />, desc: 'Operations & analytics', page: 'admin' },
    { to: '/pharmacy', label: 'Smart Pharmacy', icon: <ShoppingCart size={16} />, desc: 'Inventory & dispensing', page: 'pharmacy' },
  ];

  // Filter staff links by role
  const staffLinks = allStaffLinks.filter(link => canAccess(link.page));
  const isStaffPage = allStaffLinks.some(l => l.to === location.pathname);

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
              <Link to="/" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}>
                <Home size={15} /> Home
              </Link>
              <Link to="/register" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/register') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}>
                <UserPlus size={15} /> Register
              </Link>
              <Link to="/stats" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/stats') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}>
                <Activity size={15} /> Live Stats
              </Link>
              
              {/* Staff Access Dropdown (only if user has access to any staff pages) */}
              {staffLinks.length > 0 && (
                <div ref={dropdownRef} className="relative">
                  <button 
                    onClick={() => setStaffOpen(!staffOpen)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      isStaffPage ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Shield size={15} /> Staff Access 
                    <ChevronDown size={13} className={`transition-transform duration-200 ${staffOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {staffOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-2 z-[100]">
                      {staffLinks.map((link) => (
                        <Link key={link.to} to={link.to}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive(link.to) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                          }`}>
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
              )}

              {/* Auth Button */}
              {user ? (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <User size={12} /> {user.name?.split(' ')[0]} <span className="text-indigo-600 uppercase text-[8px] font-black tracking-widest">({role})</span>
                  </span>
                  <button onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all ml-2">
                  <LogIn size={15} /> Login
                </Link>
              )}
            </nav>

            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-600 hover:text-slate-900">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}><Home size={15} /> Home</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${isActive('/register') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}><UserPlus size={15} /> Register</Link>
              <Link to="/stats" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${isActive('/stats') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}><Activity size={15} /> Live Stats</Link>
              
              {staffLinks.length > 0 && (
                <div className="pt-2 border-t border-slate-100 mt-2">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Access</p>
                  {staffLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${isActive(link.to) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
                      {link.icon} {link.label}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="pt-2 border-t border-slate-100 mt-2">
                {user ? (
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-600 w-full">
                    <LogOut size={15} /> Logout ({user.name?.split(' ')[0]})
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-indigo-600">
                    <LogIn size={15} /> Login
                  </Link>
                )}
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
