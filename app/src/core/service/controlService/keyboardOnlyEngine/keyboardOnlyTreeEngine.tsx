import { v4 } from "uuid";
import { Direction } from "../../../../types/directions";
import { Vector } from "../../../dataStruct/Vector";
import { Project, service } from "../../../Project";
import { GraphMethods } from "../../../stage/stageManager/basicMethods/GraphMethods";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";

/**
 * 专用于Xmind式的树形结构的键盘操作引擎
 */
@service("keyboardOnlyTreeEngine")
export class KeyboardOnlyTreeEngine {
  constructor(private readonly project: Project) {}

  /**
   * 树形深度生长节点
   * @returns
   */
  onDeepGenerateNode() {
    if (!this.project.keyboardOnlyEngine.isOpenning()) {
      return;
    }
    const rootNode = this.project.stageManager.getConnectableEntity().find((node) => node.isSelected);
    if (!rootNode) return;
    this.project.camera.clearMoveCommander();
    this.project.camera.speed = Vector.getZero();
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
    this.project.stageManager.addTextNode(newNode);

    // 如果是在框里，则把新生长的节点也纳入到框里
    const fatherSections = SectionMethods.getFatherSections(rootNode);
    for (const section of fatherSections) {
      section.childrenUUIDs.push(newNode.uuid);
      section.children.push(newNode);
    }

    // 连接节点
    this.project.stageManager.connectEntity(rootNode, newNode);
    const newEdges = GraphMethods.getEdgesBetween(rootNode, newNode);
    this.project.stageManager.changeEdgesConnectLocation(newEdges, Direction.Right, true);
    this.project.stageManager.changeEdgesConnectLocation(newEdges, Direction.Left);
    // 继承父节点颜色
    if (rootNode instanceof TextNode) {
      newNode.color = rootNode.color.clone();
    }
    // 重新排列树形节点
    const rootNodeParents = GraphMethods.getRoots(rootNode);
    if (rootNodeParents.length === 1) {
      const rootNodeParent = rootNodeParents[0];
      if (GraphMethods.isTree(rootNodeParent)) {
        if (this.project.keyboardOnlyEngine.autoLayoutWhenTreeGenerate) {
          this.project.autoAlign.autoLayoutSelectedFastTreeModeRight(rootNodeParent);
        }
        // 更新选择状态
        rootNodeParent.isSelected = false;
        newNode.isSelected = true;
        rootNode.isSelected = false;
      }
    }

    // 特效
    this.project.effects.addEffects(this.project.edgeRenderer.getConnectedEffects(rootNode, newNode));
    setTimeout(
      () => {
        // 防止把反引号给输入进去
        this.project.controllerUtils.editTextNode(newNode);
      },
      (1000 / 60) * 6,
    );
    // 重置视野
    this.project.camera.bombMove(newNode.collisionBox.getRectangle().center, 5);
  }

  /**
   * 树形广度生长节点
   * @returns
   */
  onBroadGenerateNode() {
    if (!this.project.keyboardOnlyEngine.isOpenning()) {
      return;
    }
    const currentSelectNode = this.project.stageManager.getConnectableEntity().find((node) => node.isSelected);
    if (!currentSelectNode) return;
    this.project.camera.clearMoveCommander();
    this.project.camera.speed = Vector.getZero();
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
    this.project.stageManager.addTextNode(newNode);
    // 如果是在框里，则把新生长的节点也纳入到框里
    const fatherSections = SectionMethods.getFatherSections(parent);
    for (const section of fatherSections) {
      section.childrenUUIDs.push(newNode.uuid);
      section.children.push(newNode);
    }
    // 连接节点
    this.project.stageManager.connectEntity(parent, newNode);

    const newEdges = GraphMethods.getEdgesBetween(parent, newNode);
    this.project.stageManager.changeEdgesConnectLocation(newEdges, Direction.Right, true);
    this.project.stageManager.changeEdgesConnectLocation(newEdges, Direction.Left);

    // 继承父节点颜色
    if (parent instanceof TextNode) {
      newNode.color = parent.color.clone();
    }
    // 重新排列树形节点
    const rootNodeParents = GraphMethods.getRoots(parent);
    if (rootNodeParents.length === 1) {
      const rootNodeParent = rootNodeParents[0];
      if (GraphMethods.isTree(rootNodeParent)) {
        if (this.project.keyboardOnlyEngine.autoLayoutWhenTreeGenerate) {
          this.project.autoAlign.autoLayoutSelectedFastTreeModeRight(rootNodeParent);
        }
        // 更新选择状态
        rootNodeParent.isSelected = false;
        newNode.isSelected = true;
        currentSelectNode.isSelected = false;
      }
    }
    this.project.effects.addEffects(this.project.edgeRenderer.getConnectedEffects(parent, newNode));
    setTimeout(
      () => {
        // 防止把反引号给输入进去
        this.project.controllerUtils.editTextNode(newNode);
      },
      (1000 / 60) * 6,
    );
    // 重置视野
    this.project.camera.bombMove(newNode.collisionBox.getRectangle().center, 5);
  }

  /**
   * 根据某个已经选中的节点，调整其所在树的结构
   * @param entity
   */
  adjustTreeNode(entity: ConnectableEntity) {
    const rootNodeParents = GraphMethods.getRoots(entity);
    this.project.autoAlign.autoLayoutSelectedFastTreeModeRight(rootNodeParents[0]);
  }
}
