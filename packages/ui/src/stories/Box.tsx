import React, { ElementType, forwardRef } from "react";
import { cn } from "./utils/cn";

type BoxProps<E extends ElementType> = {
  children?: React.ReactNode;
  className?: string;
  as?: ElementType;
  tooltip?: string;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
} & React.ComponentPropsWithRef<E>;

const RealBox = <E extends ElementType = "div">(
  { children, className = "", as: Component = "div", tooltip = "", ...props }: BoxProps<E>,
  ref: React.Ref<HTMLElement>,
) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipX, setTooltipX] = React.useState(0);
  const [tooltipY, setTooltipY] = React.useState(-1000); // 防止遮挡左上角菜单按钮

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    props.onMouseEnter?.(event);
    setShowTooltip(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    props.onMouseMove?.(event);
    setTooltipX(event.clientX);
    setTooltipY(event.clientY);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    props.onMouseLeave?.(event);
    setTooltipY(-1000); // 防止遮挡左上角菜单按钮
    setShowTooltip(false);
  };

  return (
    <>
      <Component
        ref={ref}
        className={cn("border-box-border bg-box-bg text-box-text rounded-md border", className)}
        {...props}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Component>
      {tooltip && (
        <div
          className={cn(
            "border-tooltip-border bg-tooltip-bg text-tooltip-text pointer-events-none fixed z-[103] scale-75 rounded-md border px-2 py-1 transition",
            {
              "pointer-events-auto scale-100 opacity-100": showTooltip,
            },
          )}
          style={{
            top: `${tooltipY + 10}px`,
            left: `${tooltipX + 10}px`,
          }}
        >
          {tooltip}
        </div>
      )}
    </>
  );
};

export const Box = forwardRef<HTMLElement, BoxProps<"div">>(RealBox) as <E extends ElementType = "div">(
  props: BoxProps<E> & {
    ref?: React.Ref<HTMLElement>;
  },
) => React.ReactElement;
