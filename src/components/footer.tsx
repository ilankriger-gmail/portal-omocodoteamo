"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] py-8 px-4 mt-8 bg-[var(--surface)]">
      <div className="max-w-[630px] mx-auto">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <Link href="/" className="mb-5 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <h2 className="text-[var(--foreground)] font-semibold text-sm transition-colors duration-300 group-hover:text-[var(--foreground-secondary)]">O Moço do Te Amo</h2>
            </div>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-5">
            <Link href="/quem-somos" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors duration-300 link-underline">
              Quem Somos
            </Link>
            <Link href="/vaquinhas" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors duration-300 link-underline">
              Vaquinhas
            </Link>
            <Link href="/duvidas" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors duration-300 link-underline">
              Dúvidas
            </Link>
            <Link href="/participar" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors duration-300 link-underline">
              Envie seu Sonho
            </Link>
            <Link href="/denunciar" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors duration-300 link-underline">
              Denunciar
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-5">
            <Link href="/privacidade" className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] text-xs transition-colors duration-300">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] text-xs transition-colors duration-300">
              Termos de Serviço
            </Link>
            <Link href="/cookies" className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] text-xs transition-colors duration-300">
              Política de Cookies
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-[var(--foreground-tertiary)] text-xs flex items-center gap-1 group">
            <span>{currentYear} © O Moço do Te Amo</span>
            <Heart size={10} className="text-red-500 transition-transform duration-300 group-hover:scale-125" />
            <span>Todos os direitos reservados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
