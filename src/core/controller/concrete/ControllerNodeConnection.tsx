import { Color } from "../../dataStruct/Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { ControllerClass } from "../ControllerClass";
import { Controller } from "../Controller";
import { RectangleNoteEffect } from "../../effect/concrete/RectangleNoteEffect";
import { EdgeRenderer } from "../../render/canvas2d/entityRenderer/edge/EdgeRenderer";

/**
 * 右键连线功能 的控制器
 * 有两节点连线，还可以触发多重连接
 */
export const ControllerNodeConnection = new ControllerClass();

/**
 *
 * @param event
 * @returns
 */
ControllerNodeConnection.mousedown = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const clickedNode = StageManager.findTextNodeByLocation(pressWorldLocation);

  if (clickedNode) {
    // 右键点击了某个节点
    // Stage.isCutting = false;
    Stage.connectFromNodes = [];
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        Stage.connectFromNodes.push(node);
      }
    }
    if (Stage.connectFromNodes.includes(clickedNode)) {
      // 多重连接
      for (const node of StageManager.getTextNodes()) {
        if (node.isSelected) {
          // 特效
          Stage.effects.push(
            new RectangleNoteEffect(
              new ProgressNumber(0, 15),
              node.rectangle.clone(),
              new Color(0, 255, 0, 1),
            ),
          );
        }
      }
    } else {
      // 不触发多重连接
      Stage.connectFromNodes = [clickedNode];
      // 特效
      Stage.effects.push(
        new RectangleNoteEffect(
          new ProgressNumber(0, 15),
          clickedNode.rectangle.clone(),
          new Color(0, 255, 0, 1),
        ),
      );
    }
  } else {
  }
};

ControllerNodeConnection.mousemove = (event: MouseEvent) => {
  if (Stage.isSelecting || Stage.isCutting) {
    return;
  }
  if (!Controller.isMouseDown[2]) {
    return;
  }
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  // 连接线
  let isFindConnectToNode = false;
  for (const node of StageManager.getTextNodes()) {
    if (node.collisionBox.isPointInCollisionBox(worldLocation)) {
      if (Stage.connectToNode === null) {
        // 特效
        // Stage.effects.push(
        //   new RectangleNoteEffect(
        //     new ProgressNumber(0, 30),
        //     node.rectangle.clone(),
        //     new Color(0, 255, 0, 1),
        //   ),
        // );
      }
      Stage.connectToNode = node;
      isFindConnectToNode = true;

      break;
    }
  }
  if (!isFindConnectToNode) {
    Stage.connectToNode = null;
  }
  // 由于连接线要被渲染器绘制，所以需要更新总控制里的lastMoveLocation
  Controller.lastMoveLocation = worldLocation.clone();
};

ControllerNodeConnection.mouseup = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  // 结束连线
  if (Stage.connectFromNodes.length > 0 && Stage.connectToNode !== null) {
    let isHaveConnectResult = false; // 在多重链接的情况下，是否有连接成功
    for (const node of Stage.connectFromNodes) {
      const connectResult = StageManager.connectNode(node, Stage.connectToNode);
      if (connectResult) {
        // 连接成功，特效
        isHaveConnectResult = true;
        for (const effect of EdgeRenderer.getConnectedEffects(node, Stage.connectToNode)) {
          Stage.effects.push(effect);
        }
      }
    }
    if (isHaveConnectResult) {
      // 给连向的那个节点加特效
      Stage.effects.push(
        new CircleFlameEffect(
          new ProgressNumber(0, 15),
          Stage.connectToNode.rectangle.center,
          80,
          new Color(0, 255, 0, 1),
        ),
      );
    }
  }
  Stage.connectFromNodes = [];
  Stage.connectToNode = null;
};
