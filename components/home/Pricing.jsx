"use client";
import { Button } from "@/components/ui/button";
import Section from "@/components/ui/Section";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { usePayment } from "@/app/contexts/PaymentContext";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";

export default function Pricing({ onBuy }) {
  const included = [
    "Lifetime online reading access",
    "All 10 chapters — full ebook",
    "Read on any device",
    "Reading progress tracking",
    "Page navigation + zoom",
    "Future edition updates",
  ];
  const { openPayment } = usePayment();
  return (
    <Section
      id='pricing'
      eyebrow='Pricing'
      title='One price. Lifetime access.'
      subtitle='No subscriptions. No add-ons. Just the entire book, forever.'
      className='text-center'
    >
      <div className='max-w-lg mx-auto'>
        <Card className='border-2 border-indigo-500 shadow-xl relative overflow-hidden'>
          <div className='absolute top-0 right-0 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-bl-lg'>
            BEST VALUE
          </div>
          <CardHeader className='pb-4'>
            <CardTitle className='text-2xl'>Lifetime Access</CardTitle>
            <CardDescription>
              The complete Matrix Structural Analysis ebook
            </CardDescription>
            <div className='pt-4'>
              <span className='text-5xl font-bold'>₹149</span>
              <span className='text-muted-foreground ml-2'>one-time</span>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {included.map((i) => (
              <div key={i} className='flex items-center gap-2 text-sm'>
                <CheckCircle2 className='h-4 w-4 text-emerald-600 flex-shrink-0' />
                <span>{i}</span>
              </div>
            ))}
            <Button
              className='w-full h-12 mt-4 text-base'
              size='lg'
              onClick={() => openPayment(onBuy)}
            >
              Buy Ebook Now <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
            <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2'>
              <Lock className='h-3 w-3' /> Secure payment via Razorpay
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
