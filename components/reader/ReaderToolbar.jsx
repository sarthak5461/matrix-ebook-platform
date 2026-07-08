"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function ReaderToolbar({
  page,
  pageCount,
  scale,
  goPrev,
  goNext,
  zoomIn,
  zoomOut,
}) {
  return (
    <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50'>
      <div className='flex items-center gap-1 bg-slate-950/95 border border-slate-800 rounded-full px-2 py-2 shadow-xl backdrop-blur'>
        <Button
          size='sm'
          variant='ghost'
          onClick={goPrev}
          disabled={page <= 1}
          className='text-white hover:bg-slate-800 rounded-full'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <div className='px-3 text-sm tabular-nums text-slate-200'>
          {page} / {pageCount || "—"}
        </div>

        <Button
          size='sm'
          variant='ghost'
          onClick={goNext}
          disabled={page >= (pageCount || 1)}
          className='text-white hover:bg-slate-800 rounded-full'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>

        <div className='w-px h-6 bg-slate-800 mx-1' />

        <Button
          size='sm'
          variant='ghost'
          onClick={zoomOut}
          className='text-white hover:bg-slate-800 rounded-full'
        >
          <ZoomOut className='h-4 w-4' />
        </Button>

        <div className='px-2 text-xs tabular-nums text-slate-300 w-14 text-center'>
          {Math.round(scale * 100)}%
        </div>

        <Button
          size='sm'
          variant='ghost'
          onClick={zoomIn}
          className='text-white hover:bg-slate-800 rounded-full'
        >
          <ZoomIn className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
