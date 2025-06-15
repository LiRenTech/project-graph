import { atom, useAtomValue } from "jotai";
import { store } from "../../state";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Vector } from "../dataStruct/Vector";

export namespace SubWindow {
  // export enum IdEnum {}
  export interface Window {
    id: string;
    title: string;
    children: React.ReactNode;
    rect: Rectangle;
    maximized: boolean;
    minimized: boolean;
    // opacity: number;
    focused: boolean;
    zIndex: number;
    titleBarOverlay: boolean;
    closeWhenClickOutside: boolean;
    _closeWhenClickOutsideListener?: (e: PointerEvent) => void;
  }
  const subWindowsAtom = atom<Window[]>([]);
  export const use = () => useAtomValue(subWindowsAtom);
  function getMaxZIndex() {
    return store.get(subWindowsAtom).reduce((maxZIndex, window) => Math.max(maxZIndex, window.zIndex), 0);
  }
  export function create(options: Partial<Window>): Window {
    console.log("尝试创建子窗口", options);
    const win: Window = {
      id: crypto.randomUUID(),
      title: "",
      children: <></>,
      rect: new Rectangle(Vector.getZero(), Vector.same(100)),
      maximized: false,
      minimized: false,
      // opacity: 1,
      focused: false,
      zIndex: getMaxZIndex() + 1,
      titleBarOverlay: false,
      closeWhenClickOutside: false,
      ...options,
    };
    //检测如果窗口到屏幕外面了，自动调整位置
    const { x: width, y: height } = win.rect.size;
    const { innerWidth, innerHeight } = window;
    if (win.rect.location.x + width > innerWidth) {
      win.rect.location.x = innerWidth - width;
    }
    if (win.rect.location.y + height > innerHeight) {
      win.rect.location.y = innerHeight - height;
    }
    // 窗口创建完成，添加到store中
    console.log("创建子窗口成功", win);
    store.set(subWindowsAtom, [...store.get(subWindowsAtom), win]);
    console.log("子窗口列表", store.get(subWindowsAtom));
    if (options.closeWhenClickOutside) {
      win._closeWhenClickOutsideListener = (e: PointerEvent) => {
        if (!get(win.id).rect.isPointIn(new Vector(e.clientX, e.clientY))) {
          close(win.id);
        }
      };
      document.addEventListener("pointerdown", win._closeWhenClickOutsideListener);
    }
    return win;
  }
  export function update(id: string, options: Partial<Omit<Window, "id">>) {
    store.set(
      subWindowsAtom,
      store.get(subWindowsAtom).map((window) => (window.id === id ? { ...window, ...options } : window)),
    );
  }
  export function close(id: string) {
    if (get(id).closeWhenClickOutside) {
      document.removeEventListener("pointerdown", get(id)._closeWhenClickOutsideListener!);
    }
    store.set(
      subWindowsAtom,
      store.get(subWindowsAtom).filter((window) => window.id !== id),
    );
  }
  export function focus(id: string) {
    update(id, { focused: true, zIndex: getMaxZIndex() + 1 });
  }
  export function get(id: string) {
    return store.get(subWindowsAtom).find((window) => window.id === id)!;
  }
}
