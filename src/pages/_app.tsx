import { getCurrentWindow } from "@tauri-apps/api/window";
import { ChevronDown, ChevronUp, Diamond, X } from "lucide-react";
import React from "react";
import { Outlet } from "react-router-dom";
import AppMenu from "../components/AppMenu";

export default function App() {
  const [maxmized, setMaxmized] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);

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
    <div
      className="relative h-full w-full rounded-xl bg-neutral-950 text-white shadow-2xl"
      onMouseDown={() => setOpenMenu(false)}
    >
      {/* 叠加层，显示窗口控件 */}
      <div className="pointer-events-none absolute left-0 top-0 z-50 h-full w-full *:pointer-events-auto *:absolute *:rounded-md *:border *:border-neutral-700 *:bg-neutral-800 *:px-3 *:py-2 *:text-white">
        {/* 左上角标题 */}
        <div
          // data-tauri-drag-region
          className="left-4 top-4 flex flex-col"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <span>Project Graph</span>
          <AppMenu
            className="absolute -translate-x-3 translate-y-12"
            open={openMenu}
          />
        </div>
        {/* 右上角窗口控制按钮 */}
        <div className="right-4 top-4 flex items-center gap-1 *:cursor-pointer">
          <ChevronDown onClick={() => getCurrentWindow().minimize()} />
          {maxmized ? (
            <Diamond onClick={() => setMaxmized(false)} size={18} />
          ) : (
            <ChevronUp onClick={() => setMaxmized(true)} />
          )}
          <X onClick={() => getCurrentWindow().close()} />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
