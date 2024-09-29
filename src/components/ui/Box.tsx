import React from "react";
import { cn } from "../../utils/cn";

export default function Box({
  children,
  className = "",
  onClick = () => {},
  tauriDragRegion = false,
  as = "div",
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  as?: React.ElementType;
  tauriDragRegion?: boolean;
}>) {
  const Component = as;

  return (
    <Component
      className={cn(
        "rounded-md border border-neutral-700 bg-neutral-800 text-white",
        className,
      )}
      onClick={onClick}
      data-tauri-drag-region={tauriDragRegion}
    >
      {children}
    </Component>
  );
}
