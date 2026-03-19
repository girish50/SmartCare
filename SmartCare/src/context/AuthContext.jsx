import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// Read auth from localStorage synchronously (no useEffect delay)
function getStoredAuth() {
  try {
    const saved = localStorage.getItem('smartcare_auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.user && parsed.role) {
        return { user: parsed.user, role: parsed.role };
      }
    }
  } catch {}
  return { user: null, role: null };
}

export function AuthProvider({ children }) {
  // Initialize state synchronously from localStorage — no loading delay
  const stored = getStoredAuth();
  const [user, setUser] = useState(stored.user);
  const [role, setRole] = useState(stored.role);

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

  const value = { user, role, login, logout, canAccess };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
