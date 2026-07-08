"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, Lock } from "lucide-react";

export default function ReaderHeader({ title, page, pageCount, progress }) {
  return (
    <header className='border-b border-slate-800 bg-slate-950 sticky top-0 z-40'>
      <div className='container h-14 flex items-center justify-between gap-4'>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 font-semibold'
        >
          <div className='h-7 w-7 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center'>
            <BookOpen className='h-4 w-4 text-white' />
          </div>

          <span className='hidden sm:inline'>{title}</span>
        </Link>

        <div className='flex items-center gap-2 text-sm text-slate-300'>
          <Lock className='h-3.5 w-3.5' />
          <span className='hidden md:inline'>Secure reading mode</span>
        </div>

        <Link href='/dashboard'>
          <Button
            size='sm'
            variant='outline'
            className='bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800'
          >
            <Home className='h-4 w-4' />
          </Button>
        </Link>
      </div>

      <div className='container pb-2'>
        <div className='flex items-center gap-3'>
          <div className='text-xs text-slate-400 tabular-nums'>
            Page {page} / {pageCount || "—"}
          </div>

          <Progress value={progress} className='h-1.5 flex-1 bg-slate-800' />

          <div className='text-xs text-slate-400 tabular-nums w-10 text-right'>
            {progress}%
          </div>
        </div>
      </div>
    </header>
  );
}
