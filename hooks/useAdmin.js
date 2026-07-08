"use client";

import { useEffect, useState } from "react";

import { getStats, getUsers, getPurchases } from "@/services/admin.service";

export function useAdmin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [stats, users, purchases] = await Promise.all([
      getStats(),
      getUsers(),
      getPurchases(),
    ]);

    setStats(stats);
    setUsers(users.users || []);
    setPurchases(purchases.purchases || []);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadAll();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  return {
    stats,
    users,
    purchases,
    loading,
    loadAll,
  };
}
