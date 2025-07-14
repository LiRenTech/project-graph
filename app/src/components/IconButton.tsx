import React from "react";
import { cn } from "../utils/cn";
import Button from "./Button";

export default function IconButton({
  children,
  className = "",
  onClick = () => {},
  id = "",
  ...props
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  id?: string;
  [key: string]: any;
}>) {
  return (
    <Button
      className={cn(
        "border-icon-button-border bg-icon-button-bg text-icon-button-text px-2 hover:cursor-pointer",
        className,
      )}
      onClick={onClick}
      id={id}
      {...props}
    >
      {children}
    </Button>
  );
}
