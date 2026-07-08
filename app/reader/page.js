"use client";
import { useEffect, useRef, useState } from "react";
import { useReader } from "@/hooks/useReader";
import { usePdfRenderer } from "@/hooks/usePdfRenderer";
import { useReaderControls } from "@/hooks/useReaderControls";
import ReaderHeader from "@/components/reader/ReaderHeader";
import ReaderToolbar from "@/components/reader/ReaderToolbar";
import ReaderCanvas from "@/components/reader/ReaderCanvas";

import { Loader2 } from "lucide-react";

export default function ReaderPage() {
  const { info, loading, pdfjsLib } = useReader();

  const { page, scale, goPrev, goNext, zoomIn, zoomOut } = useReaderControls(
    info?.pageCount,
  );
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [rendering, setRendering] = useState(false);

  const { renderPage } = usePdfRenderer({
    canvasRef,
    pdfjsLib,
    scale,
    setRendering,
  });

  useEffect(() => {
    if (info) renderPage(page);
  }, [page, scale, info, renderPage]);

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center text-muted-foreground'>
        <Loader2 className='h-5 w-5 mr-2 animate-spin' /> Loading reader...
      </div>
    );

  const progress = info ? Math.round((page / info.pageCount) * 100) : 0;

  return (
    <div
      className='min-h-screen bg-slate-900 text-white select-none'
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      <ReaderHeader
        title={info?.title || "Matrix Structural Analysis"}
        page={page}
        pageCount={info?.pageCount}
        progress={progress}
      />

      <ReaderCanvas
        canvasRef={canvasRef}
        containerRef={containerRef}
        rendering={rendering}
      />

      {/* Bottom control bar */}
      <ReaderToolbar
        page={page}
        pageCount={info?.pageCount}
        scale={scale}
        goPrev={goPrev}
        goNext={goNext}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
      />
    </div>
  );
}
