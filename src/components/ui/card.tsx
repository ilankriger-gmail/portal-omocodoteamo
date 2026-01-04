"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "raised" | "highlight" | "subtle";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const baseClasses = "rounded-xl overflow-hidden flex flex-col h-full transition-all";

  const variantClasses = {
    default: "bg-surface-card border border-border p-card",
    raised: "bg-surface-card border border-border-light shadow-md p-card",
    highlight: "bg-surface-card border border-green-600/30 shadow-sm shadow-green-800/10 p-card",
    subtle: "bg-surface-card/80 border border-border/50 p-card",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-md ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-foreground font-bold text-xl ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-foreground-tertiary text-sm mt-xs ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex-grow ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-md flex items-center ${className}`}>{children}</div>;
}

export function CardImage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`aspect-video relative overflow-hidden ${className}`}>{children}</div>;
}