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
import { Settings } from "../../Settings";
import { StageEntityMoveManager } from "../../../stage/stageManager/concreteMethods/StageEntityMoveManager";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Section } from "../../../stage/stageObject/entity/Section";
import { LineEdge } from "../../../stage/stageObject/association/LineEdge";

interface SecretItem {
  name: string;
  func: () => void;
  explain?: string;
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
  public getAllSecretKeysList(): { keys: string; name: string; explain: string }[] {
    const result = [];
    for (const key in this.keyPressedTable) {
      result.push({
        keys: key,
        name: this.keyPressedTable[key].name,
        explain: this.keyPressedTable[key].explain || "",
      });
    }
    return result;
  }

  /**
   * 检查秘籍键是否重复，即：某个秘籍键序列是否包含于其他秘籍键序列中
   * 不能出现这种情况，因为会导致冲突
   */
  public checkSecretsRepeat(): string[] {
    const conflictKeys = [];
    const allKeys = Object.keys(this.keyPressedTable);
    for (let i = 0; i < allKeys.length; i++) {
      const key1 = allKeys[i];
      for (let j = i + 1; j < allKeys.length; j++) {
        const key2 = allKeys[j];
        if (key1.includes(key2) || key2.includes(key1)) {
          conflictKeys.push(`【${key1}】 - 【${key2}】`);
        }
      }
    }
    return conflictKeys;
  }

  /**
   * 所有的秘籍键列表
   */
  keyPressedTable: Record<string, SecretItem> = {
    "arrowup arrowup arrowdown arrowdown arrowleft arrowright arrowleft arrowright b a": {
      name: "屏幕闪黑特效",
      explain: "类似于秘籍键中的hello world，测试出现黑屏的效果时则证明秘籍键系统正常运行了",
      func: () => {
        Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
      },
    },
    "i n t j": {
      name: "将所有可连接节点的坐标位置对齐到整数",
      explain: "可以大幅度减小json文件的体积",
      func: () => {
        const entities = StageManager.getConnectableEntity();
        for (const entity of entities) {
          const leftTopLocation = entity.collisionBox.getRectangle().location;
          const IntLocation = new Vector(Math.round(leftTopLocation.x), Math.round(leftTopLocation.y));
          entity.moveTo(IntLocation);
        }
      },
    },
    "o k k": {
      name: "将选中的文本节点都打上对勾✅，并标为绿色",
      explain: "仅对文本节点生效，选中后再输入一次可以取消对勾",
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
    "b l a c k k": {
      name: "切换成黑色主题",
      explain: "切换后需要在画布上划一刀才生生效",
      func() {
        Settings.set("theme", "dark");
      },
    },
    "w h i t e e": {
      name: "切换成白色主题",
      explain: "切换后需要在画布上划一刀才生生效",
      func() {
        Settings.set("theme", "light");
      },
    },
    "* * *": {
      name: "切换专注模式",
      async func() {
        Settings.set("isClassroomMode", !(await Settings.get("isClassroomMode")));
      },
    },
    "p s a + +": {
      name: "增加笔刷不透明度通道值",
      async func() {
        Stage.drawingMachine.changeCurrentStrokeColorAlpha(0.1);
      },
    },
    "p s a - -": {
      name: "减少笔刷不透明度通道值",
      async func() {
        Stage.drawingMachine.changeCurrentStrokeColorAlpha(-0.1);
      },
    },
    "8 8": {
      name: "顶部对齐",
      explain: "小键盘的向上",
      func() {
        StageEntityMoveManager.alignTop();
      },
    },
    "2 2": {
      name: "底部对齐",
      explain: "小键盘的向下",
      func() {
        StageEntityMoveManager.alignBottom();
      },
    },
    "4 4": {
      name: "左侧对齐",
      explain: "小键盘的向左",
      func() {
        StageEntityMoveManager.alignLeft();
      },
    },
    "6 6": {
      name: "右侧对齐",
      explain: "小键盘的向右",
      func() {
        StageEntityMoveManager.alignRight();
      },
    },
    "4 6 4 6": {
      name: "相等间距水平对齐",
      explain: "小键盘的左右左右，晃一晃就等间距了",
      func() {
        StageEntityMoveManager.alignHorizontalSpaceBetween();
      },
    },
    "8 2 8 2": {
      name: "相等间距垂直对齐",
      explain: "小键盘的上下上下，晃一晃就等间距了",
      func() {
        StageEntityMoveManager.alignVerticalSpaceBetween();
      },
    },
    "4 5 6": {
      name: "中心水平对齐",
      explain: "小键盘横着从左到右穿一串",
      func() {
        StageEntityMoveManager.alignCenterHorizontal();
      },
    },
    "8 5 2": {
      name: "中心垂直对齐",
      explain: "小键盘竖着从上到下穿一串",
      func() {
        StageEntityMoveManager.alignCenterVertical();
      },
    },
    "- - a l l": {
      name: "将所有选中实体进行全连接",
      explain: "用于特殊教学场景或图论教学，“- -”开头表示连线相关",
      func() {
        const selectedNodes = StageManager.getSelectedEntities();
        for (let i = 0; i < selectedNodes.length; i++) {
          for (let j = 0; j < selectedNodes.length; j++) {
            const fromNode = selectedNodes[i];
            const toNode = selectedNodes[j];
            if (fromNode === toNode) {
              continue;
            }
            if (fromNode instanceof ConnectableEntity && toNode instanceof ConnectableEntity) {
              StageManager.connectEntity(fromNode, toNode, false);
            }
          }
        }
      },
    },
    "- - r i g h t": {
      name: "将所有选中实体按照从左到右的摆放位置进行连接",
      func() {
        const selectedNodes = StageManager.getSelectedEntities().filter(
          (entity) => entity instanceof ConnectableEntity,
        );
        if (selectedNodes.length <= 1) {
          return;
        }
        selectedNodes.sort(
          (a, b) => a.collisionBox.getRectangle().location.x - b.collisionBox.getRectangle().location.x,
        );

        for (let i = 0; i < selectedNodes.length - 1; i++) {
          const fromNode = selectedNodes[i];
          const toNode = selectedNodes[i + 1];
          if (fromNode === toNode) {
            continue;
          }
          StageManager.connectEntity(fromNode, toNode, false);
        }
      },
    },
    "- - d o w n": {
      name: "将所有选中实体按照从上到下的摆放位置进行连接",
      func() {
        const selectedNodes = StageManager.getSelectedEntities().filter(
          (entity) => entity instanceof ConnectableEntity,
        );
        if (selectedNodes.length <= 1) {
          return;
        }
        selectedNodes.sort(
          (a, b) => a.collisionBox.getRectangle().location.y - b.collisionBox.getRectangle().location.y,
        );

        for (let i = 0; i < selectedNodes.length - 1; i++) {
          const fromNode = selectedNodes[i];
          const toNode = selectedNodes[i + 1];
          if (fromNode === toNode) {
            continue;
          }
          StageManager.connectEntity(fromNode, toNode, false);
        }
      },
    },
    "+ e d g e": {
      name: "选中所有连线",
      explain: "仅选择所有视野内的连线",
      func() {
        const selectedEdges = StageManager.getAssociations();
        const viewRect = Renderer.getCoverWorldRectangle();
        for (const edge of selectedEdges) {
          // 是否在视野内
          if (Renderer.isOverView(viewRect, edge)) {
            continue;
          }
          edge.isSelected = true;
          console.log(edge);
        }
      },
    },
    "; r e d": {
      name: "将所有选中物体染色为纯红色",
      explain: "具体为：(239, 68, 68)，仅作快速标注用",
      func() {
        const selectedStageObject = StageManager.getStageObject().filter((obj) => obj.isSelected);
        for (const obj of selectedStageObject) {
          if (obj instanceof TextNode || obj instanceof Section || obj instanceof LineEdge) {
            obj.color = new Color(239, 68, 68);
          }
        }
      },
    },
    "b .": {
      name: "将所选实体的颜色亮度增加",
      explain: "不能对没有上色的或者透明的实体使用，b是brightness，句号键也是>键，可以看成往右走，数值增大",
      func() {
        const selectedStageObject = StageManager.getStageObject().filter((obj) => obj.isSelected);
        for (const obj of selectedStageObject) {
          if (obj instanceof TextNode || obj instanceof Section || obj instanceof LineEdge) {
            if (obj.color.a === 0) {
              continue;
            }
            obj.color = new Color(
              Math.min(255, obj.color.r + 20),
              Math.min(255, obj.color.b + 20),
              Math.min(255, obj.color.g + 20),
              obj.color.a,
            );
          }
        }
      },
    },
    "b ,": {
      name: "将所选实体的颜色亮度减少",
      explain: "不能对没有上色的或者透明的实体使用，b是brightness，逗号键也是<键，可以看成往左走，数值减小",
      func() {
        const selectedStageObject = StageManager.getStageObject().filter((obj) => obj.isSelected);
        for (const obj of selectedStageObject) {
          if (obj instanceof TextNode || obj instanceof Section || obj instanceof LineEdge) {
            if (obj.color.a === 0) {
              continue;
            }
            obj.color = new Color(
              Math.max(0, obj.color.r - 20),
              Math.max(0, obj.color.b - 20),
              Math.max(0, obj.color.g - 20),
              obj.color.a,
            );
          }
        }
      },
    },
    "; ,": {
      name: "将所选实体的颜色渐变",
      explain: "后续打算做成更改色相环，目前还不完善",
      func() {
        const selectedStageObject = StageManager.getStageObject().filter((obj) => obj.isSelected);
        for (const obj of selectedStageObject) {
          if (obj instanceof TextNode || obj instanceof Section || obj instanceof LineEdge) {
            if (obj.color.a === 0) {
              continue;
            }
            const oldColor = obj.color.clone();
            obj.color = new Color(Math.max(oldColor.a - 20, 0), Math.min(255, oldColor.g + 20), oldColor.b, oldColor.a);
          }
        }
      },
    },

    // ====================
    // 以上是可能很方便的给用户用的
    //
    // 以下全是开发者测试用的方便写的东西
    // ====================
    // "b o y": {
    //   name: "test",
    //   func: () => {},
    // },
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
      name: "用特效高亮一次所有选中的section框及其内部全部实体",
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
