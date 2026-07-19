"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout as logoutUser } from "@/services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const data = await getCurrentUser();
      setMe(data.user || null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await logoutUser();
    setMe(null);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        me,
        setMe,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
