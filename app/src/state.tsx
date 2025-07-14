import { atom, createStore } from "jotai";
/**
 * 全局状态管理
 */

export const store = createStore();

/**
 * 当前打开的文件路径
 */
export const fileAtom = atom("Project Graph");

/**
 * 是否显示导出树形纯文本节点面板
 */
export const isExportTreeTextPanelOpenAtom = atom(false);

/**
 * 是否显示导出PNG图片面板
 */
export const isExportPNGPanelOpenAtom = atom(false);

/**
 * 当前窗口是否折叠
 */
export const isWindowCollapsingAtom = atom(false);

/**
 * 是否进入演示模式
 * （老师专用）
 */
export const isClassroomModeAtom = atom(false);
