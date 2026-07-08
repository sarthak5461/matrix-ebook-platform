"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, BookOpen, CheckCircle2 } from "lucide-react";

export default function PaymentDialog({
  open,
  onOpenChange,
  amount,
  loading = false,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-2xl'>
            <ShieldCheck className='h-6 w-6 text-green-600' />
            Secure Payment
          </DialogTitle>

          <DialogDescription>
            Complete your purchase to unlock lifetime access.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-2'>
          {/* Book */}
          <div className='rounded-xl border p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-lg'>
                  Matrix Structural Analysis
                </h3>

                <p className='text-sm text-muted-foreground'>
                  By Dr. R. K. Sharma
                </p>
              </div>

              <BookOpen className='h-8 w-8 text-indigo-600' />
            </div>

            <div className='mt-5 flex items-center justify-between'>
              <Badge variant='secondary'>Lifetime Access</Badge>

              <span className='text-3xl font-bold'>₹{amount}</span>
            </div>
          </div>

          {/* Features */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span>Unlimited online reading</span>
            </div>

            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span>Lifetime access</span>
            </div>

            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span>Future book updates included</span>
            </div>

            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span>Secure payment</span>
            </div>
          </div>

          {/* Footer */}
          <div className='flex justify-end gap-3 pt-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={onConfirm}
              disabled={loading}
              className='min-w-[150px]'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
