import React from "react";
import { cn } from "../utils/cn";
import { SoundService } from "../core/service/feedbackService/SoundService";
import { NavLink, useMatch } from "react-router-dom";

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
  const isActive = useMatch({ path: to, end: true });

  return (
    <NavLink
      to={to}
      className={cn(className, isActive && "border-icon-button-border border-1")}
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
