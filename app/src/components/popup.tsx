import React from "react";
import { createRoot } from "react-dom/client";
import { MouseLocation } from "../core/service/controlService/MouseLocation";
import { cn } from "../utils/cn";
import once from "lodash/once";
import Box from "./Box";
import { CircleX } from "lucide-react";

export namespace Popup {
  /**
   * 弹出一个弹窗，这个弹窗面板不能是 fixed 布局
   * @param children
   * @returns
   */
  export function show(children: React.ReactNode, closeWhenClickOutside: boolean = true): Promise<void> {
    return new Promise((resolve) => {
      // 启动一个新的React实例
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(
        <Component
          x={MouseLocation.x}
          y={MouseLocation.y}
          closeWhenClickOutside={closeWhenClickOutside}
          onClose={() => {
            resolve();
            setTimeout(
              once(() => {
                root.unmount();
                try {
                  document.body.removeChild(container);
                } catch (e) {
                  if (e instanceof DOMException) {
                    // 用户从开始界面弹出到关闭界面过快，导致这里报错。
                    // ignore
                  } else {
                    throw Error("Popup组件销毁时，出现错误" + e);
                  }
                }
              }),
              300,
            );
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
    closeWhenClickOutside,
  }: {
    x: number;
    y: number;
    onClose: () => void;
    children: React.ReactNode;
    closeWhenClickOutside: boolean;
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
          if (closeWhenClickOutside) {
            setShow(false);
            onClose();
          }
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
        // 注：这个弹出面板不能用缩放动画，否则导致计算大小初始化的时候不准确，进而导致从边缘弹出时偏移位置计算不准确
        className={cn("border-icon-button-border fixed z-[102] opacity-0", {
          "opacity-100": show,
          "opacity-0 transition-none": adjusting,
          // absolute: closeWhenClickOutside,
        })}
        style={{
          left: adjustedX,
          top: adjustedY,
          transformOrigin: origin,
        }}
      >
        {children}
        {!closeWhenClickOutside && (
          <span
            onClick={() => {
              setShow(false);
              onClose();
            }}
            className="bg-panel-bg text-panel-text border-panel-details-text absolute -right-4 -top-4 cursor-pointer rounded-full p-1 text-sm hover:scale-105"
          >
            <CircleX className="cursor-pointer" />
          </span>
        )}
      </Box>
    );
  }
}
