import React from "react";
import { Box } from "./Box";
import { cn } from "./utils/cn";

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}

export function Button({ children, className = "", onClick = () => {}, disabled = false }: ButtonProps) {
  return (
    <Box
      as="button"
      className={cn(
        "border-button-border bg-button-bg text-button-text flex items-center justify-center gap-1 px-3 py-2",
        {
          "hover:cursor-pointer hover:opacity-80 active:scale-90": !disabled,
          "cursor-not-allowed opacity-50": disabled,
        },
        className,
      )}
      onClick={(e: React.MouseEvent) => {
        if (!disabled) {
          onClick(e);
        }
      }}
    >
      {children}
    </Box>
  );
}
