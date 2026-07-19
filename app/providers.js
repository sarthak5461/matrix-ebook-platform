"use client";

// Client-only context wrapper. QueryClient is created once at module load.

import { QueryClient } from "@tanstack/react-query";
import { PaymentProvider } from "@/app/contexts/PaymentContext";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }) {
  return (
    <AuthProvider>
      <PaymentProvider>{children}</PaymentProvider>
    </AuthProvider>
  );
}
