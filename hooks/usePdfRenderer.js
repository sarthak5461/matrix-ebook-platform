"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export function usePdfRenderer({ canvasRef, pdfjsLib, scale, setRendering }) {
  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfjsLib || !canvasRef.current) return;

      setRendering(true);

      try {
        const res = await fetch(`/api/reader/page/${pageNum}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load page");
        }

        const buf = await res.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
          data: buf,
        });

        const pdf = await loadingTask.promise;

        const p = await pdf.getPage(1);

        const viewport = p.getViewport({
          scale,
        });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const dpr = window.devicePixelRatio || 1;

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;

        canvas.style.width = viewport.width + "px";
        canvas.style.height = viewport.height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        await p.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        localStorage.setItem("msa_last_page", String(pageNum));
      } catch (e) {
        toast.error(e.message);
      } finally {
        setRendering(false);
      }
    },
    [canvasRef, pdfjsLib, scale, setRendering],
  );

  return {
    renderPage,
  };
}
