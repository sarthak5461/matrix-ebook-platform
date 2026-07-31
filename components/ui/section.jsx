"use client";

export default function Section({ id, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className='container py-10 md:py-18'>
      <div className='max-w-2xl mb-12'>
        {eyebrow && (
          <div className='text-sm font-medium text-indigo-600 uppercase tracking-wider mb-2'>
            {eyebrow}
          </div>
        )}
        <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
          {title}
        </h2>
        {subtitle && (
          <p className='mt-3 text-muted-foreground text-lg'>{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}
