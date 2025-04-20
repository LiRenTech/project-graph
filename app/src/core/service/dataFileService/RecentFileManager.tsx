import { Store } from "@tauri-apps/plugin-store";
// import { exists } from "@tauri-apps/plugin-fs"; // 导入文件相关函数
import { Serialized } from "../../../types/node";
import { exists, readTextFile } from "../../../utils/fs";
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
import { PortalNode } from "../../stage/stageObject/entity/PortalNode";
import { PathString } from "../../../utils/pathString";
import { isWeb } from "../../../utils/platform";
import { Vector } from "../../dataStruct/Vector";
import { CublicCatmullRomSplineEdge } from "../../stage/stageObject/association/CublicCatmullRomSplineEdge";
import { MultiTargetUndirectedEdge } from "../../stage/stageObject/association/MutiTargetUndirectedEdge";

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
   */
  export async function openFileByPath(path: string) {
    StageManager.destroy();
    const data = await getDataByPath(path);
    if (!data) {
      return;
    }

    loadStageByData(data, path);
    StageHistoryManager.reset(data);

    Camera.reset();
    Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
    RecentFileManager.addRecentFile({
      path: path,
      time: new Date().getTime(),
    });
  }

  /**
   * 通过路径，获取文件内容
   * @param path
   * @returns
   */
  async function getDataByPath(path: string): Promise<Serialized.File | null> {
    if (!exists(path)) {
      console.error("文件不存在：" + path);
      return null;
    }
    let content: string;
    try {
      content = await readTextFile(path);
    } catch (e) {
      console.error("打开文件失败：", path);
      console.error(e);
      return null;
    }
    const data = StageLoader.validate(JSON.parse(content));
    return data;
  }

  /**
   * 加载主场景和子场景
   * @param data 这个工程文件的整个data数据
   * @param path 这个工程文件的绝对路径
   */
  export async function loadStageByData(data: Serialized.File, path: string) {
    loadDataToMainStage(data);
    if (isWeb) {
      // web模式先别加载子场景
      return;
    }
    // 先清空所有子场景
    StageManager.clearAllChildStage();
    // 加载所有子场景
    const childAbsolutePathList: string[] = [];
    for (const entity of data.entities) {
      if (entity.type === "core:portal_node") {
        const relativePath = entity.portalFilePath;
        // 转换成绝对路径
        const childAbsolutePath = PathString.relativePathToAbsolutePath(PathString.dirPath(path), relativePath);
        childAbsolutePathList.push(childAbsolutePath);

        // 更新子场景的摄像头信息
        StageManager.updateChildStageCameraData(childAbsolutePath, {
          location: new Vector(...entity.location),
          zoom: entity.cameraScale,
          size: new Vector(...entity.size),
          targetLocation: new Vector(...entity.targetLocation),
        });
      }
    }

    // 加载子场景
    for (const childAbsolutePath of childAbsolutePathList) {
      if (!(await exists(childAbsolutePath))) {
        console.error("子场景文件不存在：" + childAbsolutePath);
        continue;
      }
      const childData = await getDataByPath(childAbsolutePath);
      if (!childData) {
        console.error("子场景文件不存在：" + childAbsolutePath);
        continue;
      }
      loadChildStageByData(childData, childAbsolutePath);
      // 先别递归
      // if (childData) {
      //   loadStageByData(childData);
      // }
    }
  }

  function loadChildStageByData(data: Serialized.File, absolutePath: string) {
    StageManager.storeMainStage();
    StageManager.destroy();
    loadDataToMainStage(data);
    StageManager.storeMainStageToChildStage(absolutePath);
    StageManager.destroy();
    StageManager.restoreMainStage();
  }

  function loadDataToMainStage(data: Serialized.File) {
    for (const entity of data.entities) {
      // TODO: 待优化结构
      if (Serialized.isTextNode(entity)) {
        StageManager.addTextNode(new TextNode(entity));
      } else if (Serialized.isSection(entity)) {
        StageManager.addSection(new Section(entity));
      } else if (Serialized.isConnectPoint(entity)) {
        StageManager.addConnectPoint(new ConnectPoint(entity));
      } else if (Serialized.isImageNode(entity)) {
        StageManager.addImageNode(new ImageNode(entity));
      } else if (Serialized.isUrlNode(entity)) {
        StageManager.addUrlNode(new UrlNode(entity));
      } else if (Serialized.isPenStroke(entity)) {
        StageManager.addPenStroke(new PenStroke(entity));
      } else if (Serialized.isPortalNode(entity)) {
        StageManager.addPortalNode(new PortalNode(entity));
      } else {
        console.warn("加载文件时，出现未知的实体类型：" + entity);
      }
    }
    for (const edge of data.associations) {
      if (Serialized.isLineEdge(edge)) {
        StageManager.addAssociation(new LineEdge(edge));
      } else if (Serialized.isCublicCatmullRomSplineEdge(edge)) {
        StageManager.addAssociation(new CublicCatmullRomSplineEdge(edge));
      } else if (Serialized.isMultiTargetUndirectedEdge(edge)) {
        StageManager.addAssociation(new MultiTargetUndirectedEdge(edge));
      }
    }
    StageManager.TagOptions.reset(data.tags);
    StageManager.updateReferences();
  }
}
