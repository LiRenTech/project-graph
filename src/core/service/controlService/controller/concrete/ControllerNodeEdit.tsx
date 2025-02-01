import { open } from "@tauri-apps/plugin-shell";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../../stage/stageObject/entity/UrlNode";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { editNodeDetails, editTextNode, editUrlNodeTitle } from "./utilsControl";
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
      editTextNode(clickedEntity);
    } else if (clickedEntity instanceof UrlNode) {
      const diffNodeLeftTopLocation = pressLocation.subtract(clickedEntity.rectangle.leftTop);
      if (diffNodeLeftTopLocation.y < UrlNode.titleHeight) {
        editUrlNodeTitle(clickedEntity);
      } else {
        // 跳转链接
        open(clickedEntity.url);
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
