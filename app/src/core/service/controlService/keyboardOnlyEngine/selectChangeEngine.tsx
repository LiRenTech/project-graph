import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Line } from "../../../dataStruct/shape/Line";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { GraphMethods } from "../../../stage/stageManager/basicMethods/GraphMethods";
import { StageObjectSelectCounter } from "../../../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { LineCuttingEffect } from "../../feedbackService/effectEngine/concrete/LineCuttingEffect";
import { StageStyleManager } from "../../feedbackService/stageStyle/StageStyleManager";
import { KeyboardOnlyEngine } from "./keyboardOnlyEngine";

/**
 * 仅在keyboardOnlyEngine中使用，用于处理select change事件
 */
export namespace SelectChangeEngine {
  let lastSelectNodeByKeyboardUUID = "";

  /**
   * 向上选择节点
   * @param addSelect
   * @returns
   */
  export function selectUp(addSelect = false) {
    if (!KeyboardOnlyEngine.isOpenning()) {
      return;
    }
    const selectedNode = getCurrentSelectedNode();
    if (selectedNode === null) {
      return;
    }
    const newSelectedConnectableEntity = getMostNearConnectableEntity(
      collectTopNodes(selectedNode),
      selectedNode.collisionBox.getRectangle().center,
    );
    afterSelect(selectedNode, newSelectedConnectableEntity, !addSelect);
  }

  /**
   * 向下选择节点
   * @param addSelect
   * @returns
   */
  export function selectDown(addSelect = false) {
    if (!KeyboardOnlyEngine.isOpenning()) {
      return;
    }
    const selectedNode = getCurrentSelectedNode();
    if (selectedNode === null) {
      return;
    }
    const newSelectedConnectableEntity = getMostNearConnectableEntity(
      collectBottomNodes(selectedNode),
      selectedNode.collisionBox.getRectangle().center,
    );
    afterSelect(selectedNode, newSelectedConnectableEntity, !addSelect);
  }

  /**
   * 向左选择
   * @param addSelect
   * @returns
   */
  export function selectLeft(addSelect = false) {
    if (!KeyboardOnlyEngine.isOpenning()) {
      return;
    }
    const selectedNode = getCurrentSelectedNode();
    if (selectedNode === null) {
      return;
    }
    const newSelectedConnectableEntity = getMostNearConnectableEntity(
      collectLeftNodes(selectedNode),
      selectedNode.collisionBox.getRectangle().center,
    );
    afterSelect(selectedNode, newSelectedConnectableEntity, !addSelect);
  }

  /**
   * 向右选择
   * @param addSelect
   * @returns
   */
  export function selectRight(addSelect = false) {
    if (!KeyboardOnlyEngine.isOpenning()) {
      return;
    }
    const selectedNode = getCurrentSelectedNode();
    if (selectedNode === null) {
      return;
    }
    const newSelectedConnectableEntity = getMostNearConnectableEntity(
      collectRightNodes(selectedNode),
      selectedNode.collisionBox.getRectangle().center,
    );
    afterSelect(selectedNode, newSelectedConnectableEntity, !addSelect);
  }

  /**
   * 扩散选择（根据连线）
   * @param isKeepExpand 扩散后是否保持原有的选择
   * @param reversed 是否反向扩散
   * @returns
   */
  export function expandSelect(isKeepExpand = false, reversed: boolean = false) {
    if (!KeyboardOnlyEngine.isOpenning()) {
      return;
    }

    const selectedEntities = StageManager.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
    // 当前选择的节点
    const selectedEntitiesUUIDSet = new Set<string>();
    selectedEntities.map((entity) => selectedEntitiesUUIDSet.add(entity.uuid));
    if (selectedEntities.length === 0) {
      return;
    }
    // 第一步后继节点集合 或 前驱节点集合
    const expandUUIDSet: Set<string> = new Set();

    if (reversed) {
      // 反向扩散
      for (const selectedEntity of selectedEntities) {
        GraphMethods.nodeParentArray(selectedEntity).map((entity) => expandUUIDSet.add(entity.uuid));
      }
    } else {
      // 收集所有第一步后继节点
      for (const selectedEntity of selectedEntities) {
        GraphMethods.getOneStepSuccessorSet(selectedEntity).map((entity) => expandUUIDSet.add(entity.uuid));
      }
    }
    console.log("expandUUIDSet", expandUUIDSet);

    if (isKeepExpand) {
      // 保留原有的选择 的扩散
      const combinedUUIDSet = new Set([...selectedEntitiesUUIDSet, ...expandUUIDSet]);
      for (const newUUID of combinedUUIDSet) {
        const newEntity = StageManager.getConnectableEntityByUUID(newUUID);
        if (newEntity) {
          newEntity.isSelected = true;
        }
      }
    } else {
      // 全新的扩散
      for (const newUUID of expandUUIDSet) {
        const newEntity = StageManager.getConnectableEntityByUUID(newUUID);
        if (newEntity) {
          newEntity.isSelected = true;
        }
      }
      for (const oldUUID of selectedEntitiesUUIDSet) {
        const oldEntity = StageManager.getConnectableEntityByUUID(oldUUID);
        if (oldEntity) {
          oldEntity.isSelected = false;
        }
      }
    }
  }

  /**
   * 按下选择方向键后的善后工作
   * @param selectedNodeRect
   * @param newSelectedConnectableEntity
   * @param clearOldSelect
   * @returns
   */
  function afterSelect(
    selectedNodeRect: ConnectableEntity,
    newSelectedConnectableEntity: ConnectableEntity | null,
    clearOldSelect = true,
  ) {
    if (newSelectedConnectableEntity === null) {
      return;
    }
    newSelectedConnectableEntity.isSelected = true;
    lastSelectNodeByKeyboardUUID = newSelectedConnectableEntity.uuid;
    const newSelectNodeRect = newSelectedConnectableEntity.collisionBox.getRectangle();

    if (Camera.cameraFollowsSelectedNodeOnArrowKeys) {
      Camera.bombMove(newSelectNodeRect.center);
    }
    if (clearOldSelect) {
      selectedNodeRect.isSelected = false;
    }

    addEffect(selectedNodeRect.collisionBox.getRectangle(), newSelectNodeRect);

    // 更新选中内容的数量
    StageObjectSelectCounter.update();
  }

  function getCurrentSelectedNode(): ConnectableEntity | null {
    const selectedEntities = StageManager.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
    let selectedNode: ConnectableEntity | null = null;
    if (selectedEntities.length === 0) {
      // 如果没有，则选中距离屏幕中心最近的节点
      const nearestNode = selectMostNearLocationNode(Camera.location);
      if (nearestNode) {
        nearestNode.isSelected = true;
      }
      // throw new Error("未选中任何节点");
      return null;
    } else if (selectedEntities.length === 1) {
      selectedNode = selectedEntities[0];
    } else {
      const lastSelectNodeArr = StageManager.getEntitiesByUUIDs([lastSelectNodeByKeyboardUUID]).filter(
        (entity) => entity instanceof ConnectableEntity,
      );
      if (lastSelectNodeArr.length !== 0) {
        selectedNode = lastSelectNodeArr[0];
      } else {
        selectedNode = selectedEntities[0];
      }
    }
    return selectedNode;
  }

  function addEffect(selectedNodeRect: Rectangle, newSelectNodeRect: Rectangle) {
    const color = StageStyleManager.currentStyle.effects.successShadow;
    // 节点切换移动的特效有待专门写一个
    Stage.effectMachine.addEffects([
      new LineCuttingEffect(
        new ProgressNumber(0, 20),
        selectedNodeRect.leftTop,
        newSelectNodeRect.leftTop,
        color,
        color,
      ),
    ]);
    Stage.effectMachine.addEffects([
      new LineCuttingEffect(
        new ProgressNumber(0, 20),
        selectedNodeRect.rightTop,
        newSelectNodeRect.rightTop,
        color,
        color,
      ),
    ]);
    Stage.effectMachine.addEffects([
      new LineCuttingEffect(
        new ProgressNumber(0, 20),
        selectedNodeRect.rightBottom,
        newSelectNodeRect.rightBottom,
        color,
        color,
      ),
    ]);
    Stage.effectMachine.addEffects([
      new LineCuttingEffect(
        new ProgressNumber(0, 20),
        selectedNodeRect.leftBottom,
        newSelectNodeRect.leftBottom,
        color,
        color,
      ),
    ]);
  }

  function getMostNearConnectableEntity(nodes: ConnectableEntity[], location: Vector): ConnectableEntity | null {
    if (nodes.length === 0) return null;
    let currentMinDistance = Infinity;
    let currentNearestNode: ConnectableEntity | null = null;
    for (const node of nodes) {
      const entityCenter = node.collisionBox.getRectangle().center;
      const intersectLocation = node.collisionBox
        .getRectangle()
        .getLineIntersectionPoint(new Line(location, entityCenter));
      const distance = intersectLocation.distance(location);
      if (distance < currentMinDistance) {
        currentMinDistance = distance;
        currentNearestNode = node;
      }
    }
    return currentNearestNode;
  }

  /**
   * 获取距离某个点最近的节点
   * 距离的计算是实体的外接矩形的中心与点的连线的交点
   * 然后这个交点到目标的距离
   * @param location
   */
  function selectMostNearLocationNode(location: Vector): ConnectableEntity | null {
    let currentMinDistance = Infinity;
    let currentNearestNode: ConnectableEntity | null = null;
    for (const node of StageManager.getConnectableEntity()) {
      const entityCenter = node.collisionBox.getRectangle().center;
      const intersectLocation = node.collisionBox
        .getRectangle()
        .getLineIntersectionPoint(new Line(location, entityCenter));
      const distance = intersectLocation.distance(location);
      if (distance < currentMinDistance) {
        currentMinDistance = distance;
        currentNearestNode = node;
      }
    }
    return currentNearestNode;
  }

  /**
   * 选中一个节点上方45度范围内的所有节点
   * 无视连线关系，只看位置
   * @param node 当前所在的节点
   */
  export function collectTopNodes(node: ConnectableEntity): ConnectableEntity[] {
    const topNodes: ConnectableEntity[] = [];
    for (const otherNode of StageManager.getConnectableEntity()) {
      if (otherNode.uuid === node.uuid) continue;
      const otherNodeRect = otherNode.collisionBox.getRectangle();
      const nodeRect = node.collisionBox.getRectangle();
      if (otherNodeRect.center.y < nodeRect.center.y) {
        // 先保证是在上方，然后计算相对的角度
        const direction = otherNodeRect.center.subtract(nodeRect.center).normalize();
        const angle = direction.angleTo(new Vector(0, -1));
        if (angle < 45) {
          topNodes.push(otherNode);
        }
      }
    }
    return topNodes;
  }

  export function collectBottomNodes(node: ConnectableEntity): ConnectableEntity[] {
    const bottomNodes: ConnectableEntity[] = [];
    for (const otherNode of StageManager.getConnectableEntity()) {
      if (otherNode.uuid === node.uuid) continue;
      const otherNodeRect = otherNode.collisionBox.getRectangle();
      const nodeRect = node.collisionBox.getRectangle();
      if (otherNodeRect.center.y > nodeRect.center.y) {
        // 先保证是在下方，然后计算相对的角度
        const direction = otherNodeRect.center.subtract(nodeRect.center).normalize();
        const angle = direction.angleTo(new Vector(0, 1));
        if (angle < 45) {
          bottomNodes.push(otherNode);
        }
      }
    }
    return bottomNodes;
  }

  export function collectLeftNodes(node: ConnectableEntity): ConnectableEntity[] {
    const leftNodes: ConnectableEntity[] = [];
    for (const otherNode of StageManager.getConnectableEntity()) {
      if (otherNode.uuid === node.uuid) continue;
      const otherNodeRect = otherNode.collisionBox.getRectangle();
      const nodeRect = node.collisionBox.getRectangle();
      if (otherNodeRect.center.x < nodeRect.center.x) {
        // 先保证是在左边，然后计算相对的角度
        const direction = otherNodeRect.center.subtract(nodeRect.center).normalize();
        const angle = direction.angleTo(new Vector(-1, 0));
        if (angle < 45) {
          leftNodes.push(otherNode);
        }
      }
    }
    return leftNodes;
  }

  export function collectRightNodes(node: ConnectableEntity): ConnectableEntity[] {
    const rightNodes: ConnectableEntity[] = [];
    for (const otherNode of StageManager.getConnectableEntity()) {
      if (otherNode.uuid === node.uuid) continue;
      const otherNodeRect = otherNode.collisionBox.getRectangle();
      const nodeRect = node.collisionBox.getRectangle();
      if (otherNodeRect.center.x > nodeRect.center.x) {
        // 先保证是在右边，然后计算相对的角度
        const direction = otherNodeRect.center.subtract(nodeRect.center).normalize();
        const angle = direction.angleTo(new Vector(1, 0));
        if (angle < 45) {
          rightNodes.push(otherNode);
        }
      }
    }
    return rightNodes;
  }
}
