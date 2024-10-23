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
import { Line } from "../../dataStruct/shape/Line";
import { EdgeRenderer } from "../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Section } from "../../stageObject/entity/Section";

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
  const clickedNode = StageManager.findTextNodeByLocation(pressWorldLocation);
  const clickedEdge = StageManager.findEdgeByLocation(pressWorldLocation);
  const clickedSection = StageManager.findSectionByLocation(pressWorldLocation);
  if (clickedNode === null && clickedEdge === null && clickedSection === null) {
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

  Stage.warningEntity = [];
  for (const entity of StageManager.getEntities()) {
    if (entity instanceof Section) {
      continue;  // Section的碰撞箱比较特殊
    }
    const collidePoints = entity.collisionBox
      .getRectangle()
      .getCollidePointsWithLine(Stage.cuttingLine);
    if (collidePoints.length > 0) {
      Stage.warningEntity.push(entity);
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

  Stage.warningSections = [];
  for (const section of StageManager.getSections()) {
    if (section.collisionBox.isLineInCollisionBox(Stage.cuttingLine)) {
      Stage.warningSections.push(section);
    }
  }

  Stage.warningEdges = [];
  for (const edge of StageManager.getEdges()) {
    if (edge.collisionBox.isLineInCollisionBox(Stage.cuttingLine)) {
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

  StageManager.deleteEntities(Stage.warningEntity);
  Stage.warningEntity = [];

  for (const edge of Stage.warningEdges) {
    StageManager.deleteEdge(edge);
    for (const effect of EdgeRenderer.getCuttingEffects(edge)) {
      Stage.effects.push(effect);
    }
  }
  for (const section of Stage.warningSections) {
    StageManager.deleteSection(section);
  }

  Stage.warningSections = [];

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
