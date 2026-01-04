"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Heart, HandHeart, Send, ShieldAlert, HelpCircle, Menu } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/footer";

const menuItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/quem-somos", icon: User, label: "Quem Somos" },
  { href: "/vaquinhas", icon: Heart, label: "Vaquinhas" },
  { href: "/vaquinhas-apoiadas", icon: HandHeart, label: "Apoiadas" },
  { href: "/participar", icon: Send, label: "Envie seu Sonho" },
  { href: "/duvidas", icon: HelpCircle, label: "Dúvidas" },
  { href: "/denunciar", icon: ShieldAlert, label: "Denunciar" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-full border-r border-zinc-900 bg-black z-50 transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-[220px] xl:w-[245px]'}`}>
        {/* Logo */}
        <div className="p-4 pt-6 pb-4">
          <Link href="/" className="block">
            {collapsed ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            ) : (
              <h1 className="text-white font-semibold text-lg px-3">O Moço do Te Amo</h1>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg mb-1 transition-colors group ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                }`}
              >
                <item.icon size={24} className={isActive ? "text-white" : "text-zinc-400 group-hover:text-white"} />
                {!collapsed && (
                  <span className={`text-[15px] ${isActive ? "font-semibold" : "font-normal"}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-zinc-900">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900/50 hover:text-white transition-colors w-full"
          >
            <Menu size={24} />
            {!collapsed && <span className="text-[15px]">Mais</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pb-16 md:pb-0 transition-all duration-200 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[220px] xl:md:ml-[245px]'}`}>
        <div className="max-w-5xl mx-auto">
          {children}
          <Footer />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 z-50">
        <div className="flex items-center justify-around h-12">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 ${
                pathname === item.href ? "text-white" : "text-zinc-500"
              }`}
            >
              <item.icon size={24} />
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
