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
    if (node.rectangle.isCollideWithLine(Stage.cuttingLine)) {
      Stage.warningNodes.push(node);
    }
  }
  Stage.warningEdges = [];
  for (const edge of StageManager.edges) {
    if (edge.bodyLine.isIntersecting(Stage.cuttingLine)) {
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
  StageManager.updateReferences();

  Stage.warningEdges = [];

  Stage.effects.push(
    new LineCuttingEffect(
      new ProgressNumber(0, 15),
      cuttingStartLocation,
      ControllerCutting.lastMoveLocation,
      new Color(255, 255, 0, 0),
      new Color(255, 255, 0, 1),
      cuttingStartLocation.distance(
        ControllerCutting.lastMoveLocation,
      ) / 10,
    ),
  );
};
