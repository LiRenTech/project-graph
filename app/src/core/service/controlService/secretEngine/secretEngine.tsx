import { createFolder } from "../../../../utils/fs";
import { Queue } from "../../../dataStruct/Queue";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { CollaborationEngine } from "../../dataManageService/collaborationEngine/CollaborationEngine";
import { RectangleNoteEffect } from "../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../feedbackService/effectEngine/concrete/ViewFlashEffect";
import { AutoLayoutFastTree } from "../autoLayoutEngine/autoLayoutFastTreeMode";
/**
 * 秘籍键系统
 * 类似于游戏中的秘籍键，可以触发一些特殊效果，主要用于方便测试和调试，也可以当成彩蛋。
 */
export class SecretEngine {
  // 存的是小写后的按键名称
  pressedKeys: Queue<string> = new Queue<string>();
  // 最大按键数量
  static maxPressedKeys = 20;

  constructor() {
    // 使用keyup，更省性能。防止按下某个键不动时，一直触发效果
    window.addEventListener("keyup", (event) => {
      this.pressedKeys.enqueue(event.key.toLowerCase());
      const isTriggered = this.detectAndCall();
      console.log(this.pressedKeys.arrayList);
      if (isTriggered) {
        // 清空队列
        this.pressedKeys.clear();
        Stage.effectMachine.addEffect(TextRiseEffect.default("触发了测试按键"));
      }
      // 将队列长度限制
      while (this.pressedKeys.length > SecretEngine.maxPressedKeys) {
        this.pressedKeys.dequeue();
      }
    });
  }

  keyPressedTable: Record<string, () => void> = {
    "arrowup arrowup arrowdown arrowdown arrowleft arrowright arrowleft arrowright b a": () => {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
    },
    "1 1 4 5 1 4": () => {
      Camera.clearMoveCommander();
    },
    "b o y n e x t d o o r": () => {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      StageManager.addOnePortalNode();
    },
    "c o l l a b o r a t e": () => {
      CollaborationEngine.openStartCollaborationPanel();
    },
    "c r e a t e f o l d e r w i n": () => {
      createFolder("D:\\111\\111");
    },
    "r o l l i n g 1": () => {
      let tick = 0;
      setInterval(() => {
        Camera.currentScale = Math.sin(tick) + 1;
        Camera.location = Vector.getZero();
        tick++;
      });
    },
    "t r e e r e c t": () => {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      const selectNode = StageManager.getSelectedEntities()[0];
      if (!selectNode) {
        return;
      }
      if (selectNode instanceof ConnectableEntity) {
        const rect = AutoLayoutFastTree.getTreeBoundingRectangle(selectNode);
        Stage.effectMachine.addEffect(RectangleNoteEffect.fromShiftClickSelect(rect.clone()));
      }
    },
    "a l t": () => {
      const selectNodes = StageManager.getSelectedEntities().filter((node) => node instanceof ConnectableEntity);
      if (selectNodes.length === 0) {
        return;
      }
      AutoLayoutFastTree.alignColumnTrees(selectNodes);
    },
    "m v e t": () => {
      AutoLayoutFastTree.moveTreeRectTo(
        StageManager.getSelectedEntities()[0] as ConnectableEntity,
        Camera.location.clone(),
      );
    },
  };

  // 监听按键 并触发相应效果，每次按键都会触发
  detectAndCall(): boolean {
    const keys = this.pressedKeys.arrayList.join(" ");
    for (const key in this.keyPressedTable) {
      if (keys.includes(key)) {
        this.keyPressedTable[key]();
        return true;
      }
    }
    return false;
  }
}
