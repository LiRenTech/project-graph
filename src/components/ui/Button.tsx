import React from "react";
import { cn } from "../../utils/cn";
import Box from "./Box";

export default function Button({
  children,
  className = "",
  onClick = () => {},
  tauriDragRegion = false,
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  tauriDragRegion?: boolean;
}>) {
  return (
    <Box
      as="button"
      className={cn(
        "px-3 py-2 transition hover:opacity-80 active:scale-90",
        className,
      )}
      onClick={onClick}
      data-tauri-drag-region={tauriDragRegion}
    >
      {children}
    </Box>
  );
}
