import { Line } from "../../../dataStruct/shape/Line";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";

/**
 * 仅在keyboardOnlyEngine中使用，用于处理select change事件
 */
export namespace SelectChangeEngine {
  const includesKey = ["arrowup", "arrowdown", "arrowleft", "arrowright"];

  export function listenKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!includesKey.includes(key)) {
      return;
    }
    // 单选中节点
    // 开始移动框选框
    // （总是有反直觉的地方）
    const selectedNode = StageManager.getConnectableEntity().find((node) => node.isSelected);
    if (!selectedNode) {
      // 如果没有，则选中距离屏幕中心最近的节点
      const nearestNode = selectMostNearLocationNode(Camera.location);
      if (nearestNode) {
        nearestNode.isSelected = true;
      }
      return;
    }

    if (key === "arrowup") {
      // 在节点上方查找所有节点，并选中距离上方最近的一个
      const newSelectedNode = getMostBottomNode(
        getRelatedNodes(selectedNode).filter(
          (node: ConnectableEntity) =>
            node.collisionBox.getRectangle().center.y < selectedNode.collisionBox.getRectangle().center.y,
        ),
      );

      if (newSelectedNode) {
        selectedNode.isSelected = false;
        newSelectedNode.isSelected = true;
      }
    } else if (key === "arrowdown") {
      // 在节点下方查找所有节点，并选中距离下方最近的一个
      const newSelectedNode = getMostTopNode(
        getRelatedNodes(selectedNode).filter(
          (node: ConnectableEntity) =>
            node.collisionBox.getRectangle().center.y > selectedNode.collisionBox.getRectangle().center.y,
        ),
      );

      if (newSelectedNode) {
        selectedNode.isSelected = false;
        newSelectedNode.isSelected = true;
      }
    } else if (key === "arrowleft") {
      // 在节点左侧查找所有节点，并选中距离左侧最近的一个
      const newSelectedNode = getMostRightNode(
        getRelatedNodes(selectedNode).filter(
          (node: ConnectableEntity) =>
            node.collisionBox.getRectangle().center.x < selectedNode.collisionBox.getRectangle().center.x,
        ),
      );

      if (newSelectedNode) {
        selectedNode.isSelected = false;
        newSelectedNode.isSelected = true;
      }
    } else if (key === "arrowright") {
      // 在节点右侧查找所有节点，并选中距离右侧最近的一个
      const newSelectedNode = getMostLeftNode(
        getRelatedNodes(selectedNode).filter(
          (node: ConnectableEntity) =>
            node.collisionBox.getRectangle().center.x > selectedNode.collisionBox.getRectangle().center.x,
        ),
      );

      if (newSelectedNode) {
        selectedNode.isSelected = false;
        newSelectedNode.isSelected = true;
      }
    }
  }

  /**
   * 根据一个节点，获取其连线相关的所有节点
   * 包括所有第一层孩子节点和第一层父亲节点
   */
  function getRelatedNodes(node: ConnectableEntity): ConnectableEntity[] {
    const relatedNodes: ConnectableEntity[] = [];
    // 获取所有孩子节点
    for (const edge of StageManager.getLineEdges()) {
      if (edge.source.uuid === node.uuid) {
        const childNode = StageManager.getConnectableEntityByUUID(edge.target.uuid);
        if (childNode) relatedNodes.push(childNode);
      }
    }

    // 获取所有连向它的
    for (const edge of StageManager.getLineEdges()) {
      if (edge.target.uuid === node.uuid) {
        const fatherNode = StageManager.getConnectableEntityByUUID(edge.source.uuid);
        if (fatherNode) relatedNodes.push(fatherNode);
      }
    }
    return relatedNodes;
  }

  /**
   * 获取一堆节点中，最左边的节点
   * @param nodes
   */
  function getMostLeftNode(nodes: ConnectableEntity[]): ConnectableEntity | null {
    if (nodes.length === 0) return null;
    let mostLeftNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].collisionBox.getRectangle().center.x < mostLeftNode.collisionBox.getRectangle().center.x) {
        mostLeftNode = nodes[i];
      }
    }
    return mostLeftNode;
  }

  /**
   * 获取一堆节点中，最右边的节点
   * @param nodes
   */
  function getMostRightNode(nodes: ConnectableEntity[]): ConnectableEntity | null {
    if (nodes.length === 0) return null;
    let mostRightNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].collisionBox.getRectangle().center.x > mostRightNode.collisionBox.getRectangle().center.x) {
        mostRightNode = nodes[i];
      }
    }
    return mostRightNode;
  }

  /**
   * 获取一堆节点中，最上边的节点
   * @param nodes
   */
  function getMostTopNode(nodes: ConnectableEntity[]): ConnectableEntity | null {
    if (nodes.length === 0) return null;
    let mostTopNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].collisionBox.getRectangle().center.y < mostTopNode.collisionBox.getRectangle().center.y) {
        mostTopNode = nodes[i];
      }
    }
    return mostTopNode;
  }

  /**
   * 获取一堆节点中，最下边的节点
   * @param nodes
   */
  function getMostBottomNode(nodes: ConnectableEntity[]): ConnectableEntity | null {
    if (nodes.length === 0) return null;
    let mostBottomNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].collisionBox.getRectangle().center.y > mostBottomNode.collisionBox.getRectangle().center.y) {
        mostBottomNode = nodes[i];
      }
    }
    return mostBottomNode;
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
}
