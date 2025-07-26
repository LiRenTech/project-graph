import { Queue } from "@graphif/data-structures";
import { Store } from "@tauri-apps/plugin-store";
import { matchEmacsKey } from "../../../../utils/emacs";
import { createStore } from "../../../../utils/store";
import { Project, service } from "../../../Project";

/**
 * 用于管理快捷键绑定
 */
@service("keyBinds")
export class KeyBinds {
  private store: Store | null = null;

  constructor(private readonly project: Project) {
    (async () => {
      this.store = await createStore("keybinds.json");
      await this.project.keyBindsRegistrar.registerKeyBinds();
      if ((await this.store.values()).find((it) => typeof it !== "string")) {
        // 重置store
        await this.store.clear();
      }
    })();
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
  // TODO: watch
  // async watch(id: string, callback: (key: string) => void) {
  //   if (!this.store) {
  //     throw new Error("Store not initialized.");
  //   }
  //   const data = await this.store.get<string>(id);
  //   if (data) {
  //     callback(data);
  //     return this.store.onChange<string>((changedId, data) => {
  //       if (changedId !== id) return;
  //       if (!data) return;
  //       callback(data);
  //     });
  //   } else {
  //     throw new Error(`Keybind ${id} not found.`);
  //   }
  // }

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

  async create(id: string, defaultKey: string, onPress = () => {}): Promise<_Bind> {
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
    const obj = new _Bind(this.project, id, userSetKey, onPress);
    // 监听快捷键变化
    await this.watch(id, (key) => {
      obj.key = key;
    });
    return obj;
  }
}

class _Bind {
  public button: number = -1;
  // @ts-expect-error // TODO: dblclick
  private lastMatch: number = 0;
  private events = new Queue<MouseEvent | KeyboardEvent | WheelEvent>();

  private enqueue(event: MouseEvent | KeyboardEvent | WheelEvent) {
    // 队列里面最多20个
    while (this.events.length >= 20) {
      this.events.dequeue();
    }
    this.events.enqueue(event);
  }
  private check() {
    if (matchEmacsKey(this.key, this.events.arrayList)) {
      this.onPress();
    }
  }

  constructor(
    private readonly project: Project,
    public id: string,
    public key: string,
    private readonly onPress: () => void,
  ) {
    // 有任意事件时，管它是什么，都放进队列
    this.project.canvas.element.addEventListener("mousedown", (event) => {
      this.enqueue(event);
      this.check();
    });
    this.project.canvas.element.addEventListener("keydown", (event) => {
      if (["control", "alt", "shift", "meta"].includes(event.key.toLowerCase())) return;
      this.enqueue(event);
      this.check();
    });
    this.project.canvas.element.addEventListener("wheel", (event) => {
      this.enqueue(event);
      this.check();
    });
  }
}
