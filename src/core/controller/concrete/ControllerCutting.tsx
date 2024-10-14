import { Color } from "../../dataStruct/Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { Line } from "../../dataStruct/Line";
import { EdgeRenderer } from "../../render/canvas2d/entityRenderer/edge/EdgeRenderer";

/**
 * 关于斩断线的控制器
 * 可以删除节点 也可以切断边
 */
export const ControllerCutting = new ControllerClass();

/**
 * 开始绘制斩断线的起点位置
 */
let cuttingStartLocation = Vector.getZero();

ControllerCutting.mousedown = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const clickedNode = StageManager.findNodeByLocation(pressWorldLocation);
  if (clickedNode === null) {
    // 开始绘制切断线
    Stage.isCutting = true;
    cuttingStartLocation = pressWorldLocation.clone();
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
    cuttingStartLocation,
    ControllerCutting.lastMoveLocation,
  );
  Stage.warningNodes = [];
  for (const node of StageManager.nodes) {
    const collidePoints = node.rectangle.getCollidePointsWithLine(
      Stage.cuttingLine,
    );
    if (collidePoints.length > 0) {
      Stage.warningNodes.push(node);
      for (const collidePoint of collidePoints) {
        Stage.effects.push(
          new CircleFlameEffect(
            new ProgressNumber(0, 5),
            collidePoint,
            10,
            new Color(255, 255, 255, 1),
          ),
        );
      }
    }
    // if (node.rectangle.isCollideWithLine(Stage.cuttingLine)) {
    //   Stage.warningNodes.push(node);
    // }
  }
  Stage.warningEdges = [];
  for (const edge of StageManager.edges) {
    if (edge.isBodyLineIntersectWithLine(Stage.cuttingLine)) {
      Stage.warningEdges.push(edge);
    }
  }
  ControllerCutting.lastMoveLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY), // 鼠标位置
  );
  // 渲染器需要
  Controller.lastMoveLocation = ControllerCutting.lastMoveLocation.clone();
};

ControllerCutting.mouseup = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  if (!Stage.isCutting) {
    return;
  }
  Stage.isCutting = false;

  StageManager.deleteNodes(Stage.warningNodes);
  Stage.warningNodes = [];

  for (const edge of Stage.warningEdges) {
    StageManager.deleteEdge(edge);
    for (const effect of EdgeRenderer.getCuttingEffects(edge)) {
      Stage.effects.push(effect);
    }
  }
  StageManager.updateReferences();

  Stage.warningEdges = [];

  Stage.effects.push(
    new LineCuttingEffect(
      new ProgressNumber(0, 15),
      cuttingStartLocation,
      ControllerCutting.lastMoveLocation,
      new Color(255, 255, 0, 0),
      new Color(255, 255, 0, 1),
      cuttingStartLocation.distance(ControllerCutting.lastMoveLocation) / 10,
    ),
  );
};
