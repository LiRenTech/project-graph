import { v4 } from "uuid";
import { Direction } from "../../../../types/directions";
import { createFolder } from "../../../../utils/fs";
import { averageColors, Color } from "../../../dataStruct/Color";
import { Queue } from "../../../dataStruct/Queue";
import { Vector } from "../../../dataStruct/Vector";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { StageHistoryManager } from "../../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";
import { LayoutManualAlignManager } from "../../../stage/stageManager/concreteMethods/layoutManager/layoutManualAlignManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { CublicCatmullRomSplineEdge } from "../../../stage/stageObject/association/CublicCatmullRomSplineEdge";
import { LineEdge } from "../../../stage/stageObject/association/LineEdge";
import { PortalNode } from "../../../stage/stageObject/entity/PortalNode";
import { Section } from "../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { Settings } from "../../Settings";
import { CollaborationEngine } from "../../dataManageService/collaborationEngine/CollaborationEngine";
import { RectangleNoteEffect } from "../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../feedbackService/effectEngine/concrete/ViewFlashEffect";
import { AutoLayoutFastTree } from "../autoLayoutEngine/autoLayoutFastTreeMode";
import { MultiTargetUndirectedEdge } from "../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { Random } from "../../../algorithm/random";

interface SecretKeyItem {
  name: string;
  func: () => void;
  explain?: string;
}

/**
 * 秘籍键系统
 * 类似于游戏中的秘籍键，可以触发一些特殊效果，主要用于方便测试和调试，也可以当成彩蛋。
 */
export class SecretKeysEngine {
  // 存的是小写后的按键名称
  pressedKeys: Queue<string> = new Queue<string>();
  // 最大按键数量
  static maxPressedKeys = 20;

  constructor() {
    // 使用keyup，更省性能。防止按下某个键不动时，一直触发效果
    window.addEventListener("keyup", (event) => {
      this.pressedKeys.enqueue(event.key.toLowerCase());
      const { isTriggered, secretName, key } = this.detectAndCall();
      // console.log(this.pressedKeys.arrayList);
      if (isTriggered) {
        // 清空队列
        this.pressedKeys.clear();
        Stage.effectMachine.addEffect(TextRiseEffect.default(`触发了秘籍键: 【${key}】\n${secretName}`));
      }
      // 将队列长度限制
      while (this.pressedKeys.length > SecretKeysEngine.maxPressedKeys) {
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
  keyPressedTable: Record<string, SecretKeyItem> = {
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
      explain: "切换后需要在舞台上划一刀才生生效",
      func() {
        Settings.set("theme", "dark");
      },
    },
    "w h i t e e": {
      name: "切换成白色主题",
      explain: "切换后需要在舞台上划一刀才生生效",
      func() {
        Settings.set("theme", "light");
      },
    },
    "p a r k k": {
      name: "切换成公园主题",
      explain: "切换后需要在舞台上划一刀才生生效",
      func() {
        Settings.set("theme", "park");
      },
    },
    "m k l": {
      name: "切换成马卡龙主题",
      explain: "切换后需要在舞台上划一刀才生生效",
      func() {
        Settings.set("theme", "macaron");
      },
    },
    "m l d": {
      name: "切换成莫兰迪主题",
      explain: "切换后需要在舞台上划一刀才生生效",
      func() {
        Settings.set("theme", "morandi");
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
      name: "将选中实体顶部对齐，选中的连线从源实体的顶边缘射出，到目标实体底边缘结束",
      explain: "小键盘的向上",
      func() {
        LayoutManualAlignManager.alignTop();
        StageManager.changeSelectedEdgeConnectLocation(Direction.Up, true);
        StageManager.changeSelectedEdgeConnectLocation(Direction.Down);
      },
    },
    "2 2": {
      name: "将选中实体底部对齐，选中的连线从源实体的底边缘射出，到目标实体顶边缘结束",
      explain: "小键盘的向下",
      func() {
        LayoutManualAlignManager.alignBottom();
        StageManager.changeSelectedEdgeConnectLocation(Direction.Down, true);
        StageManager.changeSelectedEdgeConnectLocation(Direction.Up);
      },
    },
    "4 4": {
      name: "将选中实体左侧对齐，选中的连线从源实体的左边缘射出，到目标实体右边缘结束",
      explain: "小键盘的向左",
      func() {
        LayoutManualAlignManager.alignLeft();
        StageManager.changeSelectedEdgeConnectLocation(Direction.Left, true);
        StageManager.changeSelectedEdgeConnectLocation(Direction.Right);
      },
    },
    "6 6": {
      name: "将选中实体右侧对齐，选中的连线从源实体的右边缘射出，到目标实体左边缘结束",
      explain: "小键盘的向右",
      func() {
        LayoutManualAlignManager.alignRight();
        StageManager.changeSelectedEdgeConnectLocation(Direction.Right, true);
        StageManager.changeSelectedEdgeConnectLocation(Direction.Left);
      },
    },
    "4 6 4 6": {
      name: "相等间距水平对齐",
      explain: "小键盘的左右左右，晃一晃就等间距了",
      func() {
        LayoutManualAlignManager.alignHorizontalSpaceBetween();
      },
    },
    "8 2 8 2": {
      name: "相等间距垂直对齐",
      explain: "小键盘的上下上下，晃一晃就等间距了",
      func() {
        LayoutManualAlignManager.alignVerticalSpaceBetween();
      },
    },
    "5 4 6": {
      name: "中心水平对齐",
      explain: "小键盘：先中，然后左右",
      func() {
        LayoutManualAlignManager.alignCenterHorizontal();
      },
    },
    "5 8 2": {
      name: "中心垂直对齐",
      explain: "小键盘：先中，然后上下",
      func() {
        LayoutManualAlignManager.alignCenterVertical();
      },
    },
    "4 5 6": {
      name: "向右紧密堆积一排",
      explain: "小键盘横着从左到右穿一串",
      func() {
        LayoutManualAlignManager.alignLeftToRightNoSpace();
      },
    },
    "8 5 2": {
      name: "向下紧密堆积一列",
      explain: "小键盘竖着从上到下穿一串",
      func() {
        LayoutManualAlignManager.alignTopToBottomNoSpace();
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
    "t t t": {
      name: "将选中的文本节点，切换大小调整模式",
      explain:
        "仅对文本节点生效，auto模式：输入文字不能自动换行，manual模式：宽度为框的宽度，宽度超出自动换行\n如果是auto模式，则转换成manual模式，manual模式则转换成auto模式",
      func() {
        const selectedTextNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
        for (const node of selectedTextNodes) {
          if (node.sizeAdjust === "auto") {
            node.sizeAdjust = "manual";
            node.resizeHandle(Vector.getZero());
          } else if (node.sizeAdjust === "manual") {
            node.sizeAdjust = "auto";
            node.forceAdjustSizeByText();
          }
        }
      },
    },
    "k e i": {
      name: "将选中的文本节点，剋(kēi)成小块",
      explain: "仅对文本节点生效，根据标点符号，空格、换行符等进行分割，将其分割成小块",
      func() {
        const selectedTextNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
        selectedTextNodes.forEach((node) => {
          node.isSelected = false;
        });
        for (const node of selectedTextNodes) {
          const text = node.text;
          const seps = [" ", "\n", "\t", ".", ",", "，", "。", "、", "；", "：", "？", "！"];

          // 转义正则特殊字符
          const escapedSeps = seps.map((sep) => sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
          // 创建正则表达式，支持多个分隔符同时分割
          const regex = new RegExp(escapedSeps.join("|"), "g");
          // 分割后过滤空字符串
          const splitedTextList = text.split(regex).filter((item) => item !== "");
          // 将分割后的字符串添加到舞台
          const putLocation = node.collisionBox.getRectangle().location.clone();

          const newNodes = [];
          for (const splitedText of splitedTextList) {
            const newTextNode = new TextNode({
              uuid: v4(),
              text: splitedText,
              location: [putLocation.x, putLocation.y],
              size: [1, 1],
              color: node.color.clone().toArray(),
              // sizeAdjust: node.sizeAdjust,
            });
            newNodes.push(newTextNode);
            StageManager.addTextNode(newTextNode);
            putLocation.y += 100;
          }
          // 向下紧密堆积一下
          newNodes.forEach((newNode) => {
            newNode.isSelected = true;
          });
          LayoutManualAlignManager.alignTopToBottomNoSpace();
          newNodes.forEach((newNode) => {
            newNode.isSelected = false;
          });
        }
        // 删除原来的文本节点
        StageManager.deleteEntities(selectedTextNodes);
      },
    },
    "r u a": {
      name: "将选中的多个文本节点，挼ruá (合并)成一个文本节点，颜色也会取平均值",
      explain: "仅对文本节点生效，顺序按从上到下排列，节点的位置按节点矩形左上角顶点坐标为准",
      func() {
        let selectedTextNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
        if (selectedTextNodes.length <= 1) {
          setTimeout(() => {
            Stage.effectMachine.addEffect(TextRiseEffect.default("rua的节点数量不能小于2"));
          }, 500);
          return;
        }
        // 将选中的节点按照从上到下的顺序排序，如果y值位置一致，则
        selectedTextNodes = selectedTextNodes.sort(
          (a, b) => a.collisionBox.getRectangle().location.y - b.collisionBox.getRectangle().location.y,
        );
        let mergeText = "";
        let mergeDetails = "";
        for (const textNode of selectedTextNodes) {
          mergeText += textNode.text + "\n";
          mergeDetails += textNode.details;
        }
        mergeText = mergeText.trim();

        const leftTop = Rectangle.getBoundingRectangle(
          selectedTextNodes.map((node) => node.collisionBox.getRectangle()),
        ).leftTop;
        const avgColor = averageColors(selectedTextNodes.map((node) => node.color));
        const newTextNode = new TextNode({
          uuid: v4(),
          text: mergeText,
          location: [leftTop.x, leftTop.y],
          size: [400, 1],
          color: avgColor.toArray(),
          sizeAdjust: "manual",
          details: mergeDetails,
        });
        StageManager.addTextNode(newTextNode);
        // 删除原来的文本节点
        StageManager.deleteEntities(selectedTextNodes);
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
    "z e r o": {
      name: "将选中的实体移动到0,0位置",
      func() {
        const selectedNodes = StageManager.getSelectedEntities();
        for (const node of selectedNodes) {
          node.moveTo(Vector.getZero());
        }
      },
    },
    "t u r n a r r o u n d 1": {
      name: "将选中的实体永远原地旋转",
      explain: "如果关闭，重启软件即可恢复",
      func() {
        const selectedNodes = StageManager.getSelectedEntities();
        let i = 0;
        setInterval(() => {
          i++;
          selectedNodes.forEach((node) => {
            node.move(Vector.fromDegrees(i));
          });
        });
      },
    },
    "= = =": {
      name: "将选中的可连接实体添加多源无向边",
      explain: "测试中",
      func() {
        const selectedNodes = StageManager.getSelectedEntities().filter((node) => node instanceof ConnectableEntity);
        if (selectedNodes.length <= 1) {
          return;
        }
        // 开始添加多源无向边
        const multiTargetUndirectedEdge = MultiTargetUndirectedEdge.createFromSomeEntity(selectedNodes);
        StageManager.addAssociation(multiTargetUndirectedEdge);
      },
    },
    "e e e e e": {
      name: "详略交换",
      explain:
        "将所有选中的文本节点的详细信息和实际内容进行交换，连按5次e，主要用于直接粘贴进来的文本内容想写入详细信息\n\n注：将详细信息换入节点内容后滑动滚轮可能有概率丢失文字\n",
      func() {
        const selectedTextNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
        for (const node of selectedTextNodes) {
          const details = node.details;
          const text = node.text;
          node.details = text;
          node.text = details;
          // 刷新一下
          node.forceAdjustSizeByText();
        }
        StageHistoryManager.recordStep();
      },
    },
    "e m o j i * *": {
      name: "生成超大量表情节点",
      explain:
        "高性能消耗！将摄像机移动到空旷地方，确保周围边长为4000px的正方形区域内都没有内容再按次指令，即可生成大量表情节点",
      func() {
        // 定义 Emoji 的 Unicode 范围（基于 Unicode 13.0）
        const emojiRanges = [
          [0x1f600, 0x1f64f], // Emoticons
          [0x1f300, 0x1f5ff], // Symbols & Pictographs
          [0x1f680, 0x1f6ff], // Transport & Map
          [0x1f1e6, 0x1f1ff], // Flags
          [0x2600, 0x26ff], // Miscellaneous Symbols
          [0x2700, 0x27bf], // Dingbats
          [0xfe00, 0xfe0f], // Variation Selectors
          [0x1f900, 0x1f9ff], // Supplemental Symbols
          [0x1fa70, 0x1faff], // Chess & Games
        ];

        // 生成 Emoji 的函数
        function generateEmojis(): string[] {
          const emojis: string[] = [];

          for (const [start, end] of emojiRanges) {
            for (let codePoint = start; codePoint <= end; codePoint++) {
              try {
                // 使用 fromCodePoint 处理 32 位编码
                const emoji = String.fromCodePoint(codePoint);
                emojis.push(emoji);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (e) {
                // 忽略无效码点（如代理对间隙）
              }
            }
          }

          return emojis;
        }
        const currentLocation = Camera.location.clone();
        for (const emoji of generateEmojis()) {
          const textNode = new TextNode({
            uuid: v4(),
            text: emoji,
            location: currentLocation
              .add(Random.randomVectorOnNormalCircle().multiply(Random.randomInt(50, 2000)))
              .toArray(),
            size: [100, 100],
            color: [0, 0, 0, 0],
            sizeAdjust: "auto",
          });
          StageManager.addTextNode(textNode);
        }
      },
    },
    "contextmenu e r r o r": {
      name: "手动测试",
      explain: "触发手动报错，用于观察红色的弹窗是否正常显示、内部报错文字是否可以复制等操作",
      func() {
        setTimeout(() => {
          throw new Error("您用秘籍键触发了手动报错，用于观察红色的弹窗是否正常显示、内部报错文字是否可以复制等操作");
        }, 1000);
      },
    },
  };

  // 监听按键 并触发相应效果，每次按键都会触发
  private detectAndCall(): { isTriggered: boolean; secretName: string; key: string } {
    const keys = this.pressedKeys.arrayList.join(" ");
    for (const key in this.keyPressedTable) {
      if (keys.includes(key)) {
        this.keyPressedTable[key].func();
        return { isTriggered: true, secretName: this.keyPressedTable[key].name, key };
      }
    }
    return { isTriggered: false, secretName: "", key: "" };
  }
}
