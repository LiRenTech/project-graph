import { useEffect, useState } from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";

interface MarkdownEditorProps {
  initialValue: string; // 定义一个可选的初始值
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  initialValue = "",
  onChange,
}: MarkdownEditorProps) {
  const [vd, setVd] = useState<Vditor>();

  useEffect(() => {
    const vditor = new Vditor("vditor", {
      after: () => {
        vditor.setValue(initialValue);
        setVd(vditor);
      },
      input: (value: string) => {
        console.log(value, "input");
        onChange(value);
      },
      // preview: {
      //   theme: {
      //     current: "dark",
      //   },
      // },
    });

    return () => {
      vd?.destroy();
      setVd(undefined);
    };
  }, [initialValue]);

  return <div id="vditor" className="vditor flex-1 overflow-auto" />;
}
