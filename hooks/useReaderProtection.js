"use client";

import { useEffect } from "react";

export function useReaderProtection() {
  useEffect(() => {
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const keyboardHandler = (e) => {
      const key = (e.key || "").toLowerCase();

      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(key)) {
        prevent(e);
      }

      if (key === "printscreen") {
        navigator.clipboard?.writeText("").catch(() => {});
      }
    };

    document.addEventListener("contextmenu", prevent);
    document.addEventListener("keydown", keyboardHandler);
    document.addEventListener("dragstart", prevent);

    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", keyboardHandler);
      document.removeEventListener("dragstart", prevent);
    };
  }, []);
}
