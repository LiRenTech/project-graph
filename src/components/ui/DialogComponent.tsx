import React from "react";
// 此组件运行在单独的React实例中，所以需要引入tailwind样式
import "../../index.pcss";
import { cn } from "../../utils/cn";
import { Dialog } from "../../utils/dialog";
import Button from "./Button";
import Input from "./Input";

export default function DialogComponent({
  title = "",
  type = "info",
  content = "",
  code = "",
  buttons = [{ text: "确定", onClick: () => {} }],
  input = false,
  onClose = () => {},
}: Partial<Dialog.DialogProps>) {
  const [inputValue, setInputValue] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 1);
  }, []);

  return (
    <>
      <div
        className={cn(
          // z-[999]是PopupDialog
          "fixed z-[998] flex max-h-[50vh] max-w-96 -translate-x-1/2 -translate-y-1/2 scale-50 transform flex-col gap-4 overflow-auto text-wrap break-words rounded-2xl p-8 text-white opacity-0 shadow-xl shadow-neutral-900",
          {
            "left-1/2 top-1/2 scale-100 opacity-100": show,
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

        {buttons.map((btn, i) => (
          <Button
            key={i}
            onClick={() => {
              btn.onClick?.(inputValue);
              setInputValue("");
              onClose(btn.text, inputValue);
              setShow(false);
            }}
          >
            {btn.text}
          </Button>
        ))}
      </div>
      <div
        className={cn(
          "fixed left-0 top-0 z-[997] h-full w-full bg-black opacity-0",
          {
            "opacity-50": show,
          },
        )}
      ></div>
    </>
  );
}
