"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth.service";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { me, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!me) {
        router.replace("/login?next=/admin");
        return;
      }

      if (me.role !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [loading, me, router]);

  const handleLogout = async () => {
    await logout();
    window.location.replace("/");
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    return null;
  }

  return (
    <div className='flex min-h-screen bg-slate-50'>
      <AdminSidebar />

      <div className='flex-1 flex flex-col'>
        <AdminHeader onLogout={handleLogout} />

        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}
