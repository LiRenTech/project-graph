import { createStore, Store } from "@tauri-apps/plugin-store";

export namespace Settings {
  let store: Store;
  export type Settings = {
    // 视觉相关
    lineStyle: "stright" | "bezier";
    theme: "";
    showGrid: boolean;
    windowBackgroundAlpha: number;
    showDebug: boolean;
    alwaysShowDetails: boolean;
    // 物理相关
    enableCollision: boolean;
    scaleExponent: number;
    moveAmplitude: number;
    moveFriction: number;
    // 性能相关
    historySize: number;
    // 自动命名相关
    autoNamerTemplate: string;
    // github 相关
    githubToken: string;
    githubUser: string;
  };
  const defaultSettings: Settings = {
    // 视觉相关
    lineStyle: "stright",
    theme: "",
    showGrid: true,
    windowBackgroundAlpha: 0.8,
    showDebug: true,
    alwaysShowDetails: false,
    // 物理相关
    enableCollision: true,
    scaleExponent: 1.1,
    moveAmplitude: 2,
    moveFriction: 0.1,
    // 性能相关
    historySize: 20,
    // 自动命名相关
    autoNamerTemplate: "...",
    // github 相关
    githubToken: "",
    githubUser: "",
  };

  export async function init() {
    store = await createStore("settings.json");
  }

  export function get<K extends keyof Settings>(key: K) {
    return store.get<Settings[K]>(key) || defaultSettings[key];
  }

  export function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    store.set(key, value);
    store.save();
  }
}
