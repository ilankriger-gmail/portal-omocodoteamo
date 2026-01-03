"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  Settings,
  Users,
  HelpCircle,
} from "lucide-react";

// Simplified version of the menu for mobile
const mobileMenuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vaquinhas", label: "Vaquinhas", icon: Heart },
  { href: "/admin/usuarios", label: "Admins", icon: Users },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/config", label: "Config", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 h-16 grid grid-cols-5 items-center z-50">
      {mobileMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center h-full ${
              isActive ? "text-red-500" : "text-zinc-400"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}