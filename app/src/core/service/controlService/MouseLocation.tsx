import { Vector } from "../../dataStruct/Vector";
import { Stage } from "../../stage/Stage";
import { Controller } from "./controller/Controller";

export namespace MouseLocation {
  export let x: number = 0;
  export let y: number = 0;

  export function init() {
    window.addEventListener("mousemove", (event) => {
      x = event.clientX;
      y = event.clientY;

      // 维护一个Vector对象
      vectorObject.x = x;
      vectorObject.y = y;

      Controller.recordManipulate();
      // 检测是否超出范围
      // TODO: 这里还可以优化一下，给每个Controller都加一个mouseMoveOutWindowForcedShutdown方法
      if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
        if (Stage.cuttingMachine.isUsing) {
          Stage.cuttingMachine.mouseMoveOutWindowForcedShutdown(vectorObject);
        }
        if (Stage.cameraControllerMachine.isUsingMouseGrabMove) {
          Stage.cameraControllerMachine.mouseMoveOutWindowForcedShutdown(vectorObject);
        }
        if (Stage.selectMachine.isUsing) {
          Stage.selectMachine.mouseMoveOutWindowForcedShutdown(vectorObject);
        }
        Stage.entityMoveMachine.mouseMoveOutWindowForcedShutdown(vectorObject);
      }
    });
  }

  const vectorObject = new Vector(x, y);

  /**
   * 返回的时视野坐标系中的鼠标位置
   * 注意是view坐标系
   * @returns
   */
  export function vector(): Vector {
    return vectorObject;
  }
}
