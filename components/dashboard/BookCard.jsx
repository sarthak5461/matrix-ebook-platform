import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function BookCard({ me, onBuy }) {
  return (
    <Card className='md:col-span-2 relative overflow-hidden'>
      {me.purchasedBook ? (
        <>
          <div className='absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl' />
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className='border-emerald-300 bg-emerald-50 text-emerald-700'
              >
                <CheckCircle2 className='h-3 w-3 mr-1' /> Purchased
              </Badge>
              <Badge
                variant='outline'
                className='border-indigo-300 bg-indigo-50 text-indigo-700'
              >
                Lifetime access
              </Badge>
            </div>
            <CardTitle className='text-2xl mt-3'>
              Matrix Structural Analysis
            </CardTitle>
            <CardDescription>
              by Dr. R. K. Sharma • 2025 Edition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              Your reading license is active. The ebook is streamed securely and
              cannot be downloaded, saved, or printed.
            </p>
            <Link href='/reader'>
              <Button size='lg' className='h-11'>
                Read Ebook <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <Badge
              variant='outline'
              className='border-amber-300 bg-amber-50 text-amber-700 w-fit'
            >
              <XCircle className='h-3 w-3 mr-1' /> Not purchased
            </Badge>
            <CardTitle className='text-2xl mt-3'>
              Matrix Structural Analysis
            </CardTitle>
            <CardDescription>Unlock lifetime reading access.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-4xl font-bold mb-1'>₹149</div>
            <p className='text-sm text-muted-foreground mb-4'>
              One-time payment • Lifetime access • Read on any device.
            </p>
            <Button size='lg' className='h-11' onClick={onBuy}>
              Buy Ebook <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </CardContent>
        </>
      )}
    </Card>
  );
}
