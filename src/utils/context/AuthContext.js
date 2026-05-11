"use client";
import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext({ user: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const user = session?.user || null;
  const loading = status === 'loading';
  const sessionLoadedRef = useRef(false);

  // İlk yüklemede oturum varsa bilgilendir (bir kez)
  useEffect(() => {
    if (!loading && user && !sessionLoadedRef.current) {
      sessionLoadedRef.current = true;
    }
  }, [user, loading]);

  // Context value'yu memoize et - gereksiz re-render'ları engelle
  const contextValue = useMemo(() => ({
    user,
    loading,
    setUser: () => {}
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
