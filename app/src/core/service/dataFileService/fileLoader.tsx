import { Serialized } from "../../../types/node";
import { exists, readTextFile } from "../../../utils/fs";
import { Camera } from "../../stage/Camera";
import { StageLoader } from "../../stage/StageLoader";
import { StageHistoryManager } from "../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../stage/stageManager/StageManager";
import { LineEdge } from "../../stage/stageObject/association/LineEdge";
import { ConnectPoint } from "../../stage/stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stage/stageObject/entity/ImageNode";
import { Section } from "../../stage/stageObject/entity/Section";
import { TextNode } from "../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../stage/stageObject/entity/UrlNode";
import { PenStroke } from "../../stage/stageObject/entity/PenStroke";
import { PortalNode } from "../../stage/stageObject/entity/PortalNode";
import { PathString } from "../../../utils/pathString";
import { isWeb } from "../../../utils/platform";
import { Vector } from "../../dataStruct/Vector";
import { CublicCatmullRomSplineEdge } from "../../stage/stageObject/association/CublicCatmullRomSplineEdge";
import { MultiTargetUndirectedEdge } from "../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { RecentFileManager } from "./RecentFileManager";

/**
 * 将文件里的内容加载到舞台上
 * 非常核心的功能
 */
export namespace FileLoader {
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
