/**
 * 管理最近打开的文件列表
 * 有缓存机制
 */

import { createStore, Store } from "@tauri-apps/plugin-store";
import { exists } from "@tauri-apps/plugin-fs"; // 导入文件相关函数
import { NodeLoader } from "./NodeLoader";
import { NodeManager } from "./NodeManager";
import { Edge } from "./Edge";
import { Camera } from "./stage/Camera";
import { Stage } from "./stage/Stage";
import { ViewFlashEffect } from "./effect/concrete/ViewFlashEffect";
import { Color } from "./Color";
import { Node } from "./Node";
import { invoke } from '@tauri-apps/api/core';

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
  };

  export async function init() {
    store = await createStore("recent-files.json");
    await store.load(); // 加载缓存
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
    const validFiles: RecentFile[] = [];

    for (const file of recentFiles) {
      try {
        const isExists = await exists(file.path); // 检查文件是否存在
        if (isExists) {
          validFiles.push(file); // 存在则保留
        } else {
          console.log("文件不存在，删除记录", file.path);
        }
      } catch (e) {
        console.error("无法检测文件是否存在：", file.path);
        console.error(e);
      }
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

  /**
   * 打开一个文件
   * 先销毁所有节点，然后读取文件内容，解析出节点和边，添加到管理器中
   * @param path 打开的文件路径
   */
  export async function openFileByPath(path: string) {
    NodeManager.destroy();
    let content: string;
    try {
      // content = await readTextFile(path);
      content = await invoke<string>('open_json_by_path', { path });
    } catch (e) {
      console.error("打开文件失败：", path);
      console.error(e);
      return;
    }

    const data = NodeLoader.validate(JSON.parse(content));
    console.log(data);

    for (const node of data.nodes) {
      NodeManager.addNode(new Node(node));
    }
    for (const edge of data.edges) {
      NodeManager.addEdge(new Edge(edge));
    }
    NodeManager.updateReferences();

    Camera.reset();
    Stage.effects.push(new ViewFlashEffect(Color.Black));
    RecentFileManager.addRecentFile({
      path: path,
      time: new Date().getTime(),
    });
  }
}
