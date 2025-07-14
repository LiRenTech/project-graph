import { Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { Rectangle } from "../core/dataStruct/shape/Rectangle";
import { Vector } from "../core/dataStruct/Vector";
import { SubWindow } from "../core/service/SubWindow";
import { cn } from "../utils/cn";

export default function RenderSubWindows() {
  const subWindows = SubWindow.use();

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[10000] h-full w-full">
      {subWindows.map((win) => (
        <Transition key={win.id} appear={true} show={!win.closing}>
          <div
            style={{
              top: win.rect.top + "px",
              left: win.rect.left + "px",
              zIndex: win.zIndex,
              width: win.rect.width + "px",
              height: win.rect.height + "px",
            }}
            className={cn(
              "bg-sub-window-bg border-sub-window-border text-sub-window-text shadow-sub-window-shadow pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl border opacity-75 shadow-xl hover:opacity-100",
              "data-closed:scale-75 data-closed:opacity-0",
            )}
            onClick={() => {
              if (win.closeWhenClickInside) {
                SubWindow.close(win.id);
              }
            }}
            onMouseDown={(e) => {
              SubWindow.focus(win.id);
              // 如果按到的元素的父元素都没有data-pg-drag-region属性，就不移动窗口
              if (!(e.target as HTMLElement).closest("[data-pg-drag-region]")) {
                return;
              }
              const start = new Vector(e.clientX, e.clientY);
              const onMouseUp = () => {
                window.removeEventListener("mouseup", onMouseUp);
                window.removeEventListener("mousemove", onMouseMove);
              };
              const onMouseMove = (e: MouseEvent) => {
                const delta = new Vector(e.clientX, e.clientY).subtract(start);
                const newRect = win.rect.translate(delta);
                SubWindow.update(win.id, { rect: newRect });
              };
              window.addEventListener("mouseup", onMouseUp);
              window.addEventListener("mousemove", onMouseMove);
            }}
          >
            <div className={cn("flex p-1", win.titleBarOverlay && "pointer-events-none absolute left-0 top-0 w-full")}>
              <div className="flex-1 px-1" data-pg-drag-region={win.titleBarOverlay ? undefined : ""}>
                {win.title}
              </div>
              <X
                className="pointer-events-auto"
                onClick={() => {
                  SubWindow.close(win.id);
                }}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {win.children && win.children instanceof Object && "props" in win.children
                ? {
                    ...win.children,
                    props: {
                      ...(win.children.props || {}),
                      winId: win.id,
                    },
                  }
                : win.children}
            </div>
            {/* 添加一个可调整大小的边缘，这里以右下角为例 */}
            <div
              className="bg-sub-window-resize-bg absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
              onMouseDown={(e) => {
                const start = new Vector(e.clientX, e.clientY);
                const onMouseUp = () => {
                  window.removeEventListener("mouseup", onMouseUp);
                  window.removeEventListener("mousemove", onMouseMove);
                };
                const onMouseMove = (e: MouseEvent) => {
                  const delta = new Vector(e.clientX, e.clientY).subtract(start);
                  SubWindow.update(win.id, {
                    rect: new Rectangle(win.rect.location, win.rect.size.add(delta)),
                  });
                };
                window.addEventListener("mouseup", onMouseUp);
                window.addEventListener("mousemove", onMouseMove);
              }}
            />
            {/* 左下角 */}
            <div
              className="bg-sub-window-resize-bg absolute bottom-0 left-0 h-4 w-4 cursor-sw-resize"
              onMouseDown={(e) => {
                const start = new Vector(e.clientX, e.clientY);
                const onMouseUp = () => {
                  window.removeEventListener("mouseup", onMouseUp);
                  window.removeEventListener("mousemove", onMouseMove);
                };
                const onMouseMove = (e: MouseEvent) => {
                  const delta = new Vector(e.clientX, e.clientY).subtract(start);
                  SubWindow.update(win.id, {
                    rect: new Rectangle(
                      new Vector(win.rect.left + delta.x, win.rect.top),
                      new Vector(win.rect.width - delta.x, win.rect.height + delta.y),
                    ),
                  });
                };
                window.addEventListener("mouseup", onMouseUp);
                window.addEventListener("mousemove", onMouseMove);
              }}
            />
          </div>
        </Transition>
      ))}
    </div>
  );
}
