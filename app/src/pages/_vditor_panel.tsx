import { useEffect, useRef, useState } from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";

export default function MarkdownEditor({
  defaultValue = "",
  onChange,
  id = "",
  className = "",
  options = {},
}: {
  defaultValue?: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  options?: Omit<IOptions, "after" | "input">;
}) {
  // console.log("veditor render");
  const [vd, setVd] = useState<Vditor>();
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 在每次展开面板都会调用一次这个函数 v1.4.13

    const vditor = new Vditor(el.current!, {
      after: () => {
        vditor.setValue(defaultValue);
        setVd(vditor);
      },
      // input 有问题，只要一输入内容停下来的时候就被迫失去焦点了。
      blur: (value: string) => {
        onChange(value);
      },
      theme: "dark",
      preview: {
        theme: {
          current: "dark",
        },
        hljs: {
          style: "darcula",
        },
      },
      cache: { enable: false },
      ...options,
    });
    if (vditor) {
      // console.log(vditor, "vditor");
      setTimeout(() => {
        vditor.focus();
      }, 100);
    }

    return () => {
      vd?.destroy();
      setVd(undefined);
      // console.log("veditor unmount");
    };
  }, [defaultValue]);

  return (
    <div
      ref={el}
      id={id}
      className={className}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    />
  );
}
