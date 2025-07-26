"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let firstLoad = true;
    async function checkSession() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(prev => {
              if (!prev && firstLoad) {
                toast.info('Oturumunuz otomatik olarak yüklendi.');
              }
              return data.user;
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
      firstLoad = false;
    }
    checkSession();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
