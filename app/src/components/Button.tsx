import React from "react";
import { cn } from "../utils/cn";
import Box from "./Box";

export default function Button({
  children,
  className = "",
  onClick = () => {},
  disabled = false,
  ...props
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  [key: string]: any;
}>) {
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
      {...props}
    >
      {children}
    </Box>
  );
}
