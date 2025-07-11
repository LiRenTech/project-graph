import { Store } from "@tauri-apps/plugin-store";
import { matchEmacsKey } from "../../../../utils/emacs";
import { createStore } from "../../../../utils/store";
import { Vector } from "../../../dataStruct/Vector";
import { Project, service } from "../../../Project";

/**
 * 用于管理快捷键绑定
 */
@service("keyBinds")
export class KeyBinds {
  private store: Store | null = null;

  constructor(private readonly project: Project) {
    createStore("keybinds.json").then((store) => {
      this.store = store;
    });
  }

  async set(id: string, key: string) {
    if (!this.store) {
      throw new Error("Store not initialized.");
    }
    await this.store.set(id, key);
  }

  async get(id: string): Promise<string | null> {
    if (!this.store) {
      throw new Error("Store not initialized.");
    }
    const data = await this.store.get<string>(id);
    return data || null;
  }

  /**
   * 让某一个快捷键开始监听
   * @param id
   * @param callback
   * @returns
   */
  async watch(id: string, callback: (key: string) => void) {
    if (!this.store) {
      throw new Error("Store not initialized.");
    }
    const data = await this.store.get<string>(id);
    if (data) {
      callback(data);
      return this.store.onChange<string>((changedId, data) => {
        if (changedId !== id) return;
        if (!data) return;
        callback(data);
      });
    } else {
      throw new Error(`Keybind ${id} not found.`);
    }
  }

  /**
   * 获取所有快捷键绑定
   * @returns
   */
  async entries() {
    if (!this.store) {
      throw new Error("Keybind Store not initialized.");
    }
    return await this.store.entries<string>();
  }

  // 仅用于初始化软件时注册快捷键
  registered: Set<string> = new Set();

  async create(id: string, defaultKey: string, onPress?: () => void): Promise<_Bind> {
    if (this.registered.has(id)) {
      throw new Error(`Keybind ${id} 已经注册过了`);
    }
    this.registered.add(id);
    let userSetKey = await this.get(id);
    if (!userSetKey) {
      // 注册新的快捷键
      await this.set(id, defaultKey);
      userSetKey = defaultKey;
    }
    const obj = new _Bind(this.project, id, userSetKey);
    if (onPress) {
      obj.down(onPress);
    }
    // 监听快捷键变化
    await this.watch(id, (key) => {
      obj.key = key;
    });
    return obj;
  }
}

class _Bind {
  public button: number = -1;
  private start: Vector | null = null;
  // @ts-expect-error // TODO: dblclick
  private lastMatch: number = 0;

  constructor(
    private readonly project: Project,
    public id: string,
    public key: string,
  ) {
    this.project.canvas.element.addEventListener("mousedown", (event) => {
      if (matchEmacsKey(this.key, event)) {
        this.start = new Vector(event.clientX, event.clientY);
      }
    });
    this.project.canvas.element.addEventListener("mouseup", (event) => {
      if (matchEmacsKey(this.key, event)) {
        this.start = null;
      }
    });
  }

  /**
   * 快捷键按下的时候触发的函数
   * @param handler
   */
  public down(handler: () => void) {
    this.project.canvas.element.addEventListener("keydown", (event) => {
      if (matchEmacsKey(this.key, event)) {
        handler();
      }
    });
    this.project.canvas.element.addEventListener("mousedown", (event) => {
      if (matchEmacsKey(this.key, event)) {
        handler();
      }
    });
    this.project.canvas.element.addEventListener("wheel", (event) => {
      if (matchEmacsKey(this.key, event)) {
        handler();
      }
    });
    return this;
  }
  /**
   * 快捷键按下并抬起的时候触发的函数
   * @param handler
   */
  public up(handler: () => void) {
    this.project.canvas.element.addEventListener("keyup", (event) => {
      if (matchEmacsKey(this.key, event)) {
        handler();
      }
    });
    this.project.canvas.element.addEventListener("mouseup", (event) => {
      if (matchEmacsKey(this.key, event)) {
        handler();
      }
    });
    return this;
  }

  /**
   * 快捷键鼠标拖动的时候触发的函数
   * @param handler
   */
  public drag(handler: (start: Vector) => void) {
    this.project.canvas.element.addEventListener("mousemove", (event) => {
      if (this.start && matchEmacsKey(this.key, event)) {
        const end = new Vector(event.clientX, event.clientY);
        handler(this.start);
        this.start = end;
      }
    });
    return this;
  }
}
