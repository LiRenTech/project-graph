import { atom, useAtomValue } from "jotai";
import { store } from "../../state";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Vector } from "../dataStruct/Vector";

export namespace SubWindow {
  // export enum IdEnum {}
  export interface Window {
    /**
     * 唯一的id，不能重复，如果创建了已经存在的id，会聚焦到已存在的窗口
     * 可以是负数，可以不连续
     */
    id: number;
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
    // if (options.id && store.get(subWindowsAtom).some((window) => window.id === options.id)) {
    //   // 如果已经存在的id，聚焦到已存在的窗口
    //   focus(options.id);
    //   return store.get(subWindowsAtom).find((window) => window.id === options.id)!;
    // }
    const win: Window = {
      id: store.get(subWindowsAtom).reduce((maxId, window) => Math.max(maxId, window.id), 0) + 1,
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
    store.set(subWindowsAtom, [...store.get(subWindowsAtom), win]);
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
  export function update(id: number, options: Partial<Omit<Window, "id">>) {
    store.set(
      subWindowsAtom,
      store.get(subWindowsAtom).map((window) => (window.id === id ? { ...window, ...options } : window)),
    );
  }
  export function close(id: number) {
    if (get(id).closeWhenClickOutside) {
      document.removeEventListener("pointerdown", get(id)._closeWhenClickOutsideListener!);
    }
    store.set(
      subWindowsAtom,
      store.get(subWindowsAtom).filter((window) => window.id !== id),
    );
  }
  export function focus(id: number) {
    update(id, { focused: true, zIndex: getMaxZIndex() + 1 });
  }
  export function get(id: number) {
    return store.get(subWindowsAtom).find((window) => window.id === id)!;
  }
}
