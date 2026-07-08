"use client";

// Client-only context wrapper. QueryClient is created once at module load.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaymentProvider } from "@/app/contexts/PaymentContext";
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
    <QueryClientProvider client={queryClient}>
      <PaymentProvider>{children}</PaymentProvider>
    </QueryClientProvider>
  );
}
