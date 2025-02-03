import { atom } from "jotai";
/**
 * 全局状态管理
 */

/**
 * 当前打开的文件路径
 */
export const fileAtom = atom("Project Graph");

/**
 * 是否显示最近打开的文件面板
 */
export const isRecentFilePanelOpenAtom = atom(false);

/**
 * 是否显示导出树形纯文本节点面板
 */
export const isExportTreeTextPanelOpenAtom = atom(false);
