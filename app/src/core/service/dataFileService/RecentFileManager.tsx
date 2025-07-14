import { Store } from "@tauri-apps/plugin-store";
// import { exists } from "@tauri-apps/plugin-fs"; // 导入文件相关函数
import { exists } from "../../../utils/fs";
import { createStore } from "../../../utils/store";

/**
 * 管理最近打开的文件列表
 * 有数据持久化机制
 */
export namespace RecentFileManager {
  let store: Store;

  /**
   * 这次软件启动的时候是否成功触发了 打开用户自定义的工程文件 事件
   */
  export function isOpenByPathWhenAppStart() {
    return isThisOpenByPathFlag;
  }
  let isThisOpenByPathFlag = false;

  /**
   * 仅在软件启动时调用一次
   */
  export function openFileByPathWhenAppStart(autoOpenPath: string) {
    isThisOpenByPathFlag = true;
    startHookFunction(autoOpenPath);
  }
  /**
   * 软件启动时，注册一个回调函数，在回调函数中触发打开用户自定义的工程文件事件
   */
  // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
  export let startHookFunction = (_: string) => {};

  export type RecentFile = {
    /**
     * 绝对路径
     */
    path: string;
    /**
     * 上次保存或打开的时间戳
     */
    time: number;
  };

  export async function init() {
    store = await createStore("recent-files.json");
    store.save();
  }

  /**
   * 增加一个最近打开的文件
   * @param file
   */
  export async function addRecentFile(file: RecentFile) {
    // 如果已经有了，则先删除
    const existingFiles = await getRecentFiles();
    const existingIndex = existingFiles.findIndex((f) => f.path === file.path);
    if (existingIndex >= 0) {
      existingFiles.splice(existingIndex, 1); // 删除已有记录
    }

    existingFiles.push(file); // 添加新文件

    await store.set("recentFiles", existingFiles); // 更新存储
    store.save();
  }

  export async function addRecentFileByPath(path: string) {
    await addRecentFile({
      path: path,
      time: new Date().getTime(),
    });
  }

  export async function addRecentFilesByPaths(paths: string[]) {
    // 先去重
    const uniquePaths = Array.from(new Set(paths));
    const existingFiles = await getRecentFiles();
    for (const path of uniquePaths) {
      const addFile = {
        path: path,
        time: new Date().getTime(),
      };
      if (!existingFiles.some((f) => f.path === addFile.path)) {
        existingFiles.push(addFile); // 添加新文件
      }
    }
    await store.set("recentFiles", existingFiles); // 更新存储
    store.save();
  }

  /**
   * 删除一条历史记录
   * @param path
   */
  export async function removeRecentFileByPath(path: string) {
    const existingFiles = await getRecentFiles();
    const existingIndex = existingFiles.findIndex((f) => f.path === path);
    if (existingIndex >= 0) {
      existingFiles.splice(existingIndex, 1); // 删除已有记录
      await store.set("recentFiles", existingFiles); // 更新存储
      store.save();
      return true;
    }
    return false;
  }

  /**
   * 清空所有历史记录
   */
  export async function clearAllRecentFiles() {
    await store.set("recentFiles", []); // 清空列表
    store.save();
  }

  /**
   * 获取最近打开的文件列表
   */
  export async function getRecentFiles(): Promise<RecentFile[]> {
    const data = ((await store.get("recentFiles")) as RecentFile[]) || [];
    return data; // 返回最近文件列表
  }

  /**
   * 刷新最近打开的文件列表
   * 从缓存中读取每个文件的路径，检查文件是否存在
   * 如果不存在，则删除该条记录
   */
  export async function validAndRefreshRecentFiles() {
    const recentFiles = await getRecentFiles();
    const recentFilesValid: RecentFile[] = [];

    // 是否存在文件丢失情况
    let isFileLost = false;

    for (const file of recentFiles) {
      try {
        const isExists = await exists(file.path);
        if (isExists) {
          recentFilesValid.push(file); // 存在则保留
        } else {
          isFileLost = true;
        }
      } catch (e) {
        console.error("无法检测文件是否存在：", file.path);
        console.error(e);
      }
    }
    if (isFileLost) {
      await store.set("recentFiles", recentFilesValid); // 更新存储
    }
  }

  /**
   * 最终按时间戳排序，最近的在最前面
   */
  export async function sortTimeRecentFiles() {
    const recentFiles = await getRecentFiles();
    // 新的在前面
    recentFiles.sort((a, b) => b.time - a.time);
    await store.set("recentFiles", recentFiles); // 更新存储
    store.save();
  }

  /**
   * 清空最近打开的文件列表，用户手动清除
   */
  export async function clearRecentFiles() {
    await store.set("recentFiles", []); // 清空列表
    store.save();
  }
}
