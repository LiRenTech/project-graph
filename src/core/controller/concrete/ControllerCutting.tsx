import { Color } from "../../Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";
import { Line } from "../../Line";
import { NodeManager } from "../../NodeManager";
import { ProgressNumber } from "../../ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

export const ControllerCutting = new ControllerClass();

ControllerCutting.mousedown = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const clickedNode = NodeManager.findNodeByLocation(pressWorldLocation);
  if (clickedNode === null) {
    // 开始绘制切断线
    Stage.isCutting = true;
  } else {
    Stage.isCutting = false;
  }
  ControllerCutting.lastMoveLocation = pressWorldLocation.clone();
};

ControllerCutting.mousemove = (event: MouseEvent) => {
  if (!Stage.isCutting) {
    return;
  }
  // 正在切断线
  Stage.cuttingLine = new Line(
    Controller.lastMousePressLocation[2],
    ControllerCutting.lastMoveLocation,
  );
  Stage.warningNodes = [];
  for (const node of NodeManager.nodes) {
    if (node.rectangle.isCollideWithLine(Stage.cuttingLine)) {
      Stage.warningNodes.push(node);
    }
  }
  Stage.warningEdges = [];
  for (const edge of NodeManager.edges) {
    if (edge.bodyLine.isIntersecting(Stage.cuttingLine)) {
      Stage.warningEdges.push(edge);
    }
  }
  ControllerCutting.lastMoveLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY), // 鼠标位置
  );
};

ControllerCutting.mouseup = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  NodeManager.deleteNodes(Stage.warningNodes);
  Stage.warningNodes = [];

  for (const edge of Stage.warningEdges) {
    NodeManager.deleteEdge(edge);
    // 计算线段的中点
    const midLocation = edge.bodyLine.midPoint();
    // 特效
    Stage.effects.push(
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        midLocation,
        edge.bodyLine.start,
        new Color(255, 0, 0, 0),
        new Color(255, 0, 0, 1),
        20,
      ),
    );
    Stage.effects.push(
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        midLocation,
        edge.bodyLine.end,
        new Color(255, 0, 0, 0),
        new Color(255, 0, 0, 1),
        20,
      ),
    );
    Stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 15),
        edge.bodyLine.midPoint(),
        50,
        new Color(255, 0, 0, 1),
      ),
    );
  }
  NodeManager.updateReferences();

  Stage.warningEdges = [];

  Stage.effects.push(
    new LineCuttingEffect(
      new ProgressNumber(0, 15),
      Controller.lastMousePressLocation[2],
      ControllerCutting.lastMoveLocation,
      new Color(255, 255, 0, 0),
      new Color(255, 255, 0, 1),
      Controller.lastMousePressLocation[2].distance(
        ControllerCutting.lastMoveLocation,
      ) / 10,
    ),
  );
};
