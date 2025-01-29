import {
  getCurrentWindow as tauriGetCurrentWindow,
  Window,
} from "@tauri-apps/api/window";
import { family as osFamily, platform } from "@tauri-apps/plugin-os";

export const isWeb = window.__TAURI_OS_PLUGIN_INTERNALS__ === undefined;
export const isMobile = isWeb
  ? navigator.userAgent.toLowerCase().includes("mobile")
  : platform() === "android";
export const isDesktop = !isMobile;
export const isMac = !isWeb && platform() === "macos";
export const appScale = isMobile ? 0.5 : 1;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const webFileApiSupport = !!window.showDirectoryPicker;

export function family() {
  if (isWeb) {
    // 从userAgent判断unix|windows
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("windows")) {
      return "windows";
    } else {
      return "unix";
    }
  } else {
    return osFamily();
  }
}

export function getCurrentWindow(): Window {
  if (isWeb) {
    return new Proxy(
      {},
      {
        get() {
          return async () => {};
        },
      },
    ) as Window;
  } else {
    return tauriGetCurrentWindow();
  }
}
