import { v4 } from "uuid";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { GraphMethods } from "../../../stage/stageManager/basicMethods/GraphMethods";
import { StageAutoAlignManager } from "../../../stage/stageManager/concreteMethods/StageAutoAlignManager";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { editTextNode } from "../controller/concrete/utilsControl";
import { Direction } from "../../../../types/directions";
import { KeyboardOnlyEngine } from "./keyboardOnlyEngine";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";

/**
 * 专用于Xmind式的树形结构的键盘操作引擎
 */
export namespace KeyboardOnlyTreeEngine {
  /**
   * 树形深度生长节点
   * @returns
   */
  export function onDeepGenerateNode() {
    if (!KeyboardOnlyEngine.isOpenning()) {
      return;
    }
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
      size: [rootNode instanceof TextNode ? rootNode.collisionBox.getRectangle().width : 100, 100],
      sizeAdjust: rootNode instanceof TextNode ? rootNode.sizeAdjust : "auto",
    });
    StageManager.addTextNode(newNode);

    // 如果是在框里，则把新生长的节点也纳入到框里
    const fatherSections = SectionMethods.getFatherSections(rootNode);
    for (const section of fatherSections) {
      section.childrenUUIDs.push(newNode.uuid);
      section.children.push(newNode);
    }

    // 连接节点
    StageManager.connectEntity(rootNode, newNode);
    const newEdges = GraphMethods.getEdgesBetween(rootNode, newNode);
    StageManager.changeEdgesConnectLocation(newEdges, Direction.Right, true);
    StageManager.changeEdgesConnectLocation(newEdges, Direction.Left);
    // 继承父节点颜色
    if (rootNode instanceof TextNode) {
      newNode.color = rootNode.color.clone();
    }
    // 重新排列树形节点
    const rootNodeParents = GraphMethods.getRoots(rootNode);
    if (rootNodeParents.length === 1) {
      const rootNodeParent = rootNodeParents[0];
      if (GraphMethods.isTree(rootNodeParent)) {
        if (KeyboardOnlyEngine.autoLayoutWhenTreeGenerate) {
          StageAutoAlignManager.autoLayoutSelectedFastTreeModeRight(rootNodeParent);
        }
        // 更新选择状态
        rootNodeParent.isSelected = false;
        newNode.isSelected = true;
        rootNode.isSelected = false;
      }
    }

    // 特效
    Stage.effectMachine.addEffects(EdgeRenderer.getConnectedEffects(rootNode, newNode));
    setTimeout(
      () => {
        // 防止把反引号给输入进去
        editTextNode(newNode);
      },
      (1000 / 60) * 6,
    );
    // 重置视野
    Camera.bombMove(newNode.collisionBox.getRectangle().center, 5);
  }

  /**
   * 树形广度生长节点
   * @returns
   */
  export function onBroadGenerateNode() {
    if (!KeyboardOnlyEngine.isOpenning()) {
      return;
    }
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
      size: [parent instanceof TextNode ? parent.collisionBox.getRectangle().width : 100, 100],
      sizeAdjust: parent instanceof TextNode ? parent.sizeAdjust : "auto",
    });
    StageManager.addTextNode(newNode);
    // 如果是在框里，则把新生长的节点也纳入到框里
    const fatherSections = SectionMethods.getFatherSections(parent);
    for (const section of fatherSections) {
      section.childrenUUIDs.push(newNode.uuid);
      section.children.push(newNode);
    }
    // 连接节点
    StageManager.connectEntity(parent, newNode);

    const newEdges = GraphMethods.getEdgesBetween(parent, newNode);
    StageManager.changeEdgesConnectLocation(newEdges, Direction.Right, true);
    StageManager.changeEdgesConnectLocation(newEdges, Direction.Left);

    // 继承父节点颜色
    if (parent instanceof TextNode) {
      newNode.color = parent.color.clone();
    }
    // 重新排列树形节点
    const rootNodeParents = GraphMethods.getRoots(parent);
    if (rootNodeParents.length === 1) {
      const rootNodeParent = rootNodeParents[0];
      if (GraphMethods.isTree(rootNodeParent)) {
        if (KeyboardOnlyEngine.autoLayoutWhenTreeGenerate) {
          StageAutoAlignManager.autoLayoutSelectedFastTreeModeRight(rootNodeParent);
        }
        // 更新选择状态
        rootNodeParent.isSelected = false;
        newNode.isSelected = true;
        currentSelectNode.isSelected = false;
      }
    }
    Stage.effectMachine.addEffects(EdgeRenderer.getConnectedEffects(parent, newNode));
    setTimeout(
      () => {
        // 防止把反引号给输入进去
        editTextNode(newNode);
      },
      (1000 / 60) * 6,
    );
    // 重置视野
    Camera.bombMove(newNode.collisionBox.getRectangle().center, 5);
  }
}
