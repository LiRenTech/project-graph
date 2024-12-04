import { isDesktop } from "../../../utils/platform";
import { Vector } from "../../dataStruct/Vector";
import { EntityCreateLineEffect } from "../../effect/concrete/EntityCreateLineEffect";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { editNode } from "./utilsControl";

/**
 * 创建节点的控制器
 */
export const ControllerEntityCreate = new ControllerClass();

ControllerEntityCreate.mouseDoubleClick = (event: MouseEvent) => {
  // 双击只能在左键
  if (!(event.button === 0 || event.button === 1)) {
    return;
  }

  Stage.isSelecting = false;

  const pressLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  if (
    StageManager.isEntityOnLocation(pressLocation) ||
    StageManager.isAssociationOnLocation(pressLocation)
  ) {
    return;
  }

  if (Controller.pressingKeySet.has("`")) {
    createConnectPoint(pressLocation);
  } else {
    createNode(pressLocation);
  }
};

function createConnectPoint(pressLocation: Vector) {
  StageManager.addConnectPointByClick(pressLocation);
}

function createNode(pressLocation: Vector) {
  // 新建节点
  StageManager.addTextNodeByClick(pressLocation).then((uuid) => {
    const createNode = StageManager.getTextNodeByUUID(uuid);
    if (createNode === null) {
      // 说明 创建了立刻删掉了
      return;
    }
    const rect = createNode.collisionBox.getRectangle();
    Stage.effects.push(EntityCreateLineEffect.from(rect));
    if (isDesktop) {
      editNode(createNode);
    }
  });
}
