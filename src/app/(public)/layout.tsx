"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Heart, HandHeart, Send, ShieldAlert, HelpCircle, ChevronLeft, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";

const menuItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/quem-somos", icon: User, label: "Quem Somos" },
  { href: "/vaquinhas", icon: Heart, label: "Vaquinhas" },
  { href: "/vaquinhas-apoiadas", icon: HandHeart, label: "Apoiadas" },
  { href: "/participar", icon: Send, label: "Envie seu Sonho" },
  { href: "/denunciar", icon: ShieldAlert, label: "Denunciar" },
  { href: "/duvidas", icon: HelpCircle, label: "Dúvidas" },
];

// Itens principais para mobile (4 itens + botão Mais)
const mobileMenuItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/vaquinhas", icon: Heart, label: "Vaquinhas" },
  { href: "/vaquinhas-apoiadas", icon: HandHeart, label: "Apoiadas" },
  { href: "/participar", icon: Send, label: "Enviar" },
];

// Itens do menu "Mais" no mobile
const mobileMoreItems = [
  { href: "/quem-somos", icon: User, label: "Quem Somos" },
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Verifica se algum item do menu "Mais" está ativo
  const isMoreItemActive = mobileMoreItems.some(item => pathname === item.href);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full border-r border-[var(--border)] bg-[var(--sidebar-bg)] backdrop-blur-sm z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'w-[72px]' : 'w-[220px] xl:w-[245px]'}`}
      >
        {/* Logo */}
        <div className="p-4 pt-6 pb-4">
          <Link href="/" className="block group">
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'scale-100' : 'scale-100'}`}>
              {collapsed ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
              ) : (
                <h1 className="text-[var(--foreground)] font-semibold text-lg px-3 transition-opacity duration-300">O Moço do Te Amo</h1>
              )}
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg mb-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group relative overflow-hidden ${
                  isActive
                    ? "bg-[var(--nav-item-active-bg)] text-[var(--foreground)]"
                    : "text-[var(--foreground-tertiary)] hover:bg-[var(--nav-item-hover-bg)] hover:text-[var(--foreground)]"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Indicador ativo */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-r-full transition-all duration-300" />
                )}

                <item.icon
                  size={24}
                  className={`transition-all duration-300 ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground-tertiary)] group-hover:text-[var(--foreground)]"} ${collapsed ? '' : 'group-hover:scale-110'}`}
                />

                <span
                  className={`text-[15px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isActive ? "font-semibold" : "font-normal"} ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
                >
                  {item.label}
                </span>

                {/* Tooltip para modo colapsado */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--surface)] text-[var(--foreground)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-[var(--border)]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle e Collapse Button */}
        <div className="p-3 border-t border-[var(--border)]">
          <ThemeToggle collapsed={collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center gap-4 px-3 py-3 rounded-lg text-[var(--foreground-tertiary)] hover:bg-[var(--nav-item-hover-bg)] hover:text-[var(--foreground)] transition-all duration-300 w-full group mt-1"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <div className="transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
              <ChevronLeft size={20} />
            </div>
            <span className={`text-[15px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
              Recolher
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pb-20 md:pb-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'md:ml-[72px]' : 'md:ml-[220px] xl:md:ml-[245px]'}`}>
        <div className="max-w-5xl mx-auto animate-fade-in">
          {children}
          <Footer />
        </div>
      </main>

      {/* Mobile Bottom Navigation - Redesigned */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] backdrop-blur-md border-t border-[var(--border)] z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 min-w-[56px] ${
                  isActive
                    ? "text-[var(--foreground)]"
                    : "text-[var(--foreground-tertiary)] active:scale-95"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? 'bg-green-600/20' : ''}`}>
                  <item.icon
                    size={24}
                    className={`transition-all duration-300 ${isActive ? 'text-green-500' : ''}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={`text-sm mt-0.5 transition-all duration-300 ${isActive ? 'text-green-500 font-medium' : 'text-[var(--foreground-tertiary)]'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Botão Mais */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 min-w-[56px] ${
              isMoreItemActive || moreMenuOpen
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground-tertiary)] active:scale-95"
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-300 ${isMoreItemActive ? 'bg-green-600/20' : ''}`}>
              {moreMenuOpen ? (
                <X
                  size={24}
                  className="text-green-500 transition-all duration-300"
                  strokeWidth={2.5}
                />
              ) : (
                <MoreHorizontal
                  size={24}
                  className={`transition-all duration-300 ${isMoreItemActive ? 'text-green-500' : ''}`}
                  strokeWidth={isMoreItemActive ? 2.5 : 2}
                />
              )}
            </div>
            <span className={`text-sm mt-0.5 transition-all duration-300 ${isMoreItemActive ? 'text-green-500 font-medium' : 'text-[var(--foreground-tertiary)]'}`}>
              Mais
            </span>
          </button>
        </div>

        {/* Menu Mais - Popup */}
        {moreMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/60 -z-10"
              onClick={() => setMoreMenuOpen(false)}
            />

            {/* Menu */}
            <div className="absolute bottom-full left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] rounded-t-2xl p-4 mb-0 animate-slide-up">
              <div className="flex flex-col gap-1">
                {mobileMoreItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-green-600/20 text-[var(--foreground)]"
                          : "text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <item.icon
                        size={24}
                        className={isActive ? "text-green-500" : "text-[var(--foreground-tertiary)]"}
                      />
                      <span className={`text-lg ${isActive ? "font-semibold text-green-500" : ""}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}
