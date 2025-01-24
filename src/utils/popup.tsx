import React from "react";
import { createRoot } from "react-dom/client";
import Box from "../components/ui/Box";
import { MouseLocation } from "../core/service/MouseLocation";
import { cn } from "./cn";

export namespace Popup {
  export function show(children: React.ReactNode): Promise<void> {
    return new Promise((resolve) => {
      // 启动一个新的React实例
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(
        <Component
          x={MouseLocation.x}
          y={MouseLocation.y}
          onClose={() => {
            resolve();
            setTimeout(() => {
              root.unmount();
              document.body.removeChild(container);
            }, 300);
          }}
        >
          {children}
        </Component>,
      );
    });
  }

  function Component({
    x,
    y,
    onClose,
    children,
  }: {
    x: number;
    y: number;
    onClose: () => void;
    children: React.ReactNode;
  }) {
    const [adjustedX, setAdjustedX] = React.useState(0);
    const [adjustedY, setAdjustedY] = React.useState(0);
    const [origin, setOrigin] = React.useState("top left");
    const ref = React.useRef<HTMLDivElement>(null);
    const [adjusting, setAdjusting] = React.useState(true);
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
      if (ref.current) {
        // 调整弹窗位置，确保不会超出屏幕边界
        const { width, height } = ref.current.getBoundingClientRect();
        setAdjustedX(x);
        setAdjustedY(y);
        if (x + width > window.innerWidth) {
          setAdjustedX(x - width);
        }
        if (y + height > window.innerHeight) {
          setAdjustedY(y - height);
        }
        // 根据位置调整情况修改transformOrigin
        if (x + width / 2 > window.innerWidth / 2) {
          setOrigin("top right");
        } else {
          setOrigin("top left");
        }

        setTimeout(() => {
          setShow(true);
          setAdjusting(false);
        }, 1);
      }

      // 监听在外面点击事件
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setShow(false);
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <Box
        ref={ref}
        className={cn("fixed z-[102] scale-75 p-2 opacity-0", {
          "scale-100 opacity-100": show,
          "opacity-0 transition-none": adjusting,
        })}
        style={{
          left: adjustedX,
          top: adjustedY,
          transformOrigin: origin,
        }}
      >
        {children}
      </Box>
    );
  }
}
