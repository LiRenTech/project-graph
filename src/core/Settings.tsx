import { createStore, Store } from "@tauri-apps/plugin-store";

export namespace Settings {
  let store: Store;
  export type Settings = {
    lineStyle: "stright" | "bezier";
    theme: "";
    showGrid: boolean;
    showDebug: boolean;
    enableCollision: boolean;
    scaleExponent: number;
    moveAmplitude: number;
    moveFriction: number;
    alwaysShowDetails: boolean;
    historySize: number;
    autoNamerTemplate: string;
  };
  const defaultSettings: Settings = {
    lineStyle: "stright",
    theme: "",
    showGrid: true,
    showDebug: true,
    enableCollision: true,
    scaleExponent: 1.1,
    moveAmplitude: 2,
    moveFriction: 0.1,
    alwaysShowDetails: false,
    historySize: 20,
    autoNamerTemplate: "...",
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
