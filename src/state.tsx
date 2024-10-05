import { atom } from "recoil";


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