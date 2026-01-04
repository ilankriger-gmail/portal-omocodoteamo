"use client";

import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Título principal (h1) - Mais bold e maior
export function H1({ children, className = "" }: TypographyProps) {
  return (
    <h1 className={`text-foreground text-3xl font-extrabold leading-tight mb-4 ${className}`}>
      {children}
    </h1>
  );
}

// Título secundário (h2) - Bold com tamanho médio-grande
export function H2({ children, className = "" }: TypographyProps) {
  return (
    <h2 className={`text-foreground text-2xl font-bold leading-tight mb-3 ${className}`}>
      {children}
    </h2>
  );
}

// Subtítulo (h3) - Peso médium como solicitado
export function H3({ children, className = "" }: TypographyProps) {
  return (
    <h3 className={`text-foreground text-xl font-medium leading-snug mb-2 ${className}`}>
      {children}
    </h3>
  );
}

// Subtítulo menor (h4) - Peso médium
export function H4({ children, className = "" }: TypographyProps) {
  return (
    <h4 className={`text-foreground text-lg font-medium leading-snug mb-2 ${className}`}>
      {children}
    </h4>
  );
}

// Texto de parágrafo - Melhorado com line-height para legibilidade
export function P({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-foreground-secondary text-base leading-relaxed mb-4 ${className}`}>
      {children}
    </p>
  );
}

// Texto pequeno para legendas, datas, etc
export function Small({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-foreground-tertiary text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

// Lead paragraph - Texto introdutório ou destaque
export function Lead({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-foreground-secondary text-lg font-medium leading-relaxed mb-6 ${className}`}>
      {children}
    </p>
  );
}

// Display para tamanhos muito grandes (títulos de destaque)
export function Display({ children, className = "" }: TypographyProps) {
  return (
    <h1 className={`text-foreground text-4xl md:text-5xl font-black leading-tight mb-6 ${className}`}>
      {children}
    </h1>
  );
}

// Texto de lista para itens de listas
export function ListItem({ children, className = "" }: TypographyProps) {
  return (
    <li className={`text-foreground-secondary leading-relaxed mb-2 ${className}`}>
      {children}
    </li>
  );
}

// Texto de código para amostras de código
export function Code({ children, className = "" }: TypographyProps) {
  return (
    <code className={`font-mono text-sm bg-zinc-900 rounded px-1 py-0.5 ${className}`}>
      {children}
    </code>
  );
}

// Texto de destaque / citação
export function Blockquote({ children, className = "" }: TypographyProps) {
  return (
    <blockquote className={`border-l-4 border-brand-green pl-4 py-1 italic text-foreground-secondary ${className}`}>
      {children}
    </blockquote>
  );
}