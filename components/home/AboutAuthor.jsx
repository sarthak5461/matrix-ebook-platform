"use client";

import Section from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutAuthor() {
  return (
    <Section
      id='about-author'
      eyebrow='About the Author'
      title='Dr. R. K. Sharma'
      subtitle='Professor of Structural Engineering with 25+ years of teaching and research experience.'
    >
      <div className='grid md:grid-cols-3 gap-6'>
        <Card className='md:col-span-1'>
          <CardContent className='pt-6 flex flex-col items-center text-center'>
            <div className='h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold mb-4'>
              RS
            </div>
            <div className='font-semibold text-lg'>Dr. R. K. Sharma</div>
            <div className='text-sm text-muted-foreground'>
              Ph.D., Structural Engineering
            </div>
          </CardContent>
        </Card>
        <div className='md:col-span-2 space-y-4 text-muted-foreground leading-relaxed'>
          <p>
            Dr. R. K. Sharma is a distinguished professor and researcher in the
            field of structural engineering. He has authored over 40
            peer-reviewed papers and mentored hundreds of graduate students in
            advanced analysis techniques.
          </p>
          <p>
            His teaching philosophy centers on making complex mathematical
            concepts accessible through worked examples, computer-aided
            illustrations, and industry-grade problem solving. This ebook
            distills two decades of classroom refinement into a single, focused
            resource.
          </p>
          <div className='grid grid-cols-3 gap-4 pt-4'>
            <div>
              <div className='text-2xl font-bold text-foreground'>25+</div>
              <div className='text-xs'>Years experience</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-foreground'>40+</div>
              <div className='text-xs'>Publications</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-foreground'>3000+</div>
              <div className='text-xs'>Students taught</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
