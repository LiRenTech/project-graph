import React from "react";
import { cn } from "../utils/cn";
import { SoundService } from "../core/service/feedbackService/SoundService";
import { NavLink } from "react-router-dom";

export default function NavLinkButton({
  children,
  className = "",
  to = "",
  ...props
}: React.PropsWithChildren<{
  className?: string;
  to: string;
  [key: string]: any;
}>) {
  return (
    <NavLink
      to={to}
      className={cn(className)}
      onMouseEnter={() => {
        console.log("mouse enter");
        SoundService.play.mouseEnterButton();
      }}
      onMouseDown={(e: React.MouseEvent) => {
        console.log(e);
        SoundService.play.mouseClickButton();
      }}
      {...props}
    >
      {children}
    </NavLink>
  );
}
