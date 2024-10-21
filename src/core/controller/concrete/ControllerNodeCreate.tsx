import { Color } from "../../dataStruct/Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { ControllerClass } from "../ControllerClass";
import { editNode } from "./utilsControl";

/**
 * 创建节点的控制器
 */
export const ControllerNodeCreate = new ControllerClass();

ControllerNodeCreate.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  const pressLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  let clickedNode = StageManager.findTextNodeByLocation(pressLocation);
  let clickedEdge = StageManager.findEdgeByLocation(pressLocation);

  if (clickedNode !== null || clickedEdge!== null) {
    return;
  }
  // 新建节点
  StageManager.addTextNodeByClick(
    Renderer.transformView2World(new Vector(event.clientX, event.clientY)),
  ).then((uuid) => {
    const createNode = StageManager.getTextNodeByUUID(uuid);
    if (createNode === null) {
      // 说明 创建了立刻删掉了
      return;
    }
    editNode(createNode);
  });
  // 更改节点 editNode(clickedNode);
  Stage.effects.push(
    new CircleFlameEffect(
      new ProgressNumber(0, 20),
      Renderer.transformView2World(new Vector(event.clientX, event.clientY + 20)),
      20,
      new Color(255, 255, 0, 1),
    ),
  );
};
