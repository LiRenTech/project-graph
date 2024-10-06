import { Color } from "../../Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";
import { NodeManager } from "../../NodeManager";
import { ProgressNumber } from "../../ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../Vector";
import { ControllerClass } from "../ControllerClass";

export const ControllerNodeConnection = new ControllerClass();

ControllerNodeConnection.mousedown = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const clickedNode = NodeManager.findNodeByLocation(pressWorldLocation);

  if (clickedNode) {
    // 右键点击了某个节点
    Stage.isCutting = false;
    Stage.connectFromNodes = [];
    for (const node of NodeManager.nodes) {
      if (node.isSelected) {
        Stage.connectFromNodes.push(node);
      }
    }
    if (Stage.connectFromNodes.includes(clickedNode)) {
      // 多重连接
      for (const node of NodeManager.nodes) {
        if (node.isSelected) {
          // 特效
        }
      }
    } else {
      // 不触发多重连接
      Stage.connectFromNodes = [clickedNode];
      // 特效
    }
  } else {
    // 变成切割线了
  }
};

ControllerNodeConnection.mousemove = (event: MouseEvent) => {
  if (Stage.isSelecting || Stage.isCutting) {
    return;
  }
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  // 连接线
  let isFindConnectToNode = false;
  for (const node of NodeManager.nodes) {
    if (node.rectangle.isPointInside(worldLocation)) {
      Stage.connectToNode = node;
      isFindConnectToNode = true;
      break;
    }
  }
  if (!isFindConnectToNode) {
    Stage.connectToNode = null;
  }
};

ControllerNodeConnection.mouseup = (event: MouseEvent) => {
  if (event.button !== 2) {
    return;
  }
  // 结束连线
  if (Stage.connectFromNodes.length > 0 && Stage.connectToNode !== null) {
    let isHaveConnectResult = false; // 在多重链接的情况下，是否有连接成功
    for (const node of Stage.connectFromNodes) {
      const connectResult = NodeManager.connectNode(node, Stage.connectToNode);
      if (connectResult) {
        // 连接成功，特效
        isHaveConnectResult = true;
        Stage.effects.push(
          new CircleFlameEffect(
            new ProgressNumber(0, 15),
            node.rectangle.center,
            80,
            new Color(83, 175, 29, 1),
          ),
        );
        Stage.effects.push(
          new LineCuttingEffect(
            new ProgressNumber(0, 30),
            node.rectangle.center,
            Stage.connectToNode.rectangle.center,
            new Color(78, 201, 176, 1),
            new Color(83, 175, 29, 1),
            20,
          ),
        );
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