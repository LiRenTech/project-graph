import React, { ElementType, forwardRef } from "react";
import { cn } from "../utils/cn";

// 定义 Box 组件的 props 类型
type BoxProps<E extends ElementType> = {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  tooltip?: string;
} & React.ComponentPropsWithRef<E>;

const _Box = <E extends ElementType = "div">(
  {
    children,
    className = "",
    as: Component = "div", // 默认值设置为 "div"
    tooltip = "",
    ...props
  }: BoxProps<E>,
  ref: React.Ref<HTMLElement>,
) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipX, setTooltipX] = React.useState(0);
  const [tooltipY, setTooltipY] = React.useState(0);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    // eslint-disable-next-line react/prop-types
    props.onMouseEnter?.(event);
    setShowTooltip(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // eslint-disable-next-line react/prop-types
    props.onMouseMove?.(event);
    setTooltipX(event.clientX);
    setTooltipY(event.clientY);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    // eslint-disable-next-line react/prop-types
    props.onMouseLeave?.(event);
    setShowTooltip(false);
  };

  return (
    <>
      <Component
        ref={ref}
        className={cn(
          "rounded-md border border-neutral-700 bg-neutral-800 text-white",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Component>
      <div
        className={cn(
          "pointer-events-none fixed z-[103] scale-75 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-white opacity-0 transition",
          {
            "pointer-events-auto scale-100 opacity-100": showTooltip && tooltip,
          },
        )}
        style={{
          top: `${tooltipY + 10}px`,
          left: `${tooltipX + 10}px`,
        }}
      >
        {tooltip}
      </div>
    </>
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
