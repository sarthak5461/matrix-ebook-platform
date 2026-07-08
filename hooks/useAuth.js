"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth.service";

export function useAuth() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();

        setMe(data.user || null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return {
    me,
    setMe,
    loading,
  };
}
