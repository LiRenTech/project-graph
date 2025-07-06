import React from "react";
import { SoundService } from "../core/service/feedbackService/SoundService";
import { cn } from "../utils/cn";
import Box from "./Box";

export default function Button({
  children,
  className = "",
  onClick = () => {},
  disabled = false,
  ...props
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  [key: string]: any;
}>) {
  return (
    <Box
      as="button"
      className={cn(
        "el-button flex items-center justify-center gap-1 px-3 py-2",
        {
          "hover:cursor-pointer hover:opacity-80 active:scale-90": !disabled,
          "cursor-not-allowed opacity-50": disabled,
        },
        className,
      )}
      onMouseEnter={() => {
        SoundService.play.mouseEnterButton();
      }}
      onClick={(e: React.MouseEvent) => {
        if (!disabled) {
          onClick(e);
        }
      }}
      onMouseDown={() => {
        SoundService.play.mouseClickButton();
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
