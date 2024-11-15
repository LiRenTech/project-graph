import { Color } from "../../dataStruct/Color";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { ControllerClass } from "../ControllerClass";
import { editNode } from "./utilsControl";
import { Controller } from "../Controller";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";

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
    const rect = createNode.collisionBox.getRectangle();
    const fromColor = new Color(100, 100, 100, 0);
    const toColor = new Color(255, 255, 255, 1);
    const effectTime = 30;
    const shiftingLength = 0;
    // 闪烁效果
    // 创建四条线
    Stage.effects.push(
      new LineCuttingEffect(
        new ProgressNumber(0, effectTime),
        rect.leftTop.add(new Vector(-shiftingLength, -shiftingLength)),
        rect.rightTop,
        fromColor.clone(),
        toColor.clone(),
        10,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, effectTime),
        rect.rightTop.add(new Vector(shiftingLength, -shiftingLength)),
        rect.rightBottom,
        fromColor.clone(),
        toColor.clone(),
        10,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, effectTime),
        rect.rightBottom.add(new Vector(shiftingLength, shiftingLength)),
        rect.leftBottom,
        fromColor.clone(),
        toColor.clone(),
        10,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, effectTime),
        rect.leftBottom.add(new Vector(-shiftingLength, shiftingLength)),
        rect.leftTop,
        fromColor,
        toColor,
        10,
      ),
    );
    editNode(createNode);
  });
}
