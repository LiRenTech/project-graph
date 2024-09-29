import React from "react";
import { cn } from "../../utils/cn";

export default function Box({
  children,
  className = "",
  onClick = () => {},
  as = "div",
  ...props
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  as?: React.ElementType;
  [key: string]: any;
}>) {
  const Component = as;

  return (
    <Component
      className={cn(
        "rounded-md border border-neutral-700 bg-neutral-800 text-white",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}
