import { Store } from "@tauri-apps/plugin-store";
// import { exists } from "@tauri-apps/plugin-fs"; // 导入文件相关函数
import { Serialized } from "../../../types/node";
import { exists, PROJECT_GRAPH_FILE_EXT, readFile, readTextFile } from "../../../utils/fs/com";
import { createStore } from "../../../utils/store";
import { Camera } from "../../stage/Camera";
import { Stage } from "../../stage/Stage";
import { StageLoader } from "../../stage/StageLoader";
import { StageHistoryManager } from "../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../stage/stageManager/StageManager";
import { LineEdge } from "../../stage/stageObject/association/LineEdge";
import { ConnectPoint } from "../../stage/stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stage/stageObject/entity/ImageNode";
import { Section } from "../../stage/stageObject/entity/Section";
import { TextNode } from "../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../stage/stageObject/entity/UrlNode";
import { ViewFlashEffect } from "../feedbackService/effectEngine/concrete/ViewFlashEffect";
import { PenStroke } from "../../stage/stageObject/entity/PenStroke";
import { VFileSystem } from "./VFileSystem";
import { PathString } from "../../../utils/pathString";
import { Dialog } from "../../../components/dialog";

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

  /**
   * 删除一个最近打开的文件
   * 相当于删除这条历史记录
   * @param path
   */
  export async function removeRecentFile(path: string) {
    const existingFiles = await getRecentFiles();
    const existingIndex = existingFiles.findIndex((f) => f.path === path);
    if (existingIndex >= 0) {
      existingFiles.splice(existingIndex, 1); // 删除已有记录
      await store.set("recentFiles", existingFiles); // 更新存储
      store.save();
      return true;
    } else {
      return false;
    }
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

  /**
   * 打开一个文件
   * 先销毁所有节点，然后读取文件内容，解析出节点和边，添加到管理器中
   * 自动带有历史记录恢复功能
   * @param path 打开的文件路径
   * @returns 是否成功打开
   */
  export async function openFileByPath(path: string) {
    StageManager.destroy();

    try {
      await VFileSystem.loadFromPath(path);
    } catch (e) {
      console.error("打开文件失败：", path);
      console.error(e);
      if (path.endsWith(".json")) {
        // 用户使用了旧文件，提醒用户将其转为新文件
        Dialog.show({
          title: "打开文件失败，需要升级文件格式",
          content: `${path} 是1.5版本之前的 json格式旧文件，现已改为新格式.${PROJECT_GRAPH_FILE_EXT}，需要在菜单中点击 “从1.5之前的版本文件打开”，然后另存为新文件。`,
        });
      } else {
        Dialog.show({
          title: "打开文件失败",
          content: `${path} 打开失败，请检查文件是否存在或格式是否正确。`,
        });
      }
      return false;
    }

    const data = StageLoader.validate(JSON.parse(await VFileSystem.getMetaData()));

    loadStageByData(data);
    StageHistoryManager.reset(data);

    Camera.reset();
    Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
    RecentFileManager.addRecentFile({
      path: path,
      time: new Date().getTime(),
    });
    return true;
  }
  export async function openLegacyFileByPath(path: string) {
    StageManager.destroy();
    const ext = PathString.absolute2Ext(path);
    if (ext !== "json") {
      throw new Error("不兼容的文件格式");
    }

    const data = StageLoader.validate(JSON.parse(await readTextFile(path)));
    const dirPath = PathString.dirPath(path);
    const operations = data.entities
      .filter((entity) => entity.type === "core:image_node")
      .map(async (entity) => {
        const ud = await readFile(`${dirPath}${PathString.getSep()}${entity.uuid}.png`);
        await VFileSystem.getFS().writeFile(`/picture/${entity.uuid}.png`, ud);
      });
    await Promise.all(operations);
    loadStageByData(data);
    await VFileSystem.pullMetaData();

    StageHistoryManager.reset(data);

    Camera.reset();
    Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
    // RecentFileManager.addRecentFile({
    //   path: path,
    //   time: new Date().getTime(),
    // });
  }

  export function loadStageByData(data: Serialized.File) {
    for (const entity of data.entities) {
      if (entity.type === "core:text_node") {
        StageManager.addTextNode(new TextNode(entity));
      } else if (entity.type === "core:section") {
        StageManager.addSection(new Section(entity));
      } else if (entity.type === "core:connect_point") {
        StageManager.addConnectPoint(new ConnectPoint(entity));
      } else if (entity.type === "core:image_node") {
        StageManager.addImageNode(new ImageNode(entity));
      } else if (entity.type === "core:url_node") {
        StageManager.addUrlNode(new UrlNode(entity));
      } else if (entity.type === "core:pen_stroke") {
        StageManager.addPenStroke(new PenStroke(entity.content));
      } else {
        console.warn("加载文件时，出现未知的实体类型：" + entity);
      }
    }
    for (const edge of data.associations) {
      if (edge.type === "core:line_edge") {
        StageManager.addLineEdge(new LineEdge(edge));
      } else if (edge.type === "core:cublic_catmull_rom_spline_edge") {
        // TODO:
      }
    }
    StageManager.TagOptions.reset(data.tags);
    StageManager.updateReferences();
  }
}
