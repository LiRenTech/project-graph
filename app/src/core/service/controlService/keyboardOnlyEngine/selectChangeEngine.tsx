import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Line } from "../../../dataStruct/shape/Line";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { StageObjectSelectCounter } from "../../../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { LineCuttingEffect } from "../../feedbackService/effectEngine/concrete/LineCuttingEffect";
import { StageStyleManager } from "../../feedbackService/stageStyle/StageStyleManager";

/**
 * 仅在keyboardOnlyEngine中使用，用于处理select change事件
 */
export namespace SelectChangeEngine {
  const includesKey = ["arrowup", "arrowdown", "arrowleft", "arrowright"];

  let lastSelectNodeByKeyboardUUID = "";

  export function listenKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (event.ctrlKey || event.metaKey || event.altKey) {
      // 忽略组合键，防止和别的功能键冲突
      return;
    }
    if (!includesKey.includes(key)) {
      return;
    }
    // 单选中节点
    // 开始移动框选框
    // （总是有反直觉的地方）
    const selectedEntities = StageManager.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);

    let selectedNode: ConnectableEntity | null = null;
    if (selectedEntities.length === 0) {
      // 如果没有，则选中距离屏幕中心最近的节点
      const nearestNode = selectMostNearLocationNode(Camera.location);
      if (nearestNode) {
        nearestNode.isSelected = true;
      }
      return;
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

    let newSelectedConnectableEntity: ConnectableEntity | null = null;
    const selectedNodeRect = selectedNode.collisionBox.getRectangle();
    if (key === "arrowup") {
      // 在节点上方查找所有节点，并选中距离上方最近的一个
      newSelectedConnectableEntity = getMostNearConnectableEntity(
        collectTopNodes(selectedNode),
        selectedNodeRect.center,
      );
    } else if (key === "arrowdown") {
      // 在节点下方查找所有节点，并选中距离下方最近的一个
      newSelectedConnectableEntity = getMostNearConnectableEntity(
        collectBottomNodes(selectedNode),
        selectedNodeRect.center,
      );
    } else if (key === "arrowleft") {
      // 在节点左侧查找所有节点，并选中距离左侧最近的一个
      newSelectedConnectableEntity = getMostNearConnectableEntity(
        collectLeftNodes(selectedNode),
        selectedNodeRect.center,
      );
    } else if (key === "arrowright") {
      // 在节点右侧查找所有节点，并选中距离右侧最近的一个
      newSelectedConnectableEntity = getMostNearConnectableEntity(
        collectRightNodes(selectedNode),
        selectedNodeRect.center,
      );
    }
    if (newSelectedConnectableEntity) {
      // 按住shift+方向键，可以多选
      if (!event.shiftKey) {
        selectedNode.isSelected = false;
      }
      newSelectedConnectableEntity.isSelected = true;
      lastSelectNodeByKeyboardUUID = newSelectedConnectableEntity.uuid;
      const newSelectNodeRect = newSelectedConnectableEntity.collisionBox.getRectangle();
      const color = StageStyleManager.currentStyle.effects.successShadow;

      if (Camera.cameraFollowsSelectedNodeOnArrowKeys) {
        Camera.location = newSelectNodeRect.center;
      }

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

      // 更新选中内容的数量
      StageObjectSelectCounter.update();
    }
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
