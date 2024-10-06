import { Color } from "../../dataStruct/Color";
import { LineEffect } from "../../effect/concrete/LineEffect";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 涂鸦功能，用于绘制临时激光笔特效，教学、录视频、屏幕分享等场景中使用
 * 
 * BUG: 每次画新的笔画时会突然出现一个很长的直线
 */
export const ControllerDrawing = new ControllerClass();

ControllerDrawing.mousedown = (event: MouseEvent) => {
  if (event.button !== 1) {
    return;
  }
  if (!Controller.pressingKeySet.has("`")) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  ControllerDrawing.lastMoveLocation = pressWorldLocation.clone();
};

ControllerDrawing.mousemove = (event: MouseEvent) => {
  if (!Controller.isMouseDown[0]) {
    return;
  }
  if (Controller.pressingKeySet.has("`")) {
    const worldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    // 绘制临时激光笔特效
    Stage.effects.push(
      new LineEffect(
        new ProgressNumber(0, 50),
        ControllerDrawing.lastMoveLocation,
        worldLocation,
        new Color(255, 255, 0, 1),
        new Color(255, 255, 0, 1),
        2,
      ),
    );
    ControllerDrawing.lastMoveLocation = worldLocation.clone();
  }
};
