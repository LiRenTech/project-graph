import React from "react";
import { cn } from "../../utils/cn";
import Box from "./Box";

export default function Button({
  children,
  className = "",
  onClick = () => {},
  ...props
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
}>) {
  return (
    <Box
      as="button"
      className={cn(
        "px-3 py-2 transition hover:opacity-80 active:scale-90",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Box>
  );
}
