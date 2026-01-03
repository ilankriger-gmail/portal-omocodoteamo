"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Heart,
  HeartHandshake,
  Sparkles,
  Settings,
  LogOut,
  ExternalLink,
  DollarSign,
  Share2,
  HelpCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vaquinhas", label: "Vaquinhas", icon: Heart },
  { href: "/admin/apoiadas", label: "Apoiadas", icon: HeartHandshake },
  { href: "/admin/inscricoes", label: "Sonhos", icon: Sparkles },
  { href: "/admin/redes", label: "Redes Sociais", icon: Share2 },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/quem-somos", label: "Quem Somos", icon: Users },
  { href: "/admin/usuarios", label: "Administradores", icon: Users },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

const subMenuItems = [
  // Removed "Fontes de Renda" as requested
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Check if we're on a tablet-sized screen and initialize sidebar as collapsed
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside className={`bg-zinc-900 text-white min-h-screen flex flex-col border-r border-zinc-800 transition-all duration-200 ease-in-out ${
      collapsed ? 'w-20 p-2' : 'w-64 p-4'
    } hidden md:flex`}>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-end p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
        aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo/Title */}
      <div className="mb-8">
        {collapsed ? (
          <h1 className="text-xl font-bold text-center">PT</h1>
        ) : (
          <>
            <h1 className="text-xl font-bold">Portal da Transparência</h1>
            <p className="text-red-500 text-sm font-medium">O Moço do Te Amo</p>
          </>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-zinc-800"
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ""}
            >
              <Icon size={collapsed ? 24 : 20} />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {subMenuItems.length > 0 && (
          <div className="pt-4 mt-4 border-t border-zinc-700">
            {!collapsed && (
              <p className="px-3 py-2 text-xs text-zinc-500 uppercase">Configurações</p>
            )}
            {subMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : ""}
                >
                  <Icon size={collapsed ? 22 : 18} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-zinc-700">
        <Link
          href="/"
          target="_blank"
          className={`flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? "Ver site" : ""}
        >
          <ExternalLink size={collapsed ? 24 : 20} />
          {!collapsed && "Ver site"}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={`w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? "Sair" : ""}
        >
          <LogOut size={collapsed ? 24 : 20} />
          {!collapsed && "Sair"}
        </button>
      </div>
    </aside>
  );
}
