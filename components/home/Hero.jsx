"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { ShieldCheck, Infinity as InfIcon, ArrowRight } from "lucide-react";

export default function Hero({ onBuy }) {
  return (
    <section className='relative overflow-hidden'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]' />
      <div className='absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px]' />
      <div className='container py-20 md:py-18 grid lg:grid-cols-2 gap-20 items-center'>
        <div>
          <h1 className='text-4xl md:text-6xl font-bold tracking-tight leading-tight'>
            Master{" "}
            <span className='bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent'>
              Matrix Structural Analysis
            </span>{" "}
          </h1>
          <p className='mt-5 text-lg text-muted-foreground max-w-xl'>
            Innovative, simple, unified & comprehensive eBook in PDF
          </p>
          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <Button size='lg' onClick={onBuy} className='h-12 px-6'>
              Buy Ebook — INR 149 <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
            <a href='#about-book'>
              <Button size='lg' variant='outline' className='h-12 px-6'>
                Learn More
              </Button>
            </a>
          </div>
          <div className='mt-8 flex items-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <ShieldCheck className='h-4 w-4 text-emerald-600' /> Secure online
              reading
            </div>
            <div className='flex items-center gap-2'>
              <InfIcon className='h-4 w-4 text-indigo-600' /> Lifetime access
            </div>
          </div>
        </div>
        <div className='relative flex justify-center items-center'>
          {/* Background Glow */}
          <div className='absolute w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-3xl' />

          {/* Shadow */}
          <div className='absolute bottom-4 w-72 h-8 bg-black/20 blur-xl rounded-full' />

          {/* Book */}
          <div
            className='
    book-float
    relative
    transition-all
    duration-500
    hover:scale-105
  '
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src='/images/matrix-eboook-cover.jpeg'
              alt='Matrix Structural Analysis'
              width={450}
              height={650}
              className='rounded-xl shadow-2xl border border-gray-200'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
