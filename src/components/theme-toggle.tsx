"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-4 px-3 py-3 rounded-lg text-zinc-400 hover:bg-[var(--nav-item-hover-bg)] hover:text-[var(--foreground)] transition-all duration-300 w-full group"
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {theme === "dark" ? (
          <Sun size={22} className="text-yellow-400 transition-all duration-300" />
        ) : (
          <Moon size={22} className="text-blue-500 transition-all duration-300" />
        )}
      </div>
      <span
        className={`text-[15px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
        }`}
      >
        {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
      </span>

      {/* Tooltip para modo colapsado */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--surface)] text-[var(--foreground)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-[var(--border)]">
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </div>
      )}
    </button>
  );
}
