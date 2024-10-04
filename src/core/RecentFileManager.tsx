/**
 * 管理最近打开的文件列表
 * 有缓存机制
 */

import { createStore, Store } from "@tauri-apps/plugin-store";
import { exists } from "@tauri-apps/plugin-fs"; // 导入文件相关函数

// TODO: AI写的，待验证
export namespace RecentFileManager {
  let store: Store;

  export type RecentFile = {
    /**
     * 绝对路径
     */
    path: string;
    /**
     * 上次保存或打开的时间戳
     */
    time: number;
  }

  export async function init() {
    store = await createStore("recent-files.json");
  }

  /**
   * 增加一个最近打开的文件
   * @param file 
   */
  export async function addRecentFile(file: RecentFile) {
    // 如果已经有了，则先删除
    const existingFiles = await getRecentFiles();
    const existingIndex = existingFiles.findIndex(f => f.path === file.path);
    if (existingIndex >= 0) {
      existingFiles.splice(existingIndex, 1); // 删除已有记录
    }
    
    existingFiles.push(file); // 添加新文件
    await store.set("recentFiles", existingFiles); // 更新存储
  }

  /**
   * 获取最近打开的文件列表
   */
  export async function getRecentFiles(): Promise<RecentFile[]> {
    const data = await store.get("recentFiles") || [];
    return data as RecentFile[]; // 返回最近文件列表
  }

  /**
   * 刷新最近打开的文件列表
   * 从缓存中读取每个文件的路径，检查文件是否存在
   * 如果不存在，则删除该条记录
   * 
   * 最终按时间戳排序，最近的在最前面
   */
  export async function refreshRecentFiles() {
    const recentFiles = await getRecentFiles();
    const validFiles: RecentFile[] = [];

    for (const file of recentFiles) {
      const isExists = await exists(file.path); // 检查文件是否存在
      if (isExists) {
        validFiles.push(file); // 存在则保留
      }
    }

    // 按时间戳降序排序
    validFiles.sort((a, b) => b.time - a.time);
    await store.set("recentFiles", validFiles); // 更新存储
  }

  /**
   * 清空最近打开的文件列表，用户手动清除
   */
  export async function clearRecentFiles() {
    await store.set("recentFiles", []); // 清空列表
  }
}
