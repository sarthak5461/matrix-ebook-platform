"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth.service";

export function useAuth() {
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

  useEffect(() => {
    refreshUser();
  }, []);

  return {
    me,
    setMe,
    loading,
    refreshUser,
  };
}
