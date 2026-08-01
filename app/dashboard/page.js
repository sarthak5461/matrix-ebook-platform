"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/app/contexts/PaymentContext";
import { handleBuy } from "@/services/payment.service";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AccountCard from "@/components/dashboard/AccountCard";
import BookCard from "@/components/dashboard/BookCard";
import { logout } from "@/services/auth.service";

export default function Dashboard() {
  const { openPayment } = usePayment();
  const router = useRouter();
  const { me, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    if (!loggingOut && !loading && !me) {
      router.replace("/login?next=/dashboard");
    }
  }, [loggingOut, loading, me, router]);

  const buy = () => {
    if (!me) return;
    handleBuy(me, router);
  };

  const handleLogout = async () => {
    await logout();

    window.location.replace("/");
  };

  if (loading || !me) {
    return (
      <div className='min-h-screen flex items-center justify-center text-muted-foreground'>
        Loading...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <DashboardHeader me={me} onLogout={handleLogout} />

      <main className='container py-10'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Hello, {me?.name}!</h1>
          <p className='text-muted-foreground'>
            Manage your account and access your ebook.
          </p>
        </div>
        <div className='grid md:grid-cols-3 gap-6'>
          <AccountCard me={me} />

          <BookCard me={me} onBuy={() => openPayment(buy)} />
        </div>
      </main>
    </div>
  );
}
