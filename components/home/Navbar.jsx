"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { BookOpen, Menu, X } from "lucide-react";

export default function Nav({ me, onBuy, onLogout }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const nav = [
    { href: "#about-book", label: "About Book" },
    { href: "#benefits", label: "Benefits" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className='sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg'>
      <div className='container flex h-16 items-center justify-between'>
        <Link href='/' className='flex items-center gap-2 font-bold text-lg'>
          <div className='h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center'>
            <BookOpen className='h-5 w-5 text-white' />
          </div>
          <span>
            Matrix<span className='text-indigo-600'>SA</span>
          </span>
        </Link>
        <nav className='hidden md:flex items-center gap-7 text-sm text-muted-foreground'>
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className='hover:text-foreground transition'
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className='hidden md:flex items-center gap-2'>
          {me ? (
            <>
              {me.role === "admin" && (
                <Link href='/admin'>
                  <Button variant='ghost' size='sm'>
                    Admin
                  </Button>
                </Link>
              )}
              <Link href='/dashboard'>
                <Button variant='ghost' size='sm'>
                  Dashboard
                </Button>
              </Link>
              {me.purchasedBook ? (
                <Link href='/reader'>
                  <Button size='sm'>
                    <BookOpen className='h-4 w-4 mr-1' />
                    Read
                  </Button>
                </Link>
              ) : (
                <Button size='sm' onClick={() => handleBuy(me, router)}>
                  Buy Ebook
                </Button>
              )}
              <Button variant='outline' size='sm' onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href='/login'>
                <Button variant='ghost' size='sm'>
                  Login
                </Button>
              </Link>
              <Link href='/register'>
                <Button variant='outline' size='sm'>
                  Register
                </Button>
              </Link>
              <Button size='sm' onClick={onBuy}>
                Buy Ebook
              </Button>
            </>
          )}
        </div>
        <button
          className='md:hidden p-2'
          onClick={() => setOpen(!open)}
          aria-label='Menu'
        >
          {open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
        </button>
      </div>
      {open && (
        <div className='md:hidden border-t border-border/40 bg-background'>
          <div className='container py-4 flex flex-col gap-3'>
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className='text-muted-foreground py-1'
              >
                {n.label}
              </a>
            ))}
            <div className='flex flex-col gap-2 pt-3 border-t border-border/40'>
              {me ? (
                <>
                  {me.role === "admin" && (
                    <Link href='/admin'>
                      <Button variant='ghost' className='w-full justify-start'>
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href='/dashboard'>
                    <Button variant='ghost' className='w-full justify-start'>
                      Dashboard
                    </Button>
                  </Link>
                  {me.purchasedBook ? (
                    <Link href='/reader'>
                      <Button className='w-full'>Read Ebook</Button>
                    </Link>
                  ) : (
                    <Button className='w-full' onClick={onBuy}>
                      Buy Ebook
                    </Button>
                  )}
                  <Button variant='outline' onClick={onLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href='/login'>
                    <Button variant='ghost' className='w-full'>
                      Login
                    </Button>
                  </Link>
                  <Link href='/register'>
                    <Button variant='outline' className='w-full'>
                      Register
                    </Button>
                  </Link>
                  <Button
                    className='w-full'
                    onClick={() => handleBuy(me, router)}
                  >
                    Buy Ebook
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
