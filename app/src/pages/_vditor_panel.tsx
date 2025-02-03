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
  const [vd, setVd] = useState<Vditor>();
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vditor = new Vditor(el.current!, {
      after: () => {
        vditor.setValue(defaultValue);
        setVd(vditor);
      },
      input: (value: string) => {
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

    return () => {
      vd?.destroy();
    };
  }, [defaultValue]);

  return <div ref={el} id={id} className={className} onKeyDown={(e) => e.stopPropagation()} />;
}
