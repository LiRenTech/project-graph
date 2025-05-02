import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import { createStore } from "../../utils/store";
import { appCacheDir } from "@tauri-apps/api/path";
import { PathString } from "../../utils/pathString";
import { isWeb } from "../../utils/platform";

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
    theme: string;
    showTipsOnUI: boolean;
    isClassroomMode: boolean;
    isRenderCenterPointer: boolean;
    showGrid: boolean; // 废弃
    showBackgroundHorizontalLines: boolean;
    showBackgroundVerticalLines: boolean;
    showBackgroundDots: boolean;
    showBackgroundCartesian: boolean;
    windowBackgroundAlpha: number;
    enableTagTextNodesBigDisplay: boolean;
    showDebug: boolean;
    alwaysShowDetails: boolean;
    protectingPrivacy: boolean;
    useNativeTitleBar: boolean;
    entityDetailsFontSize: number;
    entityDetailsLinesLimit: number;
    entityDetailsWidthLimit: number;
    nodeDetailsPanel: "small" | "vditor";
    sectionBitTitleRenderType: "top" | "cover" | "none";

    windowCollapsingWidth: number;
    windowCollapsingHeight: number;

    limitCameraInCycleSpace: boolean;
    cameraCycleSpaceSizeX: number;
    cameraCycleSpaceSizeY: number;
    cameraResetViewPaddingRate: number;
    // 性能相关
    compatibilityMode: boolean;
    historySize: number; // 暂无
    autoRefreshStageByMouseAction: boolean;
    // 特效开关列表
    effectsPerferences: Record<string, boolean>;
    isEnableEntityCollision: boolean;
    textIntegerLocationAndSizeRender: boolean;
    isPauseRenderWhenManipulateOvertime: boolean;
    renderOverTimeWhenNoManipulateTime: number;
    ignoreTextNodeTextRenderLessThanCameraScale: number;
    // 自动化相关
    autoNamerTemplate: string;
    autoNamerSectionTemplate: string;

    autoFillNodeColor: [number, number, number, number]; // 不在设置面板中
    autoFillNodeColorEnable: boolean;
    autoFillPenStrokeColor: [number, number, number, number];
    autoFillPenStrokeColorEnable: boolean;

    autoFillEdgeColor: [number, number, number, number]; // 不在设置面板中
    autoOpenPath: string; // 废弃
    autoSaveWhenClose: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
    autoBackup: boolean;
    autoBackupInterval: number;
    autoBackupDraftPath: string;
    autoBackupLimitCount: number;
    generateTextNodeByStringTabCount: number; // 仅在生成节点面板中使用
    // 控制相关
    enableCollision: boolean; // 暂无
    enableDragAutoAlign: boolean;
    enableDragAlignToGrid: boolean;
    enableWindowsTouchPad: boolean;
    rectangleSelectWhenLeft: "intersect" | "contain";
    rectangleSelectWhenRight: "intersect" | "contain";
    scaleExponent: number;
    allowMoveCameraByWSAD: boolean;
    cameraFollowsSelectedNodeOnArrowKeys: boolean;
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
    textNodeStartEditMode: "enter" | "ctrlEnter" | "altEnter" | "shiftEnter" | "space";
    textNodeSelectAllWhenStartEditByKeyboard: boolean;
    textNodeSelectAllWhenStartEditByMouseClick: boolean;
    mouseWheelMode: "zoom" | "move" | "moveX" | "none";
    mouseWheelWithShiftMode: "zoom" | "move" | "moveX" | "none";
    mouseWheelWithCtrlMode: "zoom" | "move" | "moveX" | "none";
    mouseWheelWithAltMode: "zoom" | "move" | "moveX" | "none";
    mouseSideWheelMode:
      | "zoom"
      | "move"
      | "moveX"
      | "none"
      | "cameraMoveToMouse"
      | "adjustWindowOpacity"
      | "adjustPenStrokeWidth";
    doubleClickMiddleMouseButton: "none" | "adjustCamera";
    // mac相关的特殊控制
    // 触摸版和鼠标滚轮的区分逻辑
    macTrackpadAndMouseWheelDifference: "trackpadIntAndWheelFloat" | "tarckpadFloatAndWheelInt";
    macMouseWheelIsSmoothed: boolean; // mac 的鼠标滚轮是否开启了平滑滚动
    macTrackpadScaleSensitivity: number; // mac 触控板缩放灵敏度，默认 0.5
    // 音效相关
    soundEnabled: boolean;
    cuttingLineStartSoundFile: string;
    connectLineStartSoundFile: string;
    connectFindTargetSoundFile: string;
    cuttingLineReleaseSoundFile: string;
    alignAndAttachSoundFile: string;
    uiButtonEnterSoundFile: string;
    uiButtonClickSoundFile: string;
    uiSwitchButtonOnSoundFile: string;
    uiSwitchButtonOffSoundFile: string;
    // github 相关
    githubToken: string;
    githubUser: string;
  };
  export const defaultSettings: Settings = {
    language: "zh_CN",
    updateChannel: "latest",
    // 视觉相关
    lineStyle: "straight",
    theme: "park",
    showTipsOnUI: true,
    isClassroomMode: false,
    isRenderCenterPointer: false,
    showGrid: true,
    showBackgroundHorizontalLines: true,
    showBackgroundVerticalLines: true,
    showBackgroundDots: false,
    showBackgroundCartesian: true, // 1.4.17 开始必须要默认显示坐标系，没有坐标系可能会让用户迷路
    windowBackgroundAlpha: 0.9,
    enableTagTextNodesBigDisplay: true,
    showDebug: false, // 从1.4.7开始，以后用户安装软件后不默认显示调试信息，进而避免出现让用户感到困惑“这一大堆字是什么”
    alwaysShowDetails: false,
    protectingPrivacy: false,
    useNativeTitleBar: false,
    entityDetailsFontSize: 18,
    entityDetailsLinesLimit: 4,
    entityDetailsWidthLimit: 200,
    nodeDetailsPanel: "vditor",
    sectionBitTitleRenderType: "cover",

    windowCollapsingWidth: 300,
    windowCollapsingHeight: 300,

    limitCameraInCycleSpace: false,
    cameraCycleSpaceSizeX: 1000,
    cameraCycleSpaceSizeY: 1000,
    cameraResetViewPaddingRate: 1.5,
    // 性能相关
    compatibilityMode: false,
    historySize: 20,
    effectsPerferences: {},
    isEnableEntityCollision: false,
    textIntegerLocationAndSizeRender: false,
    isPauseRenderWhenManipulateOvertime: true,
    renderOverTimeWhenNoManipulateTime: 5,
    ignoreTextNodeTextRenderLessThanCameraScale: 0.065,
    autoRefreshStageByMouseAction: true,
    // 自动相关
    autoNamerTemplate: "...",
    autoNamerSectionTemplate: "Section_{{i}}",
    autoFillNodeColor: [0, 0, 0, 0],
    autoFillNodeColorEnable: true,
    autoFillEdgeColor: [0, 0, 0, 0],
    autoFillPenStrokeColor: [0, 0, 0, 0],
    autoFillPenStrokeColorEnable: true,
    autoOpenPath: "", // 废弃
    autoSaveWhenClose: false,
    autoSave: true,
    autoSaveInterval: 10,
    autoBackup: true,
    autoBackupInterval: 600,
    autoBackupDraftPath: "",
    autoBackupLimitCount: 10,
    generateTextNodeByStringTabCount: 4,
    // 控制相关
    enableCollision: true,
    enableDragAutoAlign: true,
    enableDragAlignToGrid: false,
    enableWindowsTouchPad: true,
    rectangleSelectWhenLeft: "contain",
    rectangleSelectWhenRight: "intersect",
    scaleExponent: 0.11,
    allowMoveCameraByWSAD: false,
    cameraFollowsSelectedNodeOnArrowKeys: false,
    cameraKeyboardMoveReverse: false,
    scaleCameraByMouseLocation: true,
    cameraKeyboardScaleRate: 0.2,
    allowAddCycleEdge: false,
    moveAmplitude: 2,
    moveFriction: 0.1,
    gamepadDeadzone: 0.1,
    mouseRightDragBackground: "cut",
    textNodeContentLineBreak: "shiftEnter",
    textNodeExitEditMode: "enter",
    textNodeStartEditMode: "enter",
    textNodeSelectAllWhenStartEditByKeyboard: false,
    textNodeSelectAllWhenStartEditByMouseClick: true,
    mouseWheelMode: "zoom",
    mouseWheelWithShiftMode: "moveX",
    mouseWheelWithCtrlMode: "move",
    mouseWheelWithAltMode: "none",
    mouseSideWheelMode: "cameraMoveToMouse",
    doubleClickMiddleMouseButton: "adjustCamera",
    macTrackpadAndMouseWheelDifference: "trackpadIntAndWheelFloat",
    macMouseWheelIsSmoothed: false,
    macTrackpadScaleSensitivity: 0.5,
    // 音效相关
    soundEnabled: true,
    cuttingLineStartSoundFile: "",
    connectLineStartSoundFile: "",
    connectFindTargetSoundFile: "",
    cuttingLineReleaseSoundFile: "",
    alignAndAttachSoundFile: "",
    uiButtonEnterSoundFile: "",
    uiButtonClickSoundFile: "",
    uiSwitchButtonOnSoundFile: "",
    uiSwitchButtonOffSoundFile: "",
    // github 相关
    githubToken: "",
    githubUser: "",
  };

  /**
   * 获取默认的草稿备份路径
   * @returns
   */
  async function getDefaultDraftBackupPath() {
    if (isWeb) {
      return "web-drafts-backup"; // 随便设置一个非空字符串
    }
    return (await appCacheDir()) + PathString.getSep() + "drafts-backup";
  }

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
    // 兼容在旧版本保存的设置项
    if (await has("uiTheme")) {
      set("theme", "dark");
      remove("uiTheme");
    }

    // 1.7.4 之前的草稿默认备份路径都是空，现在自动改成appCacheDir默认路径
    if (!isWeb) {
      if ((await get("autoBackupDraftPath")) === "") {
        set("autoBackupDraftPath", await getDefaultDraftBackupPath());
      }
      defaultSettings.autoBackupDraftPath = await getDefaultDraftBackupPath();
    }
  }

  export function has(key: string): Promise<boolean> {
    return store.has(key);
  }

  export function remove(key: string) {
    store.delete(key);
    store.save();
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
        callback(value);
      });
    }
  }

  /**
   * react hook
   */
  export function use<K extends keyof Settings>(key: K): [Settings[K], (value: Settings[K]) => void] {
    const [value, setValue] = useState<Settings[K]>(defaultSettings[key]);
    const [inited, setInited] = useState(false);

    useEffect(() => {
      get(key)
        .then(setValue)
        .then(() => setInited(true));
    }, []);

    useEffect(() => {
      if (inited) {
        set(key, value);
      }
    }, [value, inited]);

    return [value, setValue];
  }
}
