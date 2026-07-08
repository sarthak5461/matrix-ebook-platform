"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  Settings,
} from "lucide-react";

const links = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Purchases",
    href: "/admin/purchases",
    icon: CreditCard,
  },
  {
    title: "Ebook",
    href: "/admin/ebook",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className='w-64 border-r bg-white h-screen'>
      <div className='h-16 border-b flex items-center px-6'>
        <h2 className='text-xl font-bold'>
          Matrix<span className='text-indigo-600'>SA</span>
        </h2>
      </div>

      <nav className='p-4 space-y-2'>
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition
                ${
                  pathname === link.href
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
            >
              <Icon size={18} />
              {link.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
