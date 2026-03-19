import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'patient', 'staff', 'doctor', 'admin'
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartcare_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setRole(parsed.role);
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('smartcare_auth', JSON.stringify({ user: userData, role: userRole }));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('smartcare_auth');
  };

  // Check if current role can access a specific page
  const canAccess = (page) => {
    if (!role) {
      // Public pages accessible without login
      return ['home', 'register', 'stats', 'emergency'].includes(page);
    }
    
    const access = {
      patient: ['home', 'register', 'stats', 'emergency', 'patient'],
      staff: ['home', 'register', 'stats', 'emergency', 'reception', 'pharmacy'],
      doctor: ['home', 'register', 'stats', 'emergency', 'doctor'],
      admin: ['home', 'register', 'stats', 'emergency', 'patient', 'reception', 'doctor', 'admin', 'pharmacy'],
    };

    return access[role]?.includes(page) || false;
  };

  const value = { user, role, loading, login, logout, canAccess };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
