import { getVersion } from "@tauri-apps/api/app";
import { Bug, MessageCircleCode, Tag, X } from "lucide-react";
import React from "react";
import { cn } from "@/utils/cn";

export default function ErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  const [show, setShow] = React.useState(false);
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    getVersion().then((v) => setVersion(v));
    const onError = (event: ErrorEvent) => {
      setError(event.error);
      setShow(true);
    };
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div
      className={cn(
        "max-w-screen pointer-events-none fixed left-1/2 top-1/2 z-50 max-h-screen -translate-x-1/2 -translate-y-1/2 scale-90 overflow-y-auto rounded-lg bg-red-950 p-8 opacity-0 shadow-2xl shadow-red-500/30",
        {
          "pointer-events-auto scale-100 opacity-100": show,
        },
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-red-500">未知错误</h1>
        <X size={24} className="cursor-pointer text-red-500 hover:rotate-90" onClick={() => setShow(false)} />
      </div>
      <p className="mt-2 text-lg text-red-300">如果问题持续出现，请在 GitHub 上提交 Issue</p>
      <div className="flex flex-col">
        <div className="">
          <div className="flex gap-2">
            <p className="flex items-center gap-1 text-lg text-red-300">
              <Tag />
              {version}
            </p>
            <p className="flex items-center gap-1 text-lg text-red-300">
              <Bug />
              {error?.name}
            </p>
          </div>

          <p className="flex items-center gap-1 text-sm text-red-300">
            <MessageCircleCode />
            {error?.message}
          </p>
        </div>
        <div className="">
          <div className="mt-4 cursor-text select-text text-xs text-red-300">
            <pre className="cursor-text select-text overflow-auto rounded-md bg-neutral-900 p-2">
              {error?.stack + "\n\n"}
              {/* 结尾加两个空行，是为了方便从下往上选中，供用户复制 */}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
