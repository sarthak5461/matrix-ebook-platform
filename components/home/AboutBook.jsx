"use client";

import Section from "@/components/ui/section";

export default function AboutBook() {
  const chapters = [
    "Introduction to Matrix Structural Analysis",
    "Skeletal Structures",
    "Stiffness Matrix Method",
    "Element Analysis",
    "Structural Dynamics",
    "Stability of Structures",
    "Degree(s) Of Freedom",
    "Computer Implementation",
    "Case Studies",
    "Advanced Topics",
  ];
  return (
    <Section
      id='about-book'
      eyebrow='About the Book'
      title='A structured path from fundamentals to advanced topics.'
      subtitle='10 comprehensive chapters covering everything from matrix algebra to computer implementation.'
    >
      <div className='grid md:grid-cols-2 gap-3'>
        {chapters.map((c, i) => (
          <div
            key={c}
            className='flex items-center gap-3 p-4 rounded-lg border bg-card hover:border-indigo-300 transition'
          >
            <div className='h-8 w-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold'>
              {i + 1}
            </div>
            <div className='font-medium'>{c}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
