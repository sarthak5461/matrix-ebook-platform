"use client";

import { createContext, useContext, useMemo, useState } from "react";
import PaymentDialog from "@/components/payments/PaymentDialog";

const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // We will inject this later
  const [onConfirm, setOnConfirm] = useState(null);

  const openPayment = (callback) => {
    setOnConfirm(() => callback);
    setOpen(true);
  };

  const closePayment = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    if (!onConfirm) return;

    try {
      setLoading(true);

      await onConfirm();

      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      openPayment,
      closePayment,
      loading,
    }),
    [loading],
  );

  return (
    <PaymentContext.Provider value={value}>
      {children}

      <PaymentDialog
        open={open}
        onOpenChange={setOpen}
        amount={149}
        loading={loading}
        onConfirm={handleConfirm}
      />
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error("usePayment must be used inside PaymentProvider");
  }

  return context;
}
