"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-900 py-6 px-4 mt-8">
      <div className="max-w-[630px] mx-auto">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <Link href="/" className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <h2 className="text-white font-semibold text-sm">O Moço do Te Amo</h2>
            </div>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
            <Link href="/quem-somos" className="text-zinc-400 hover:text-white text-xs">
              Quem Somos
            </Link>
            <Link href="/vaquinhas" className="text-zinc-400 hover:text-white text-xs">
              Vaquinhas
            </Link>
            <Link href="/duvidas" className="text-zinc-400 hover:text-white text-xs">
              Dúvidas
            </Link>
            <Link href="/participar" className="text-zinc-400 hover:text-white text-xs">
              Envie seu Sonho
            </Link>
            <Link href="/denunciar" className="text-zinc-400 hover:text-white text-xs">
              Denunciar
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
            <Link href="/privacidade" className="text-zinc-500 hover:text-zinc-400 text-[10px]">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="text-zinc-500 hover:text-zinc-400 text-[10px]">
              Termos de Serviço
            </Link>
            <Link href="/cookies" className="text-zinc-500 hover:text-zinc-400 text-[10px]">
              Política de Cookies
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-zinc-600 text-[10px] flex items-center gap-1">
            <span>{currentYear} © O Moço do Te Amo</span>
            <Heart size={8} className="text-red-500" />
            <span>Todos os direitos reservados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}