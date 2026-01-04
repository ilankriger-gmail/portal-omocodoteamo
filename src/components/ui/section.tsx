"use client";

import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: "none" | "sm" | "md" | "lg";
  id?: string;
}

/**
 * Componente de seção para criar blocos de conteúdo com espaçamento consistente
 */
export function Section({ children, className = "", spacing = "md", id }: SectionProps) {
  // Mapeamento de tamanhos de espaçamento
  const spacingClasses = {
    none: "",
    sm: "py-lg",
    md: "py-xl",
    lg: "py-2xl",
  };

  return (
    <section id={id} className={`w-full ${spacingClasses[spacing]} ${className}`}>
      {children}
    </section>
  );
}

/**
 * Container para conteúdo com largura máxima e centralizção
 */
export function Container({
  children,
  className = "",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
}) {
  // Mapeamento de tamanhos de container
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div className={`mx-auto w-full px-4 md:px-6 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Agrupamento horizontal com espaçamento flexível
 */
export function HStack({
  children,
  className = "",
  spacing = "md",
  align = "center",
}: {
  children: ReactNode;
  className?: string;
  spacing?: "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
}) {
  const spacingClasses = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div className={`flex ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Agrupamento vertical com espaçamento flexível
 */
export function VStack({
  children,
  className = "",
  spacing = "md",
  align = "stretch",
}: {
  children: ReactNode;
  className?: string;
  spacing?: "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
}) {
  const spacingClasses = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div className={`flex flex-col ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}