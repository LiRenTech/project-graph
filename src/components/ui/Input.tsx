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
  multiline = false,
  ...props
}: React.PropsWithChildren<{
  className?: string;
  value?: string;
  onChange?: (event: string) => void;
  placeholder?: string;
  number?: boolean;
  multiline?: boolean;
  [key: string]: any;
}>) {
  return (
    <Box
      as={multiline ? "textarea" : "input"}
      className={cn(
        "px-3 py-2 outline-none transition hover:opacity-80 focus:opacity-80",
        className,
      )}
      value={value}
      onChange={(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => onChange(e.target.value)}
      onKeyDown={(
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => e.stopPropagation()}
      onKeyUp={(
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => e.stopPropagation()}
      placeholder={placeholder}
      pattern={number ? "[0-9]*" : undefined}
      {...props}
    >
      {children}
    </Box>
  );
}
