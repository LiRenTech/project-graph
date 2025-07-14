import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../utils/cn";
import Button from "./Button";

export default function IconButton({
  children,
  className = "",
  onClick = () => {},
  id = "",
  ...props
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void | Promise<void>;
  id?: string;
  [key: string]: any;
}>) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className={cn("px-2 hover:cursor-pointer", className)}
      onClick={(e: React.MouseEvent) => {
        if (loading) return;
        const maybePromise = onClick(e);
        if (maybePromise && "then" in maybePromise) {
          setLoading(true);
          maybePromise
            .then(() => setLoading(false))
            .catch((e) => {
              console.error(e);
              setLoading(false);
            });
        }
      }}
      id={id}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}
