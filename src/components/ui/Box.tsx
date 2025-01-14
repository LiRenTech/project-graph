import React, { ElementType, forwardRef } from "react";
import { cn } from "../../utils/cn";

// 定义 Box 组件的 props 类型
type BoxProps<E extends ElementType> = {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
} & React.ComponentPropsWithRef<E>;

const _Box = <E extends ElementType = "div">(
  {
    children,
    className = "",
    as: Component = "div", // 默认值设置为 "div"
    ...props
  }: BoxProps<E>,
  ref: React.Ref<HTMLElement>,
) => {
  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-md border border-neutral-700 bg-neutral-800/20 text-white backdrop-blur-md",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// 使用 forwardRef 传递泛型参数 E
const Box = forwardRef<HTMLElement, BoxProps<"div">>(_Box) as <
  E extends ElementType = "div",
>(
  props: BoxProps<E> & {
    ref?: React.Ref<HTMLElement>;
  },
) => React.ReactElement;

export default Box;
