import { createFolder } from "../../../../utils/fs";
import { Queue } from "../../../dataStruct/Queue";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { CollaborationEngine } from "../../dataManageService/collaborationEngine/CollaborationEngine";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../feedbackService/effectEngine/concrete/ViewFlashEffect";
import { SelectChangeEngine } from "../keyboardOnlyEngine/selectChangeEngine";

export class SecretEngine {
  pressedKeys: Queue<string> = new Queue<string>();

  constructor() {
    window.addEventListener("keydown", (event) => {
      this.pressedKeys.enqueue(event.key.toLowerCase());
      const isTriggered = this.detect();
      if (isTriggered) {
        // 清空队列
        this.pressedKeys.clear();
        Stage.effectMachine.addEffect(TextRiseEffect.default("触发了测试按键"));
      }
      // 将队列长度限制
      while (this.pressedKeys.length > 20) {
        this.pressedKeys.dequeue();
      }
    });
  }

  // 监听按键，每次按键都会触发
  detect(): boolean {
    const keys = this.pressedKeys.arrayList.join(" ");
    // 测试彩蛋是否开启
    if (keys.includes("arrowup arrowup arrowdown arrowdown arrowleft arrowright arrowleft arrowright b a")) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      return true;
    }
    // 开启涂鸦绘制
    if (keys.includes("l o v e")) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      Stage.drawingMachine.open();
      return true;
    }
    // 关闭涂鸦绘制，回到矩形框选模式
    if (keys.includes("r e c t")) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      Stage.drawingMachine.shutDown();
      return true;
    }
    // 待定彩蛋
    if (keys.includes("1 1 4 5 1 4")) {
      Camera.clearMoveCommander();
      return true;
    }
    // 鬼畜梗，创建一个传送门用于测试
    if (keys.includes("b o y n e x t d o o r")) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      StageManager.addOnePortalNode();
      return true;
    }
    if (keys.includes("v v v arrowup")) {
      const selectNode = StageManager.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
      if (selectNode.length === 0) {
        return true;
      }
      const collected = SelectChangeEngine.collectTopNodes(selectNode[0]);
      console.log(collected);
      for (const entity of collected) {
        entity.isSelected = true;
      }
      return true;
    }
    if (keys.includes("v v v arrowdown")) {
      const selectNode = StageManager.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
      if (selectNode.length === 0) {
        return true;
      }
      const collected = SelectChangeEngine.collectBottomNodes(selectNode[0]);
      console.log(collected);
      for (const entity of collected) {
        entity.isSelected = true;
      }
      return true;
    }
    if (keys.includes("v v v arrowleft")) {
      const selectNode = StageManager.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
      if (selectNode.length === 0) {
        return true;
      }
      const collected = SelectChangeEngine.collectLeftNodes(selectNode[0]);
      console.log(collected);
      for (const entity of collected) {
        entity.isSelected = true;
      }
      return true;
    }
    if (keys.includes("v v v arrowright")) {
      const selectNode = StageManager.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
      if (selectNode.length === 0) {
        return true;
      }
      const collected = SelectChangeEngine.collectRightNodes(selectNode[0]);
      console.log(collected);
      for (const entity of collected) {
        entity.isSelected = true;
      }
      return true;
    }
    if (keys.includes("c o l l a b o r a t e")) {
      CollaborationEngine.openStartCollaborationPanel();
      return true;
    }
    if (keys.includes("c r e a t e f o l d e r w i n")) {
      createFolder("D:\\111\\111");
      return true;
    }
    return false;
  }
}
