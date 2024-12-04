import { atom } from "recoil";
/**
 * 全局状态管理
 */

/**
 * 当前打开的文件路径
 */
export const fileAtom = atom({
  key: "file",
  default: "Project Graph",
});


/**
 * 是否显示最近打开的文件面板
 */
export const isRecentFilePanelOpenAtom = atom({
  key: "isRecentFilePanelOpen",
  default: false,
});



/**
 * 是否显示导出树形纯文本节点面板
 */
export const isExportTreeTextPanelOpenAtom = atom({
  key: "isExportTreeTextPanelOpen",
  default: false,
});

