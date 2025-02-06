import { Queue } from "../../../dataStruct/Queue";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { ViewFlashEffect } from "../../feedbackService/effectEngine/concrete/ViewFlashEffect";

export class SecretEngine {
  pressedKeys: Queue<string> = new Queue<string>();

  constructor() {
    window.addEventListener("keydown", (event) => {
      this.pressedKeys.enqueue(event.key.toLowerCase());
      const isTriggered = this.detect();
      if (isTriggered) {
        // 清空队列
        this.pressedKeys.clear();
      }
      // 将队列长度限制在10以内
      while (this.pressedKeys.length > 10) {
        this.pressedKeys.dequeue();
      }
    });
  }

  // 监听按键
  detect(): boolean {
    const keys = this.pressedKeys.arrayList.join(" ");
    console.log(keys);
    if (keys.includes("arrowup arrowup arrowdown arrowdown arrowleft arrowright arrowleft arrowright b a")) {
      // 触发彩蛋
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      return true;
    }
    if (keys.includes("l o v e")) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      Stage.drawingMachine.open();
      return true;
    }
    if (keys.includes("r e c t")) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      Stage.drawingMachine.shutDown();
      return true;
    }
    if (keys.includes("1 1 4 5 1 4")) {
      Camera.clearMoveCommander();
      return true;
    }
    return false;
  }
}
