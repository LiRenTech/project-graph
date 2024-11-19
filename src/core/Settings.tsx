import { load, Store } from "@tauri-apps/plugin-store";

/**
 * 设置相关的操作
 * 有数据持久化机制
 *
 * windows 在路径 %APPDATA% 下
 */
export namespace Settings {
  let store: Store;
  export type Settings = {
    language: "zh-CN" | "en";
    // 视觉相关
    lineStyle: "straight" | "bezier" | "vertical";
    theme: "black" | "white"; // 暂无
    showGrid: boolean;
    windowBackgroundAlpha: number;
    showDebug: boolean;
    alwaysShowDetails: boolean;
    protectingPrivacy: boolean;
    useNativeTitleBar: boolean;
    // 性能相关
    historySize: number; // 暂无
    renderEffect: boolean;
    // 自动化相关
    autoNamerTemplate: string;
    autoOpenPath: string; // 废弃
    autoSaveWhenClose: boolean;
    // 控制相关
    enableCollision: boolean; // 暂无
    scaleExponent: number;
    allowMoveCameraByWSAD: boolean;
    moveAmplitude: number;
    moveFriction: number;
    gamepadDeadzone: number;

    // github 相关
    githubToken: string;
    githubUser: string;
  };
  const defaultSettings: Settings = {
    language: "en",
    // 视觉相关
    lineStyle: "straight",
    theme: "black",
    showGrid: true,
    windowBackgroundAlpha: 0.8,
    showDebug: true,
    alwaysShowDetails: false,
    protectingPrivacy: false,
    useNativeTitleBar: false,
    // 性能相关
    historySize: 20,
    renderEffect: true,
    // 自动命名相关
    autoNamerTemplate: "...",
    autoOpenPath: "", // 废弃
    autoSaveWhenClose: false,
    // 控制相关
    enableCollision: true,
    scaleExponent: 0.11,
    allowMoveCameraByWSAD: false,
    moveAmplitude: 2,
    moveFriction: 0.1,
    gamepadDeadzone: 0.1,

    // github 相关
    githubToken: "",
    githubUser: "",
  };

  export async function init() {
    store = await load("settings.json");
    store.save();
  }

  export async function get<K extends keyof Settings>(
    key: K,
  ): Promise<Settings[K]> {
    const res = await store.get<Settings[K]>(key);
    if (typeof res === "undefined") {
      console.log(
        `settings.${key} not found, use default value ${defaultSettings[key]}`,
      );
      return defaultSettings[key];
    } else {
      return res;
    }
  }

  const callbacks: {
    [key: string]: Array<(value: any) => void>;
  } = {};

  export function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    store.set(key, value);
    store.save();

    // 调用所有监听该键的回调函数
    if (callbacks[key]) {
      callbacks[key].forEach((callback) => callback(value));
    }
  }

  /**
   * 监听某个设置的变化，监听后会调用一次回调函数
   * @param key 要监听的设置键
   * @param callback 设置变化时的回调函数
   */
  export function watch<K extends keyof Settings>(
    key: K,
    callback: (value: Settings[K]) => void,
  ) {
    if (!callbacks[key]) {
      callbacks[key] = [];
    }
    callbacks[key].push(callback);
    get(key).then((value) => callback(value));
  }
}
