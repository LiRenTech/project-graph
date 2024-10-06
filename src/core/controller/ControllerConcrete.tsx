/**
 * 存放具体的控制器实例
 */

import { Canvas } from "../Canvas";
import { Camera } from "../stage/Camera";
import { Controller } from "./Controller";
import { ControllerClass } from "./ControllerClass";


export const ControllerKeyMove = new ControllerClass(Canvas.element);

ControllerKeyMove.keydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  if (Controller.keyMap[key]) {
    // 当按下某一个方向的时候,相当于朝着某个方向赋予一次加速度
    Camera.accelerateCommander = Camera.accelerateCommander
      .add(Controller.keyMap[key])
      .limitX(-1, 1)
      .limitY(-1, 1);
  }
}
ControllerKeyMove.keyup = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  if (Controller.keyMap[key]) {
    // 当松开某一个方向的时候,相当于停止加速度
    Camera.accelerateCommander = Camera.accelerateCommander
      .subtract(Controller.keyMap[key])
      .limitX(-1, 1)
      .limitY(-1, 1);
  }
}