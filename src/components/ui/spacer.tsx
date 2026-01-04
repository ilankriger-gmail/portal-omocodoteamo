"use client";

interface SpacerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  axis?: "horizontal" | "vertical";
}

/**
 * Componente utilitário para adicionar espaçamentos consistentes entre elementos.
 *
 * @example
 * <Spacer size="md" /> // Espaço vertical médio
 * <Spacer size="lg" axis="horizontal" /> // Espaço horizontal grande
 */
export function Spacer({ size = "md", axis = "vertical" }: SpacerProps) {
  // Classes de espaçamento baseadas no tamanho
  const sizeClasses = {
    xs: axis === "vertical" ? "h-xs" : "w-xs",
    sm: axis === "vertical" ? "h-sm" : "w-sm",
    md: axis === "vertical" ? "h-md" : "w-md",
    lg: axis === "vertical" ? "h-lg" : "w-lg",
    xl: axis === "vertical" ? "h-xl" : "w-xl",
    "2xl": axis === "vertical" ? "h-2xl" : "w-2xl",
  };

  return <div className={sizeClasses[size]} />;
}

/**
 * Componente de divisor com espaçamento. Útil para separação visual entre seções.
 *
 * @example
 * <Divider space="md" /> // Divider com espaçamento médio acima e abaixo
 */
export function Divider({ space = "md" }: { space?: SpacerProps["size"] }) {
  const spaceClasses = {
    xs: "my-xs",
    sm: "my-sm",
    md: "my-md",
    lg: "my-lg",
    xl: "my-xl",
    "2xl": "my-2xl",
  };

  return (
    <div className={`w-full border-t border-zinc-800 ${spaceClasses[space]}`} />
  );
}