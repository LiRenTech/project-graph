import React from "react";
import { createRoot } from "react-dom/client";
import Input from "../components/ui/Input";
import { cn } from "./cn";

export namespace Dialog {
  export type DialogButton = {
    text: string;
    color: string;
    onClick?: (value?: string) => void;
  };
  export type DialogType = "info" | "success" | "warning" | "error";
  export type DialogOptions = {
    title: string;
    content: string;
    type: DialogType;
    buttons: Partial<DialogButton>[];
    code: string;
    input: boolean;
  };
  export type DialogProps = DialogOptions & {
    onClose: (button: string, value?: string) => void;
  };
  export type DialogComponentProps = DialogOptions & {
    onClose: (button: string, value?: string) => void;
  };
  export type DialogShowFunc = (options: Partial<DialogOptions>) => Promise<{
    button: string;
    value?: string;
  }>;

  export function show(options: Partial<DialogOptions>): Promise<{
    button: string;
    value?: string;
  }> {
    return new Promise((resolve) => {
      // 启动一个新的React实例
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(
        <Component
          {...options}
          onClose={(button, value) => {
            resolve({ button, value });
            setTimeout(() => {
              root.unmount();
              document.body.removeChild(container);
            }, 300);
          }}
        />,
      );
    });
  }

  function Component({
    title = "",
    type = "info",
    content = "",
    code = "",
    buttons = [{ text: "确定", color: "white", onClick: () => {} }],
    input = false,
    onClose = () => {},
  }: Partial<Dialog.DialogProps>) {
    const [inputValue, setInputValue] = React.useState("");
    const [show, setShow] = React.useState(false);
    const [isCopied, setIsCopied] = React.useState(false);

    React.useEffect(() => {
      setTimeout(() => {
        setShow(true);
      }, 10);
    }, []);

    return (
      <>
        <div
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] flex max-h-[50vh] max-w-96 -translate-x-1/2 -translate-y-1/2 scale-50 transform flex-col gap-4 overflow-auto text-wrap break-words rounded-2xl p-8 text-white opacity-0 shadow-xl shadow-neutral-900",
            {
              "scale-100 opacity-100": show,
              "bg-blue-950": type === "info",
              "bg-green-950": type === "success",
              "bg-yellow-950": type === "warning",
              "bg-red-950": type === "error",
            },
          )}
        >
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex-1 overflow-auto">
            {content.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          {code.trim() !== "" && (
            <div className="flex flex-col gap-2">
              {/* <h2 className="text-lg font-bold">代码</h2> */}
              <pre
                className="cursor-copy select-text overflow-auto rounded-md bg-neutral-900 p-2 text-sm text-white"
                onClick={() => {
                  navigator.clipboard
                    .writeText(code)
                    .then(() => {
                      setIsCopied(true);
                      setTimeout(() => {
                        setIsCopied(false);
                      }, 1000);
                    })
                    .catch((err) => {
                      console.error("复制失败：", err);
                    });
                }}
              >
                {code}
              </pre>
              {isCopied && <span>已复制</span>}
            </div>
          )}
          {input && (
            <Input
              value={inputValue}
              onChange={setInputValue}
              placeholder="请输入"
            />
          )}

          <div className="flex justify-end">
            {buttons.map((btn, i) => (
              <div
                key={i}
                onClick={() => {
                  btn.onClick?.(inputValue);
                  setInputValue("");
                  onClose(btn.text ?? "", inputValue);
                  setShow(false);
                }}
                className={`px-4 py-2 hover:bg-${btn.color ?? "white"}/10 text-${btn.color ?? "white"} cursor-pointer rounded-full active:scale-90`}
              >
                {btn.text}
              </div>
            ))}
          </div>
        </div>
        <div
          className={cn(
            "fixed left-0 top-0 z-[100] h-full w-full bg-black/0 backdrop-blur-0",
            {
              "bg-black/70 !backdrop-blur-lg": show,
            },
          )}
        ></div>
      </>
    );
  }
}
