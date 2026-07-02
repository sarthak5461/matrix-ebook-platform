"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className='border-t border-border/40 bg-slate-950 text-slate-300 mt-10'>
      <div className='container py-12 grid md:grid-cols-4 gap-8'>
        <div className='md:col-span-2'>
          <div className='flex items-center gap-2 font-bold text-lg text-white'>
            <div className='h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center'>
              <BookOpen className='h-5 w-5 text-white' />
            </div>
            MatrixSA
          </div>
          <p className='text-sm text-slate-400 mt-3 max-w-md'>
            The definitive digital ebook on Matrix Structural Analysis. Lifetime
            reading access.
          </p>
        </div>
        <div>
          <div className='font-semibold text-white mb-3'>Product</div>
          <div className='space-y-2 text-sm'>
            <a href='#about-book' className='block hover:text-white'>
              About the Book
            </a>
            <a href='#pricing' className='block hover:text-white'>
              Pricing
            </a>
          </div>
        </div>
        <div>
          <div className='font-semibold text-white mb-3'>Account</div>
          <div className='space-y-2 text-sm'>
            <Link href='/login' className='block hover:text-white'>
              Login
            </Link>
            <Link href='/register' className='block hover:text-white'>
              Register
            </Link>
          </div>
        </div>
      </div>
      <div className='border-t border-slate-800'>
        <div className='container py-5 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2'>
          <div>
            © {new Date().getFullYear()} Matrix Structural Analysis. All rights
            reserved.
          </div>
          <div>Ebook copyrighted • Redistribution prohibited</div>
        </div>
      </div>
    </footer>
  );
}
