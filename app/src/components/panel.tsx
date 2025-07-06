import { X } from "lucide-react";
import React from "react";
import { createRoot } from "react-dom/client";
import { cn } from "../utils/cn";
import Button from "./Button";

/**
 * @deprecated Remove in 2.0.0
 */
export namespace Panel {
  export type Button = {
    label: string;
    onClick: () => void;
  };
  export type Props = {
    title: string;
    closable: boolean;
    buttons: Button[];
    children: React.ReactNode;
    widthRate: number;
  };
  type ButtonLabels<T extends Button[]> = keyof T[number]["label"];

  /**
   * widthRate: 0.33 means 33% of the screen width.
   * @param param0
   * @param children
   * @returns
   */
  export function show(
    { title = "", closable = true, buttons = [], widthRate = 0.33 }: Partial<Omit<Props, "children">> = {},
    children = <></>,
  ) {
    return new Promise<ButtonLabels<typeof buttons>>((resolve) => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(
        <Component
          title={title}
          closable={closable}
          buttons={buttons.map((button) => ({
            label: button.label,
            onClick: () => {
              root.unmount();
              container.remove();
              resolve(button.label as unknown as ButtonLabels<typeof buttons>);
              button.onClick();
            },
          }))}
          widthRate={widthRate}
        >
          {children}
        </Component>,
      );
    });
  }

  function Component({ title, closable, buttons, children, widthRate }: Props) {
    const [show, setShow] = React.useState(false);

    const closeFunction = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShow(false);
      }
    };
    React.useEffect(() => {
      setTimeout(() => {
        setShow(true);
      }, 50);

      window.addEventListener("keydown", closeFunction);
      return () => {
        window.removeEventListener("keydown", closeFunction);
      };
    }, []);

    return (
      <>
        <div
          className={cn(
            "bg-panel-bg text-panel-text fixed bottom-0 right-0 top-0 z-[99] flex translate-x-full flex-col",
            {
              "translate-x-0": show,
            },
            `w-[${widthRate * 100}%]`,
            // "w-[100%]",
          )}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-xl font-bold">{title}</span>
            {closable && (
              <span
                className="text-panel-error-text cursor-pointer rounded ring hover:scale-105"
                onClick={() => setShow(false)}
              >
                <X className="cursor-pointer" />
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto px-6">{children}</div>
          {buttons.length > 0 && (
            <div className="flex items-center justify-end gap-4 p-6">
              {buttons.map((button) => (
                <Button
                  key={button.label}
                  onClick={() => {
                    setShow(false);
                    setTimeout(() => {
                      button.onClick();
                    }, 500);
                  }}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div
          className={cn("pointer-events-none fixed inset-0 z-[98] bg-black opacity-0", {
            "pointer-events-auto opacity-75": show,
          })}
        ></div>
      </>
    );
  }
}
