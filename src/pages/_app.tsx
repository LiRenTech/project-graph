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
import AppMenu from "./_app_menu";
import IconButton from "../components/ui/IconButton";
import Button from "../components/ui/Button";
import { cn } from "../utils/cn";
import Dialog from "../components/ui/Dialog";
import { appScale, isDesktop, isMobile } from "../utils/platform";
import { useRecoilState } from "recoil";
import { fileAtom } from "../state";
import RecentFilesPanel from "./_recent_files_panel";
import { Settings } from "../core/Settings";
import ErrorHandler from "./_error_handler";

export default function App() {
  const [maxmized, setMaxmized] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [file] = useRecoilState(fileAtom);
  const [backgroundOpacity, setBackgroundOpacity] = React.useState(0.5);

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
      (() => {
        throw new TypeError("test error");
      })();
    });
    window.addEventListener("pointerdown", () => {
      setOpenMenu(false);
    });
    Settings.get("windowBackgroundAlpha").then((alpha) => {
      if (alpha) {
        setBackgroundOpacity(alpha);
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
    <div
      className={cn("relative h-full w-full rounded-xl text-white shadow-2xl", {
        "bg-neutral-950": isMobile || location.pathname !== "/",
      })}
      style={{ zoom: appScale }}
      onClick={() => setOpenMenu(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Dialog />
      <ErrorHandler />
      {/* 叠加层，显示窗口控件 */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-40 flex w-full gap-2 p-4 transition-all *:pointer-events-auto",
          {
            "p-8": isMobile,
          },
        )}
      >
        {/* 菜单按钮 */}
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
        <AppMenu className="absolute top-20" open={openMenu} />
        <RecentFilesPanel />
        {/* 左上角标题 */}
        <Button
          data-tauri-drag-region
          className="hover:cursor-grab active:cursor-grabbing"
        >
          {file
            .split("/")
            .at(-1)
            ?.replace(/\.json/, "")}
        </Button>
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
                size={16}
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
      {isDesktop && (
        <div
          className={cn("absolute left-0 top-0 -z-10 h-full w-full")}
          style={{
            backgroundColor: "#2b2b2b",
            opacity: `${backgroundOpacity * 100}%`,
          }}
        ></div>
      )}
    </div>
  );
}
