"use client";

import Section from "@/components/ui/Section";

import {
  BookOpen,
  ShieldCheck,
  Infinity as InfIcon,
  GraduationCap,
  LineChart,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Benefits() {
  const items = [
    {
      icon: BookOpen,
      title: "Read Anywhere",
      desc: "Access the book from any device — desktop, tablet, or mobile — with a responsive reader.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Access",
      desc: "Your purchase is tied to your account. The PDF stays on our servers, never downloaded.",
    },
    {
      icon: InfIcon,
      title: "Lifetime License",
      desc: "Buy once, read forever. No subscriptions, no expiry, no hidden fees.",
    },
    {
      icon: GraduationCap,
      title: "Exam Ready",
      desc: "Perfectly structured for GATE, university coursework, and professional practice.",
    },
    {
      icon: LineChart,
      title: "Track Progress",
      desc: "The reader remembers your last page and shows your reading progress.",
    },
    {
      icon: Sparkles,
      title: "Modern Reader",
      desc: "Zoom, page navigation, and a distraction-free interface — built for engineers.",
    },
  ];
  return (
    <Section
      id='benefits'
      eyebrow='Benefits'
      title='Why engineers choose this ebook'
      subtitle='Everything you need to master the subject — in one polished digital experience.'
    >
      <div className='grid md:grid-cols-3 gap-5'>
        {items.map(({ icon: Icon, title, desc }) => (
          <Card
            key={title}
            className='border-border/60 hover:border-indigo-300 hover:shadow-md transition'
          >
            <CardHeader>
              <div className='h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2'>
                <Icon className='h-5 w-5' />
              </div>
              <CardTitle className='text-lg'>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-sm leading-relaxed'>
                {desc}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
