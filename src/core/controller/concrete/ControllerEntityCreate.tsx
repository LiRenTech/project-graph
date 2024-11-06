import { Color } from "../../dataStruct/Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { ControllerClass } from "../ControllerClass";
import { editNode } from "./utilsControl";
import { Controller } from "../Controller";
import { EntityCreateDashEffect } from "../../effect/concrete/EntityCreateDashEffect";

/**
 * 创建节点的控制器
 */
export const ControllerEntityCreate = new ControllerClass();

ControllerEntityCreate.mouseDoubleClick = (event: MouseEvent) => {
  console.log(event.button); // 双击只能在左键
  if (!(event.button === 0 || event.button === 1)) {
    return;
  }
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
  console.log("create connect point");
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
    Stage.effects.push(
      EntityCreateDashEffect.fromRectangle(
        createNode.collisionBox.getRectangle(),
      ),
    );
    editNode(createNode);
  });
  // 更改节点 editNode(clickedNode);
  Stage.effects.push(
    new CircleFlameEffect(
      new ProgressNumber(0, 20),
      pressLocation.clone(),
      20,
      new Color(255, 255, 0, 1),
    ),
  );
}
