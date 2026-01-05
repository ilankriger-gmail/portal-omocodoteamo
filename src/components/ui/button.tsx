"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed border-2 active:scale-[0.98]";

    const variants = {
      // Verde (botões de envio/ação principais)
      primary: "bg-brand-green text-white border-brand-green hover:bg-green-600 hover:border-green-600 hover:shadow-lg hover:shadow-green-600/20 focus:ring-green-600",
      // Preto com borda cinza (mais claro para melhor contraste)
      secondary: "bg-black text-white border-zinc-600 hover:bg-zinc-800 hover:border-zinc-500 hover:shadow-md focus:ring-zinc-500",
      // Preto com borda roxa
      accent: "bg-black text-white border-purple-600 hover:bg-purple-600/10 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-600/20 focus:ring-purple-500",
      // Vermelho para ações perigosas
      danger: "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:shadow-red-600/20 focus:ring-red-500",
      // Verde mais vibrante para sucesso
      success: "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700 hover:shadow-lg hover:shadow-green-600/20 focus:ring-green-500",
      // Transparente
      ghost: "bg-transparent text-white border-transparent hover:border-zinc-600 hover:bg-zinc-900 focus:ring-zinc-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && !loading && <span className="mr-2 transition-transform duration-300">{icon}</span>}
        <span className="font-semibold">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
