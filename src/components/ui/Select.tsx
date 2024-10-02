import React from "react";
import { cn } from "../../utils/cn";
import Box from "./Box";

export default function Select({
  children,
  className = "",
  value = "",
  onChange = () => {},
  options = [],
  ...props
}: React.PropsWithChildren<{
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: { label: string; value: string }[];
  [key: string]: any;
}>) {
  return (
    <Box
      as="select"
      className={cn(
        "appearance-none px-3 py-2 transition hover:opacity-80 active:scale-90",
        className,
      )}
      value={value || ""}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
        onChange(event.target.value)
      }
      {...props}
    >
      <optgroup label={String(children || "请选择")}>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </optgroup>
    </Box>
  );
}
