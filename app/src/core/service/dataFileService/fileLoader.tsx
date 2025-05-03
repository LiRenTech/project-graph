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
import { SvgNode } from "../../stage/stageObject/entity/SvgNode";
import { Dialog } from "../../../components/dialog";

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
    const data = await getDataByPath(path);
    if (!data) {
      return;
    }
    StageManager.destroy();

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
      Dialog.show({
        title: "打开文件失败",
        content: "文件不存在：" + path,
        type: "error",
      });
      return null;
    }
    let content: string;
    try {
      content = await readTextFile(path);
    } catch (e) {
      Dialog.show({
        title: "打开文件失败",
        content: "打开文件失败：" + JSON.stringify(e),
        type: "error",
      });
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
      let newEntity = null;
      if (Serialized.isTextNode(entity)) {
        newEntity = new TextNode(entity);
      } else if (Serialized.isSection(entity)) {
        newEntity = new Section(entity);
      } else if (Serialized.isConnectPoint(entity)) {
        newEntity = new ConnectPoint(entity);
      } else if (Serialized.isImageNode(entity)) {
        newEntity = new ImageNode(entity);
      } else if (Serialized.isUrlNode(entity)) {
        newEntity = new UrlNode(entity);
      } else if (Serialized.isPenStroke(entity)) {
        newEntity = new PenStroke(entity);
      } else if (Serialized.isPortalNode(entity)) {
        newEntity = new PortalNode(entity);
      } else if (Serialized.isSvgNode(entity)) {
        newEntity = new SvgNode(entity);
      }
      if (newEntity) {
        StageManager.addEntity(newEntity);
      } else {
        console.warn("加载文件时，出现未知的实体类型：" + entity);
      }
    }
    for (const edge of data.associations) {
      let newAssociation = null;
      if (Serialized.isLineEdge(edge)) {
        newAssociation = new LineEdge(edge);
      } else if (Serialized.isCublicCatmullRomSplineEdge(edge)) {
        newAssociation = new CublicCatmullRomSplineEdge(edge);
      } else if (Serialized.isMultiTargetUndirectedEdge(edge)) {
        newAssociation = new MultiTargetUndirectedEdge(edge);
      }
      if (newAssociation) {
        StageManager.addAssociation(newAssociation);
      } else {
        console.warn("加载文件时，出现未知的关系类型：" + edge);
      }
    }
    StageManager.TagOptions.reset(data.tags);
    StageManager.updateReferences();
  }
}
