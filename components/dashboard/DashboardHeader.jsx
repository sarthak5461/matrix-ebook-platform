"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, LogOut } from "lucide-react";

export default function DashboardHeader({ me, onLogout }) {
  return (
    <header className='border-b bg-white'>
      <div className='container h-16 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2 font-bold'>
          <div className='h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center'>
            <BookOpen className='h-4 w-4 text-white' />
          </div>
          MatrixSA
        </Link>

        <div className='flex items-center gap-2'>
          <Link href='/'>
            <Button variant='ghost' size='sm'>
              <Home className='h-4 w-4 mr-1' />
              Home
            </Button>
          </Link>

          {me?.role === "admin" && (
            <Link href='/admin'>
              <Button variant='ghost' size='sm'>
                Admin
              </Button>
            </Link>
          )}

          <Button variant='outline' size='sm' onClick={onLogout}>
            <LogOut className='h-4 w-4 mr-1' />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
