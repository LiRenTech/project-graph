import { atom, useAtomValue } from "jotai";
import { store } from "../../state";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Vector } from "../dataStruct/Vector";

export namespace SubWindow {
  // export enum IdEnum {}
  export interface Window {
    /** uuid */
    id: string;
    title: string;
    children: React.ReactNode;
    /** 当大小为(-1,-1)时，则为自适应大小 */
    rect: Rectangle;
    /** 开发中 */
    maximized: boolean;
    /** 开发中 */
    minimized: boolean;
    focused: boolean;
    zIndex: number;
    /**
     * 标题栏区域覆盖在内容之上
     * 设置为true就不能拖动窗口了
     * 可以给窗口内元素添加data-pg-drag-region属性，使其成为可拖动区域
     */
    titleBarOverlay: boolean;
    closing: boolean;
    closeWhenClickOutside: boolean;
    /** @private */
    _closeWhenClickOutsideListener?: (e: PointerEvent) => void;
    closeWhenClickInside: boolean;
  }
  const subWindowsAtom = atom<Window[]>([]);
  export const use = () => useAtomValue(subWindowsAtom);
  function getMaxZIndex() {
    return store.get(subWindowsAtom).reduce((maxZIndex, window) => Math.max(maxZIndex, window.zIndex), 0);
  }
  export function create(options: Partial<Window>): Window {
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
      closing: false,
      closeWhenClickOutside: false,
      closeWhenClickInside: false,
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
  export function update(id: string, options: Partial<Omit<Window, "id">>) {
    store.set(
      subWindowsAtom,
      store.get(subWindowsAtom).map((window) => (window.id === id ? { ...window, ...options } : window)),
    );
  }
  export function close(id: string) {
    if (get(id)?.closeWhenClickOutside) {
      document.removeEventListener("pointerdown", get(id)._closeWhenClickOutsideListener!);
    }
    update(id, { closing: true });
    setTimeout(() => {
      store.set(
        subWindowsAtom,
        store.get(subWindowsAtom).filter((window) => window.id !== id),
      );
    }, 500);
  }
  export function focus(id: string) {
    update(id, { focused: true, zIndex: getMaxZIndex() + 1 });
  }
  export function get(id: string) {
    return store.get(subWindowsAtom).find((window) => window.id === id)!;
  }
}
