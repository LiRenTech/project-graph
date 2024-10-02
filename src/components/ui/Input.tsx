import React from "react";
import { cn } from "../../utils/cn";
import Box from "./Box";

export default function Input({
  children,
  className = "",
  value = "",
  onChange = () => {},
  placeholder = "",
  number = false,
  ...props
}: React.PropsWithChildren<{
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  number?: boolean;
  [key: string]: any;
}>) {
  return (
    <Box
      as="input"
      className={cn(
        "px-3 py-2 outline-none transition hover:opacity-80 focus:opacity-80",
        className,
      )}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      pattern={number ? "[0-9]*" : undefined}
      {...props}
    >
      {children}
    </Box>
  );
}
