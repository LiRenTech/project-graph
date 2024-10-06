import { Color } from "../../Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { NodeManager } from "../../NodeManager";
import { ProgressNumber } from "../../ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../Vector";
import { ControllerClass } from "../ControllerClass";

/**
 * 创建节点
 */
export const ControllerNodeCreate = new ControllerClass();

ControllerNodeCreate.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  const pressLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  let clickedNode = NodeManager.findNodeByLocation(pressLocation);
  let clickedEdge = NodeManager.findEdgeByLocation(pressLocation);

  if (clickedNode !== null || clickedEdge!== null) {
    return;
  }
  // 新建节点
  NodeManager.addNodeByClick(
    Renderer.transformView2World(new Vector(event.clientX, event.clientY)),
  );
  Stage.effects.push(
    new CircleFlameEffect(
      new ProgressNumber(0, 40),
      Renderer.transformView2World(new Vector(event.clientX, event.clientY)),
      100,
      new Color(0, 255, 0, 1),
    ),
  );
};