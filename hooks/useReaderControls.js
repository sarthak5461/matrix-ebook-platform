"use client";

import { useState } from "react";

export function useReaderControls(pageCount) {
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.3);

  const goPrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const goNext = () => {
    setPage((p) => Math.min(pageCount || 1, p + 1));
  };

  const zoomIn = () => {
    setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)));
  };

  const zoomOut = () => {
    setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)));
  };

  return {
    page,
    setPage,
    scale,
    setScale,
    goPrev,
    goNext,
    zoomIn,
    zoomOut,
  };
}
