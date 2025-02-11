import { X } from "lucide-react";
import React from "react";
import { createRoot } from "react-dom/client";
import { cn } from "../utils/cn";
import Button from "./Button";

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
  };
  type ButtonLabels<T extends Button[]> = keyof T[number]["label"];

  export function show(
    { title = "", closable = true, buttons = [] }: Partial<Omit<Props, "children">> = {},
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
        >
          {children}
        </Component>,
      );
    });
  }

  function Component({ title, closable, buttons, children }: Props) {
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
      setTimeout(() => {
        setShow(true);
      }, 50);
    }, []);

    return (
      <>
        <div
          className={cn(
            "bg-panel-bg text-panel-text fixed bottom-0 left-2/3 right-0 top-0 z-[99] flex translate-x-full flex-col",
            {
              "translate-x-0": show,
            },
          )}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-bold">{title}</h2>
            {closable && (
              <span className="cursor-pointer" onClick={() => setShow(false)}>
                <X />
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto px-6">{children}</div>
          <div className="flex items-center justify-end p-6">
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
