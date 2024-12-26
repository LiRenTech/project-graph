import React, { ElementType, forwardRef } from "react";
import { cn } from "../../utils/cn";

// Define the type for the element type
type E = ElementType;

type BoxProps<E extends ElementType = "div"> = {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  as?: E;
} & Omit<React.ComponentProps<E>, "ref">; // 排除 'ref' 属性，以避免类型冲突

// 使用 forwardRef 传递泛型参数 E
const Box = forwardRef<React.ComponentRef<E>, BoxProps<E>>(
  (
    {
      children,
      className = "",
      as: Component = "div", // 默认值设置为 "div"
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-md border border-neutral-700 bg-neutral-800 text-white",
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

// 为 Box 添加 displayName 以便于调试
Box.displayName = "Box";

export default Box;
