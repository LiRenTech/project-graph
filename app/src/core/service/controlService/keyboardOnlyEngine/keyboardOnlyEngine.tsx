import { v4 } from "uuid";
import { getEnterKey } from "../../../../utils/keyboardFunctions";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { GraphMethods } from "../../../stage/stageManager/basicMethods/GraphMethods";
import { StageAutoAlignManager } from "../../../stage/stageManager/concreteMethods/StageAutoAlignManager";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { EntityDashTipEffect } from "../../feedbackService/effectEngine/concrete/EntityDashTipEffect";
import { EntityShakeEffect } from "../../feedbackService/effectEngine/concrete/EntityShakeEffect";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { Settings } from "../../Settings";
import { editTextNode } from "../controller/concrete/utilsControl";
import { KeyboardOnlyDirectionController } from "./keyboardOnlyDirectionController";
import { SelectChangeEngine } from "./selectChangeEngine";

/**
 * 纯键盘控制的相关引擎
 */
export namespace KeyboardOnlyEngine {
  /**
   * 虚拟目标位置控制器
   */
  const targetLocationController = new KeyboardOnlyDirectionController();

  export function virtualTargetLocation(): Vector {
    return targetLocationController.location;
  }

  let textNodeStartEditMode: Settings.Settings["textNodeStartEditMode"] = "enter";
  let textNodeSelectAllWhenStartEditByKeyboard: boolean = true;

  export function init() {
    bindKeyEvents();
    targetLocationController.init();
    Settings.watch("textNodeStartEditMode", (value) => {
      textNodeStartEditMode = value;
    });
    Settings.watch("textNodeSelectAllWhenStartEditByKeyboard", (value) => {
      textNodeSelectAllWhenStartEditByKeyboard = value;
    });
  }

  export function logicTick() {
    targetLocationController.logicTick();
  }

  /**
   * 开始绑定按键事件
   * 仅在最开始调用一次
   */
  function bindKeyEvents() {
    const startEditNode = (event: KeyboardEvent, selectedNode: TextNode) => {
      event.preventDefault(); // 这个prevent必须开启，否则会立刻在刚创建的输入框里输入一个换行符。
      addSuccessEffect();
      // 编辑节点
      editTextNode(selectedNode, textNodeSelectAllWhenStartEditByKeyboard);
    };

    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const enterKeyDetail = getEnterKey(event);
        if (textNodeStartEditMode === enterKeyDetail) {
          // 这个还必须在down的位置上，因为在up上会导致无限触发
          const selectedNode = StageManager.getTextNodes().find((node) => node.isSelected);
          if (!selectedNode) return;
          startEditNode(event, selectedNode);
        } else {
          // 用户可能记错了快捷键
          addFailEffect();
        }
      } else if (event.key === " ") {
        if (textNodeStartEditMode === "space") {
          const selectedNode = StageManager.getTextNodes().find((node) => node.isSelected);
          if (!selectedNode) return;
          startEditNode(event, selectedNode);
        }
      } else if (event.key === "Escape") {
        // 取消全部选择
        for (const stageObject of StageManager.getStageObject()) {
          stageObject.isSelected = false;
        }
      } else if (event.key === "F2") {
        const selectedNode = StageManager.getTextNodes().find((node) => node.isSelected);
        if (!selectedNode) return;
        // 编辑节点
        editTextNode(selectedNode);
      } else {
        SelectChangeEngine.listenKeyDown(event);
      }
    });
  }

  /**
   * 树形深度生长节点
   * @returns
   */
  export function onDeepGenerateNode() {
    const rootNode = StageManager.getConnectableEntity().find((node) => node.isSelected);
    if (!rootNode) return;
    Camera.clearMoveCommander();
    Camera.speed = Vector.getZero();
    // 在自己的右下方创建一个节点
    // 先找到自己所有的第一层后继节点，如果没有则在正右方创建节点。
    const childSet = GraphMethods.getOneStepSuccessorSet(rootNode);

    // 寻找创建位置
    let createLocation;
    if (childSet.length === 0) {
      // 在正右侧创建
      createLocation = rootNode.collisionBox.getRectangle().rightCenter.add(new Vector(100, 0));
    } else {
      // 在所有子节点中的下方创建
      childSet.sort((a, b) => a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top);
      const lastChild = childSet[childSet.length - 1];
      createLocation = lastChild.collisionBox.getRectangle().bottomCenter.add(new Vector(0, 10));
    }
    // 创建位置寻找完毕
    const newNode = new TextNode({
      text: "新节点",
      details: "",
      uuid: v4(),
      location: [createLocation.x, createLocation.y],
      size: [100, 100],
    });
    StageManager.addTextNode(newNode);
    // 连接节点
    StageManager.connectEntity(rootNode, newNode);
    // 继承父节点颜色
    if (rootNode instanceof TextNode) {
      newNode.color = rootNode.color.clone();
    }
    // 重新排列树形节点
    const rootNodeParents = GraphMethods.getRoots(rootNode);
    if (rootNodeParents.length === 1) {
      const rootNodeParent = rootNodeParents[0];
      if (GraphMethods.isTree(rootNodeParent)) {
        StageAutoAlignManager.autoLayoutSelectedFastTreeModeRight(rootNodeParent);
        // 更新选择状态
        rootNodeParent.isSelected = false;
        newNode.isSelected = true;
      }
    }
    // 特效
    Stage.effectMachine.addEffects(EdgeRenderer.getConnectedEffects(rootNode, newNode));
    setTimeout(() => {
      // 防止把反引号给输入进去
      editTextNode(newNode);
    }, 100);
  }

  /**
   * 树形广度生长节点
   * @returns
   */
  export function onBroadGenerateNode() {
    const currentSelectNode = StageManager.getConnectableEntity().find((node) => node.isSelected);
    if (!currentSelectNode) return;
    Camera.clearMoveCommander();
    Camera.speed = Vector.getZero();
    // 找到自己的父节点
    const parents = GraphMethods.nodeParentArray(currentSelectNode);
    if (parents.length === 0) return;
    if (parents.length !== 1) return;
    const parent = parents[0];
    // 当前选择的节点的正下方创建一个节点
    // 找到创建点
    const newLocation = currentSelectNode.collisionBox.getRectangle().leftBottom.add(new Vector(0, 1));
    const newNode = new TextNode({
      text: "新节点",
      details: "",
      uuid: v4(),
      location: [newLocation.x, newLocation.y],
      size: [100, 100],
    });
    StageManager.addTextNode(newNode);
    // 连接节点
    StageManager.connectEntity(parent, newNode);
    // 继承父节点颜色
    if (parent instanceof TextNode) {
      newNode.color = parent.color.clone();
    }
    // 重新排列树形节点
    const rootNodeParents = GraphMethods.getRoots(parent);
    if (rootNodeParents.length === 1) {
      const rootNodeParent = rootNodeParents[0];
      if (GraphMethods.isTree(rootNodeParent)) {
        StageAutoAlignManager.autoLayoutSelectedFastTreeModeRight(rootNodeParent);
        // 更新选择状态
        rootNodeParent.isSelected = false;
        newNode.isSelected = true;
      }
    }
    Stage.effectMachine.addEffects(EdgeRenderer.getConnectedEffects(parent, newNode));
    setTimeout(() => {
      // 防止把反引号给输入进去
      editTextNode(newNode);
    }, 100);
  }

  function addSuccessEffect() {
    const textNodes = StageManager.getTextNodes().filter((textNode) => textNode.isSelected);
    for (const textNode of textNodes) {
      Stage.effectMachine.addEffect(new EntityDashTipEffect(50, textNode.collisionBox.getRectangle()));
    }
  }

  function addFailEffect() {
    const textNodes = StageManager.getTextNodes().filter((textNode) => textNode.isSelected);
    for (const textNode of textNodes) {
      Stage.effectMachine.addEffect(EntityShakeEffect.fromEntity(textNode));
    }
    Stage.effectMachine.addEffect(TextRiseEffect.default("您可能记错了节点进入编辑状态的控制键设置"));
  }
}
