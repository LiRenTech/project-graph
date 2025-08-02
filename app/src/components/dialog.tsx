import { Input } from "@/components/ui/input";
import { SubWindow } from "@/core/service/SubWindow";
import { cn } from "@/utils/cn";
import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import React from "react";

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

  /**
   * @example
   * Dialog.show({
   *   title: "标题",
   *   content: "内容",
   *   type: "info",
   *   buttons: [
   *     { text: "确定", color: "green", onClick: () => {} },
   *     { text: "取消", color: "red", onClick: () => {} },
   *   ],
   * });
   *
   * # 带有输入框的对话框
   *
   * Dialog.show({
   *     title: "重命名边",
   *     input: true,
   *   }).then(({ button, value }) => {
   *     if (button === "确定") {
   *       if (value) {
   *         for (const edge of StageManager.getLineEdges()) {
   *           if (edge.isSelected) {
   *             edge.rename(value);
   *           }
   *         }
   *       }
   *     }
   *   });
   * @param options
   * @returns
   */
  export function show(options: Partial<DialogOptions>): Promise<{
    button: string;
    value?: string;
  }> {
    return new Promise((resolve) => {
      const win = SubWindow.create({
        // title: options.title,
        children: (
          <Component
            {...options}
            onClose={(button, value) => {
              resolve({ button, value });
              SubWindow.close(win.id);
            }}
          />
        ),
        rect: Rectangle.inCenter(new Vector(400, 300)),
        titleBarOverlay: true,
        closable: false,
      });
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
    const [isCopied, setIsCopied] = React.useState(false);

    return (
      <div
        data-pg-drag-region
        className={cn("flex h-full flex-col gap-4 text-wrap break-words p-8", `el-dialog-${type}`)}
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
        {/* 输入框 */}
        {input && <Input value={inputValue} onChange={setInputValue} placeholder="请输入" className="dialog-input" />}

        <div className="flex justify-end">
          {buttons.map((btn, i) => (
            <div
              key={i}
              onClick={() => {
                btn.onClick?.(inputValue);
                setInputValue("");
                onClose(btn.text ?? "", inputValue);
              }}
              className={cn(
                `px-4 py-2 hover:bg-${btn.color ?? "white"}/10 text-${btn.color ?? "white"} cursor-pointer rounded-full active:scale-90`,
                btn.text === "确定" && "dialog-confirm-btn",
              )}
            >
              {btn.text}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
