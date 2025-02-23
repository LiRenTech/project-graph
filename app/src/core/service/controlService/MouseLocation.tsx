import { Vector } from "../../dataStruct/Vector";
import { Stage } from "../../stage/Stage";
import { ViewOutlineFlashEffect } from "../feedbackService/effectEngine/concrete/ViewOutlineFlashEffect";
import { StageStyleManager } from "../feedbackService/stageStyle/StageStyleManager";
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
      if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
        if (Stage.cuttingMachine.isUsing) {
          Stage.cuttingMachine.mouseUpFunction(vectorObject);
          Stage.effectMachine.addEffect(
            ViewOutlineFlashEffect.normal(StageStyleManager.currentStyle.effects.warningShadow),
          );
        }
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
