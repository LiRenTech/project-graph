import { Store } from "@tauri-apps/plugin-store";
import { createStore } from "../utils/store";
import { Vector } from "./dataStruct/Vector";

/**
 * 用于管理快捷键绑定
 * @example
 * (await KeyBinds.create("move", "w", { control: true, shift: true }))
 *   .down(() => console.log("move up"))
 */
export namespace KeyBinds {
  /** ？ */
  export type KeyModifiers = {
    /** 是否按下了Ctrl键 */
    control: boolean;
    /** 是否按下了Alt键 */
    alt: boolean;
    /** 是否按下了Shift键 */
    shift: boolean;
  };

  let store: Store | null = null;

  export async function init() {
    store = await createStore("keybinds.json");
  }

  export async function set(id: string, key: string, modifiers: KeyModifiers) {
    if (!store) {
      throw new Error("Store not initialized.");
    }
    await store.set(id, { key, modifiers });
    if (callbacks[id]) {
      callbacks[id].forEach((cb) => cb(key, modifiers));
    }
  }

  export async function get(
    id: string,
  ): Promise<{ key: string; modifiers: KeyModifiers } | null> {
    if (!store) {
      throw new Error("Store not initialized.");
    }
    const data = await store.get<{ key: string; modifiers: KeyModifiers }>(id);
    return data || null;
  }

  const callbacks: {
    [key: string]: Array<(key: string, modifiers: KeyModifiers) => void>;
  } = {};

  export async function watch(
    id: string,
    callback: (key: string, modifiers: KeyModifiers) => void,
  ) {
    if (!store) {
      throw new Error("Store not initialized.");
    }
    const data = await store.get<{ key: string; modifiers: KeyModifiers }>(id);
    if (data) {
      callbacks[id] = callbacks[id] || [];
      callbacks[id].push(callback);
      callback(data.key, data.modifiers);
    } else {
      throw new Error(`Keybind ${id} not found.`);
    }
    return () => {
      callbacks[id] = callbacks[id].filter((cb) => cb !== callback);
    };
  }

  /**
   * 获取所有快捷键绑定
   * @returns
   */
  export async function entries() {
    if (!store) {
      throw new Error("Store not initialized.");
    }
    return await store.entries<{ key: string; modifiers: KeyModifiers }>();
  }

  const registered: Set<string> = new Set();

  /**
   * 仅限在最开始的时候注册快捷键
   * @param id 快捷键的英文字段名
   * @param defaultKey 默认按下的字母
   * @param defaultModifiers_ 配合字母的修饰键，比如{control: true, shift: true}
   * @returns
   */
  export async function create(
    id: string,
    defaultKey: string,
    defaultModifiers_: Partial<KeyModifiers> = {
      control: false,
      alt: false,
      shift: false,
    },
  ): Promise<_Bind> {
    const defaultModifiers = {
      control: defaultModifiers_.control || false,
      alt: defaultModifiers_.alt || false,
      shift: defaultModifiers_.shift || false,
    };
    if (registered.has(id)) {
      throw new Error(`Keybind ${id} already registered.`);
    }
    registered.add(id);
    let data = await get(id);
    if (!data) {
      // 注册新的快捷键
      await set(id, defaultKey, defaultModifiers);
      data = { key: defaultKey, modifiers: defaultModifiers };
    }
    const obj = new _Bind(id, data.key, data.modifiers);
    // 监听快捷键变化
    await watch(id, (key, modifiers) => {
      obj.key = key;
      obj.modifiers = modifiers;
    });
    return obj;
  }

  class _Bind {
    public button: number = -1;
    private start: Vector | null = null;
    // @ts-expect-error todo:dblclick
    private lastMatch: number = 0;

    constructor(
      public id: string,
      public key: string,
      public modifiers: KeyModifiers,
    ) {
      if (key.startsWith("mouse")) {
        this.button = +key.slice(5);
      }
      window.addEventListener("mousedown", (event) => {
        if (this.matches(event)) {
          this.start = new Vector(event.clientX, event.clientY);
        }
      });
      window.addEventListener("mouseup", (event) => {
        if (this.matches(event)) {
          this.start = null;
        }
      });
    }

    private matches(event: KeyboardEvent | MouseEvent | WheelEvent): boolean {
      const matchModifiers =
        this.modifiers.control === event.ctrlKey &&
        this.modifiers.alt === event.altKey &&
        this.modifiers.shift === event.shiftKey;
      const matchKey =
        event instanceof KeyboardEvent &&
        event.key.toLowerCase() === this.key.toLowerCase();
      const matchButton =
        event instanceof MouseEvent && event.button === this.button;
      const matchWheel =
        event instanceof WheelEvent &&
        ((event.deltaY < 0 && this.key === "wheelup") ||
          (event.deltaY > 0 && this.key === "wheeldown"));
      const match = matchModifiers && (matchKey || matchButton || matchWheel);
      if (match) {
        this.lastMatch = Date.now();
      }
      return match;
    }

    public down(handler: () => void) {
      window.addEventListener("keydown", (event) => {
        if (this.matches(event)) {
          handler();
        }
      });
      window.addEventListener("mousedown", (event) => {
        if (this.matches(event)) {
          handler();
        }
      });
      window.addEventListener("wheel", (event) => {
        if (this.matches(event)) {
          handler();
        }
      });
    }
    public up(handler: () => void) {
      window.addEventListener("keyup", (event) => {
        if (this.matches(event)) {
          handler();
        }
      });
      window.addEventListener("mouseup", (event) => {
        if (this.matches(event)) {
          handler();
        }
      });
    }
    public drag(handler: (start: Vector) => void) {
      window.addEventListener("mousemove", (event) => {
        if (this.start && this.matches(event)) {
          const end = new Vector(event.clientX, event.clientY);
          handler(this.start);
          this.start = end;
        }
      });
    }
  }
}
