import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Diamond,
  Menu,
  X,
} from "lucide-react";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppMenu from "../components/AppMenu";
import IconButton from "../components/ui/IconButton";
import Button from "../components/ui/Button";
import { cn } from "../utils/cn";
import { DialogProvider } from "../utils/dialog";
import Dialog from "../components/ui/Dialog";
import { isDesktop, isMobile } from "../utils/platform";

export default function App() {
  const [maxmized, setMaxmized] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    getCurrentWindow().onResized(() => {
      getCurrentWindow()
        .isMaximized()
        .then((isMaximized) => {
          setMaxmized(isMaximized);
        });
    });
    window.addEventListener("keyup", (event) => {
      if (event.key === "F5") {
        window.location.reload();
      }
      if (event.key === "Escape") {
        setOpenMenu(false);
      }
    });
  }, []);
  React.useEffect(() => {
    if (maxmized) {
      getCurrentWindow().maximize();
    } else {
      getCurrentWindow().unmaximize();
    }
  }, [maxmized]);

  return (
    <DialogProvider>
      <Dialog />
      <div
        className={cn(
          "relative h-full w-full rounded-xl bg-neutral-950 text-white shadow-2xl",
          {
            "[zoom:0.5]": isMobile,
          },
        )}
        onClick={() => setOpenMenu(false)}
      >
        {/* 叠加层，显示窗口控件 */}
        <div
          className={cn("absolute left-0 top-0 z-40 flex w-full gap-2 p-4", {
            "p-8": isMobile,
          })}
        >
          {/* 菜单按钮 */}
          <div className="relative">
            <IconButton
              onClick={(e) => {
                if (location.pathname !== "/") {
                  navigate("/");
                } else {
                  e.stopPropagation();
                  setOpenMenu(!openMenu);
                }
              }}
            >
              {location.pathname === "/" ? <Menu /> : <ChevronLeft />}
            </IconButton>
            <AppMenu className="absolute top-12" open={openMenu} />
          </div>
          {/* 左上角标题 */}
          <Button data-tauri-drag-region className="hover:cursor-grab active:cursor-grabbing">Project Graph</Button>
          {/* 中间空白 */}
          <div className="flex-1" />
          {/* 右上角窗口控制按钮 */}
          {isDesktop && (
            <Button className="right-4 top-4 flex items-center gap-1">
              <ChevronDown
                onClick={() => getCurrentWindow().minimize()}
                className="transition hover:opacity-80 active:scale-75"
              />
              {maxmized ? (
                <Diamond
                  onClick={() => setMaxmized(false)}
                  size={18}
                  strokeWidth={3}
                  className="transition hover:opacity-80 active:scale-75"
                />
              ) : (
                <ChevronUp
                  onClick={() => setMaxmized(true)}
                  className="transition hover:opacity-80 active:scale-75"
                />
              )}
              <X
                onClick={() => getCurrentWindow().close()}
                className="transition hover:opacity-80 active:scale-75"
              />
            </Button>
          )}
        </div>
        <Outlet />
      </div>
    </DialogProvider>
  );
}
