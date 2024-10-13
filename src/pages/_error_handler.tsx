import React from "react";
import { cn } from "../utils/cn";
import { Bug, FileWarning, MessageCircleCode, X } from "lucide-react";

export default function ErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
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
        "pointer-events-none fixed left-1/2 top-1/2 z-50 max-h-screen -translate-x-1/2 -translate-y-1/2 scale-90 overflow-y-auto rounded-lg bg-red-950 p-8 opacity-0 shadow-2xl shadow-red-500/30 transition",
        {
          "pointer-events-auto scale-100 opacity-100": show,
        },
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-red-500">未知错误</h1>
        <X
          size={24}
          className="cursor-pointer text-red-500"
          onClick={() => setShow(false)}
        />
      </div>
      <p className="mt-2 text-lg text-red-300">
        如果问题持续出现，请在 GitHub 上提交 Issue
      </p>
      <div className="flex gap-8">
        <div>
          <p className="mt-4 text-lg text-red-300">
            <Bug />
            {error?.name}
          </p>
          <p className="mt-4 text-lg text-red-300">
            <MessageCircleCode />
            {error?.message}
          </p>
        </div>
        <div>
          <p className="mt-4 text-lg text-red-300">
            <FileWarning />
            {error?.stack}
          </p>
        </div>
      </div>
    </div>
  );
}
