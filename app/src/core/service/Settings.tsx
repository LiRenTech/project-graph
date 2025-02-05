import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import { createStore } from "../../utils/store";

/**
 * 设置相关的操作
 * 有数据持久化机制
 *
 * windows 在路径 %APPDATA% 下
 */
export namespace Settings {
  let store: Store;
  // 注意：下拉菜单框必须要在语言包里面配置才能生效，否则菜单项是 Error: Option Not Found
  export type Settings = {
    language: "zh_CN" | "zh_TW" | "en";
    updateChannel: "latest" | "nightly";
    // 视觉相关
    lineStyle: "straight" | "bezier" | "vertical";
    theme: "black" | "white" | "macaron" | "morandi";
    uiTheme: "light" | "dark" | "macaron" | "morandi";
    isRenderCenterPointer: boolean;
    showGrid: boolean; // 废弃
    showBackgroundHorizontalLines: boolean;
    showBackgroundVerticalLines: boolean;
    showBackgroundDots: boolean;
    showBackgroundCartesian: boolean;
    windowBackgroundAlpha: number;
    showDebug: boolean;
    alwaysShowDetails: boolean;
    protectingPrivacy: boolean;
    useNativeTitleBar: boolean;
    entityDetailsFontSize: number;
    entityDetailsLinesLimit: number;
    entityDetailsWidthLimit: number;
    limitCameraInCycleSpace: boolean;
    cameraCycleSpaceSizeX: number;
    cameraCycleSpaceSizeY: number;
    // 性能相关
    historySize: number; // 暂无
    effectsPerferences: Record<string, boolean>;
    isEnableEntityCollision: boolean;
    // 自动化相关
    autoNamerTemplate: string;
    autoNamerSectionTemplate: string;
    autoOpenPath: string; // 废弃
    autoSaveWhenClose: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
    autoBackup: boolean;
    autoBackupInterval: number;
    autoBackupDraftPath: string;
    // 控制相关
    enableCollision: boolean; // 暂无
    enableDragAutoAlign: boolean;
    rectangleSelectWhenLeft: "intersect" | "contain";
    rectangleSelectWhenRight: "intersect" | "contain";
    scaleExponent: number;
    allowMoveCameraByWSAD: boolean;
    cameraKeyboardMoveReverse: boolean;
    scaleCameraByMouseLocation: boolean;
    cameraKeyboardScaleRate: number;
    allowAddCycleEdge: boolean;
    moveAmplitude: number;
    moveFriction: number;
    gamepadDeadzone: number;
    mouseRightDragBackground: "cut" | "moveCamera";
    textNodeContentLineBreak: "enter" | "ctrlEnter" | "altEnter" | "shiftEnter";
    textNodeExitEditMode: "enter" | "ctrlEnter" | "altEnter" | "shiftEnter";
    textNodeStartEditMode: "enter" | "ctrlEnter" | "altEnter" | "shiftEnter";
    textNodeSelectAllWhenStartEditByKeyboard: boolean;
    textNodeSelectAllWhenStartEditByMouseClick: boolean;
    // 音效相关
    soundEnabled: boolean;
    cuttingLineStartSoundFile: string;
    connectLineStartSoundFile: string;
    connectFindTargetSoundFile: string;
    cuttingLineReleaseSoundFile: string;
    alignAndAttachSoundFile: string;
    // github 相关
    githubToken: string;
    githubUser: string;
  };
  export const defaultSettings: Settings = {
    language: "zh_CN",
    updateChannel: "latest",
    // 视觉相关
    lineStyle: "straight",
    theme: "black",
    uiTheme: "dark",
    isRenderCenterPointer: false,
    showGrid: true,
    showBackgroundHorizontalLines: false,
    showBackgroundVerticalLines: false,
    showBackgroundDots: true,
    showBackgroundCartesian: false,
    windowBackgroundAlpha: 0.9,
    showDebug: true,
    alwaysShowDetails: false,
    protectingPrivacy: false,
    useNativeTitleBar: false,
    entityDetailsFontSize: 18,
    entityDetailsLinesLimit: 4,
    entityDetailsWidthLimit: 200,
    limitCameraInCycleSpace: false,
    cameraCycleSpaceSizeX: 1000,
    cameraCycleSpaceSizeY: 1000,
    // 性能相关
    historySize: 20,
    effectsPerferences: {},
    isEnableEntityCollision: false,
    // 自动相关
    autoNamerTemplate: "...",
    autoNamerSectionTemplate: "Section_{{i}}",
    autoOpenPath: "", // 废弃
    autoSaveWhenClose: false,
    autoSave: true,
    autoSaveInterval: 10,
    autoBackup: true,
    autoBackupInterval: 600,
    autoBackupDraftPath: "",
    // 控制相关
    enableCollision: true,
    enableDragAutoAlign: true,
    rectangleSelectWhenLeft: "contain",
    rectangleSelectWhenRight: "intersect",
    scaleExponent: 0.11,
    allowMoveCameraByWSAD: false,
    cameraKeyboardMoveReverse: false,
    scaleCameraByMouseLocation: true,
    cameraKeyboardScaleRate: 0.2,
    allowAddCycleEdge: false,
    moveAmplitude: 2,
    moveFriction: 0.1,
    gamepadDeadzone: 0.1,
    mouseRightDragBackground: "cut",
    textNodeContentLineBreak: "enter",
    textNodeExitEditMode: "ctrlEnter",
    textNodeStartEditMode: "enter",
    textNodeSelectAllWhenStartEditByKeyboard: false,
    textNodeSelectAllWhenStartEditByMouseClick: true,
    // 音效相关
    soundEnabled: true,
    cuttingLineStartSoundFile: "",
    connectLineStartSoundFile: "",
    connectFindTargetSoundFile: "",
    cuttingLineReleaseSoundFile: "",
    alignAndAttachSoundFile: "",
    // github 相关
    githubToken: "",
    githubUser: "",
  };

  export async function init() {
    store = await createStore("settings.json");
    // 调用所有watcher
    Object.entries(callbacks).forEach(([key, callbacks]) => {
      callbacks.forEach((callback) => {
        get(key as keyof Settings).then((value) => {
          callback(value);
        });
      });
    });
  }

  export async function get<K extends keyof Settings>(key: K): Promise<Settings[K]> {
    const res = await store.get<Settings[K]>(key);
    if (typeof res === "undefined") {
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
  export function watch<K extends keyof Settings>(key: K, callback: (value: Settings[K]) => void) {
    if (!callbacks[key]) {
      callbacks[key] = [];
    }
    callbacks[key].push(callback);
    if (store) {
      get(key).then((value) => {
        console.log(callback, value);
        callback(value);
      });
    }
  }

  /**
   * react hook
   */
  export function use<K extends keyof Settings>(key: K): [Settings[K], (value: Settings[K]) => void] {
    const [value, setValue] = useState<Settings[K]>(defaultSettings[key]);

    useEffect(() => {
      get(key).then(setValue);
    }, []);

    useEffect(() => {
      set(key, value);
    }, [value]);

    return [value, setValue];
  }
}
