import { Loader2, Lock } from "lucide-react";

export default function ReaderCanvas({ canvasRef, containerRef, rendering }) {
  return (
    <main ref={containerRef} className='flex flex-col items-center py-6 px-4'>
      <div className='relative rounded-lg bg-white shadow-2xl overflow-hidden'>
        <canvas ref={canvasRef} className='block' />
        {rendering && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/60 text-slate-700'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        )}
        {/* transparent overlay to make it harder to right-click / drag the canvas */}
        <div
          className='absolute inset-0'
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      <div className='text-xs text-slate-500 mt-3 flex items-center gap-1'>
        <Lock className='h-3 w-3' /> Copyrighted content — online reading only.
        No download / print / save permitted.
      </div>
    </main>
  );
}
