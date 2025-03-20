import { v4 } from "uuid";
import { createFolder } from "../../../../utils/fs";
import { Queue } from "../../../dataStruct/Queue";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { StageSectionPackManager } from "../../../stage/stageManager/concreteMethods/StageSectionPackManager";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { PortalNode } from "../../../stage/stageObject/entity/PortalNode";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { CollaborationEngine } from "../../dataManageService/collaborationEngine/CollaborationEngine";
import { RectangleNoteEffect } from "../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../feedbackService/effectEngine/concrete/ViewFlashEffect";
import { AutoLayoutFastTree } from "../autoLayoutEngine/autoLayoutFastTreeMode";
import { StageHistoryManager } from "../../../stage/stageManager/StageHistoryManager";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";
import { CublicCatmullRomSplineEdge } from "../../../stage/stageObject/association/CublicCatmullRomSplineEdge";
import { Color } from "../../../dataStruct/Color";

interface SecretItem {
  name: string;
  func: () => void;
}

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
  public getAllSecretKeysList(): { keys: string; name: string }[] {
    const result = [];
    for (const key in this.keyPressedTable) {
      result.push({ keys: key, name: this.keyPressedTable[key].name });
    }
    return result;
  }
  keyPressedTable: Record<string, SecretItem> = {
    "arrowup arrowup arrowdown arrowdown arrowleft arrowright arrowleft arrowright b a": {
      name: "屏幕闪黑特效",
      func: () => {
        Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      },
    },
    "b o y n e x t d o o r": {
      name: "创建传送门",
      func: () => {
        Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
        const uuid = v4();
        StageManager.addPortalNode(
          new PortalNode({
            uuid: uuid,
            title: "PortalNode",
            portalFilePath: "",
            location: [0, 0],
            size: [500, 500],
            cameraScale: 1,
          }),
        );
        StageHistoryManager.recordStep();
      },
    },
    "c o l l a b o r a t e": {
      name: "开始协作",
      func: () => {
        CollaborationEngine.openStartCollaborationPanel();
      },
    },
    "c r e a t e f o l d e r w i n": {
      name: "在D盘创建“111”文件夹",
      func: () => {
        createFolder("D:\\111\\111");
      },
    },
    "r o l l i n g 1": {
      name: "摄像机开始疯狂缩放",
      func: () => {
        let tick = 0;
        setInterval(() => {
          Camera.currentScale = Math.sin(tick) + 1;
          Camera.location = Vector.getZero();
          tick++;
        });
      },
    },
    "t r e e r e c t": {
      name: "获取选中根节点的整个树的外接矩形",
      func: () => {
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
    },
    "a l t": {
      name: "将所有选中的根节点所对应的树进行垂直对齐",
      func: () => {
        const selectNodes = StageManager.getSelectedEntities().filter((node) => node instanceof ConnectableEntity);
        if (selectNodes.length === 0) {
          return;
        }
        AutoLayoutFastTree.alignColumnTrees(selectNodes);
      },
    },
    "m v e t": {
      name: "将选中的根节点对应的树移动到摄像机位置",
      func: () => {
        AutoLayoutFastTree.moveTreeRectTo(
          StageManager.getSelectedEntities()[0] as ConnectableEntity,
          Camera.location.clone(),
        );
      },
    },
    "t r e e 2 s e c t i o n": {
      name: "将节点树转换成section多层嵌套组",
      func() {
        const selectedNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
        StageSectionPackManager.textNodeTreeToSection(selectedNodes[0]);
      },
    },
    "t e s t s i": {
      name: "getAllEntitiesInSelectedSectionsOrEntities",
      func() {
        const selectedNodes = StageManager.getSelectedEntities();
        for (const entity of SectionMethods.getAllEntitiesInSelectedSectionsOrEntities(selectedNodes)) {
          Stage.effectMachine.addEffect(RectangleNoteEffect.fromShiftClickSelect(entity.collisionBox.getRectangle()));
        }
      },
    },
    "c r p + +": {
      name: "将选中的CR曲线增加控制点",
      func() {
        const selectedCREdge = StageManager.getSelectedAssociations().filter(
          (edge) => edge instanceof CublicCatmullRomSplineEdge,
        );
        for (const edge of selectedCREdge) {
          edge.addControlPoint();
        }
      },
    },
    "c r t + +": {
      name: "将选中的CR曲线增加tension值",
      func() {
        const selectedCREdge = StageManager.getSelectedAssociations().filter(
          (edge) => edge instanceof CublicCatmullRomSplineEdge,
        );
        for (const edge of selectedCREdge) {
          edge.tension += 0.1;
        }
      },
    },
    "c r t - -": {
      name: "将选中的CR曲线减少tension值",
      func() {
        const selectedCREdge = StageManager.getSelectedAssociations().filter(
          (edge) => edge instanceof CublicCatmullRomSplineEdge,
        );
        for (const edge of selectedCREdge) {
          edge.tension -= 0.1;
        }
      },
    },
    "o k k": {
      name: "将选中的文本节点都打上对勾，并标为绿色",
      func() {
        const selectedTextNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
        for (const node of selectedTextNodes) {
          if (node.color.equals(new Color(59, 114, 60))) {
            node.rename(node.text.replace("✅ ", ""));
            node.color = Color.Transparent;
          } else {
            node.rename("✅ " + node.text);
            node.color = new Color(59, 114, 60);
          }
        }
        StageManager.updateReferences();
      },
    },
  };

  // 监听按键 并触发相应效果，每次按键都会触发
  detectAndCall(): boolean {
    const keys = this.pressedKeys.arrayList.join(" ");
    for (const key in this.keyPressedTable) {
      if (keys.includes(key)) {
        this.keyPressedTable[key].func();
        return true;
      }
    }
    return false;
  }
}
