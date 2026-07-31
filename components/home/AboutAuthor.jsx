"use client";

import Section from "@/components/ui/Section";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

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
            <div className='h-50 w-50 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold mb-4'>
              <Image
                src='/images/parmod-kumar.jpeg'
                alt='Matrix Structural Analysis'
                width={150}
                height={150}
              />
            </div>
            <div className='font-semibold text-lg'>Dr. R. K. Sharma</div>
            <div className='text-sm text-muted-foreground'>
              Ph.D., Structural Engineering
            </div>
          </CardContent>
        </Card>
        <div className='md:col-span-2 space-y-4 text-muted-foreground leading-relaxed'>
          <p>
            Dr. Pramod K. Singh worked as Professor & Head, and Institute
            Professor in the Department of Civil Engineering, Indian Institute
            of Technology (BHU), Varanasi, India. He taught Matrix Structural
            Analysis to undergraduate, postgraduate and pre-PhD students for
            more than three decades.
          </p>
          <p>
            He has developed the subject presentation in a unified and
            simplified form given in the book with the main computer application
            objective, which is very much liked by the students. He did his
            B.Sc. (Civil and Municipal Engineering), M.Sc. (Structures), and
            Ph.D. (Cable-Stayed Bridges) from the same institute. He has guided
            3 PhD and 24 M.Tech. dissertations. He has published 62 research
            papers and received 4 best paper awards. He is a fellow / life
            member of four national professional bodies.
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
