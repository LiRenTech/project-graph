import { open } from "@tauri-apps/plugin-shell";
import { Dialog } from "../../../../../components/dialog";
import { PathString } from "../../../../../utils/pathString";
import { isWeb } from "../../../../../utils/platform";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { StageDumper } from "../../../../stage/StageDumper";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { PortalNode } from "../../../../stage/stageObject/entity/PortalNode";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../../stage/stageObject/entity/UrlNode";
import { RecentFileManager } from "../../../dataFileService/RecentFileManager";
import { StageSaveManager } from "../../../dataFileService/StageSaveManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { editNodeDetails, editPortalNodeTitle, editTextNode, editUrlNodeTitle } from "./utilsControl";
/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export const ControllerNodeEdit = new ControllerClass();

ControllerNodeEdit.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }

  const pressLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  const clickedEntity = StageManager.findEntityByLocation(pressLocation);

  if (clickedEntity === null) {
    return;
  }

  if (Controller.pressingKeySet.has("control")) {
    editNodeDetails(clickedEntity);
  } else {
    if (clickedEntity instanceof TextNode) {
      editTextNode(clickedEntity, Stage.textNodeSelectAllWhenStartEditByMouseClick);
    } else if (clickedEntity instanceof UrlNode) {
      const diffNodeLeftTopLocation = pressLocation.subtract(clickedEntity.rectangle.leftTop);
      if (diffNodeLeftTopLocation.y < UrlNode.titleHeight) {
        editUrlNodeTitle(clickedEntity);
      } else {
        // 跳转链接
        open(clickedEntity.url);
      }
    } else if (clickedEntity instanceof PortalNode) {
      const diffNodeLeftTopLocation = pressLocation.subtract(clickedEntity.rectangle.leftTop);
      if (diffNodeLeftTopLocation.y < PortalNode.TITLE_LINE_Y) {
        // 编辑标题
        editPortalNodeTitle(clickedEntity);
      } else if (diffNodeLeftTopLocation.y < PortalNode.PATH_LINE_Y) {
        // 更改路径
        const newPortalFilePath = prompt("请输入新的路径", clickedEntity.portalFilePath);
        if (newPortalFilePath) {
          clickedEntity.portalFilePath = newPortalFilePath;
        }
      } else {
        if (isWeb) {
          Dialog.show({
            title: "网页版不支持传送门",
            content: "网页版不支持传送门，请使用桌面版",
          });
          return;
        }
        // 跳转链接
        if (Stage.path.isDraft()) {
          Dialog.show({
            title: "草稿不支持传送门",
            content: "请保存为本地文件后再传送门",
          });
          return;
        } else {
          // 准备要跳转了！
          const relativePath = clickedEntity.portalFilePath;
          const absolutePath = PathString.dirPath(Stage.path.getFilePath());
          const newPath = PathString.relativePathToAbsolutePath(absolutePath, relativePath);
          // 取消选择所有节点
          StageManager.clearSelectAll();
          // 切换前保存一下
          StageSaveManager.saveHandleWithoutCurrentPath(StageDumper.dump(), false, false);
          // 开始传送
          // 不要让它立刻切换，否则会导致突然在新的文件中触发一个双击事件，创建了一个多余节点
          setTimeout(() => {
            RecentFileManager.openFileByPath(newPath);
            Stage.path.setPathAndChangeUI(newPath);
          }, 100);
        }
      }
    }
  }
};

ControllerNodeEdit.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }

  const pressLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  for (const entity of StageManager.getEntities()) {
    // 必须有详细信息才显示详细信息按钮，进而点进去，否则会误触
    if (entity.isMouseInDetailsButton(pressLocation) && entity.details) {
      editNodeDetails(entity);
      return;
    }
  }
};

ControllerNodeEdit.mousemove = (event: MouseEvent) => {
  /**
   * 如果一直显示详细信息，则不显示鼠标悬停效果
   */
  if (Renderer.isAlwaysShowDetails) {
    return;
  }

  const location = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  for (const node of StageManager.getTextNodes()) {
    node.isMouseHover = false;
    if (node.collisionBox.isContainsPoint(location)) {
      node.isMouseHover = true;
    }
  }
};
