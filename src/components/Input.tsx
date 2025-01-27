import React from "react";
import { cn } from "../utils/cn";
import Box from "./Box";

type InputProps<T extends boolean = false> = {
  className?: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  onChange?: (value: T extends true ? number : string) => void; // 使用条件类型来定义 onChange 的参数
  number?: T;
  enableFocusOpacity?: boolean;
  [key: string]: any;
};

export default function Input<T extends boolean = false>({
  children,
  className = "",
  value = "",
  onChange,
  placeholder = "",
  number = false as T,
  multiline = false,
  enableFocusOpacity = true,
  ...props
}: React.PropsWithChildren<InputProps<T>>) {
  return (
    <Box<"input">
      as={multiline ? "textarea" : "input"}
      className={cn(
        "px-3 py-2 outline-none",
        enableFocusOpacity && "hover:opacity-80 focus:opacity-80",
        className,
      )}
      value={value}
      onChange={(e) => {
        // 根据 number 的值决定传递的参数类型
        if (number) {
          onChange?.(
            parseInt((e.target as HTMLInputElement).value || "0") as any,
          ); // 强制转换为 number
        } else {
          onChange?.((e.target as HTMLInputElement).value as any); // 强制转换为 string
        }
      }}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      placeholder={placeholder}
      pattern={number ? "[0-9]*" : undefined}
      {...props}
    >
      {children}
    </Box>
  );
}
