import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { LineEffect } from "../../../feedbackService/effectEngine/concrete/LineEffect";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 涂鸦功能
 */
class ControllerDrawingClass extends ControllerClass {
  // 一开始是禁用状态
  private _isUsing: boolean = true;
  public get isUsing() {
    return this._isUsing;
  }
  public shutDown() {
    this._isUsing = false;
  }
  public open() {
    this._isUsing = true;
  }

  public mousedown: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (event.button !== 0) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    ControllerDrawing.lastMoveLocation = pressWorldLocation.clone();
  };

  public mousemove = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (!Controller.isMouseDown[0]) {
      return;
    }
    const worldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    // 绘制临时激光笔特效
    Stage.effectMachine.addEffect(
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
  };

  public mouseup = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (event.button !== 0) {
      return;
    }
    const releaseWorldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    console.log(releaseWorldLocation);
  };
}

export const ControllerDrawing = new ControllerDrawingClass();
