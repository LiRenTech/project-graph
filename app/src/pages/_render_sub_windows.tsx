import { Transition } from "@headlessui/react";
import { X } from "lucide-react";
import React from "react";
import { Vector } from "../core/dataStruct/Vector";
import { SubWindow } from "../core/service/SubWindow";
import { cn } from "../utils/cn";

export default function RenderSubWindows() {
  const subWindows = SubWindow.use();
  const [closingWindows, setClosingWindows] = React.useState<number[]>([]);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[10000] h-full w-full">
      {subWindows.map((win) => (
        <Transition key={win.id} appear={true} show={!closingWindows.includes(win.id)}>
          <div
            style={{
              top: win.rect.top + "px",
              left: win.rect.left + "px",
              width: win.rect.width + "px",
              height: win.rect.height + "px",
              zIndex: win.zIndex,
            }}
            className={cn(
              "bg-sub-window-bg border-sub-window-border text-sub-window-text shadow-sub-window-shadow pointer-events-auto absolute flex flex-col rounded-xl border shadow-xl",
              "data-closed:scale-75 data-closed:opacity-0",
            )}
            onMouseDown={() => {
              SubWindow.focus(win.id);
            }}
          >
            <div
              className="flex p-1"
              onMouseDown={(e) => {
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
              <div className="flex-1 px-1">{win.title}</div>
              <X
                onClick={() => {
                  setClosingWindows([...closingWindows, win.id]);
                  setTimeout(() => {
                    SubWindow.close(win.id);
                  }, 500);
                }}
              />
            </div>
          </div>
        </Transition>
      ))}
    </div>
  );
}
