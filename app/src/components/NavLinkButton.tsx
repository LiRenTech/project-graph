import React from "react";
import { NavLink, useMatch } from "react-router-dom";
import { SoundService } from "@/core/service/feedbackService/SoundService";
import { cn } from "@/utils/cn";

export default function NavLink({
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
      className={cn(className, isActive && "el-nav-link border-1")}
      onMouseEnter={() => {
        SoundService.play.mouseEnterButton();
      }}
      onMouseDown={() => {
        SoundService.play.mouseClickButton();
      }}
      {...props}
    >
      {children}
    </NavLink>
  );
}
