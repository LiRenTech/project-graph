import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";

/**
 * 仅在keyboardOnlyEngine中使用，用于处理select change事件
 */
export namespace SelectChangeEngine {
  export function listenKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      return;
    }
    // 单选中节点
    // 开始移动框选框
    // （总是有反直觉的地方）
    const selectedNode = StageManager.getTextNodes().find((node) => node.isSelected);
    if (!selectedNode) return;

    if (key === "arrowup") {
      // 在节点上方查找所有节点，并选中距离上方最近的一个
      const newSelectedNode = getMostBottomNode(
        getRelatedNodes(selectedNode).filter(
          (node: TextNode) => node.rectangle.center.y < selectedNode.rectangle.center.y,
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
          (node: TextNode) => node.rectangle.center.y > selectedNode.rectangle.center.y,
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
          (node: TextNode) => node.rectangle.center.x < selectedNode.rectangle.center.x,
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
          (node: TextNode) => node.rectangle.center.x > selectedNode.rectangle.center.x,
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
  function getRelatedNodes(node: TextNode): TextNode[] {
    const relatedNodes: TextNode[] = [];
    // 获取所有孩子节点
    for (const edge of StageManager.getLineEdges()) {
      if (edge.source.uuid === node.uuid) {
        const childNode = StageManager.getTextNodeByUUID(edge.target.uuid);
        if (childNode) relatedNodes.push(childNode);
      }
    }

    // 获取所有连向它的
    for (const edge of StageManager.getLineEdges()) {
      if (edge.target.uuid === node.uuid) {
        const fatherNode = StageManager.getTextNodeByUUID(edge.source.uuid);
        if (fatherNode) relatedNodes.push(fatherNode);
      }
    }
    return relatedNodes;
  }

  /**
   * 获取一堆节点中，最左边的节点
   * @param nodes
   */
  function getMostLeftNode(nodes: TextNode[]): TextNode | null {
    if (nodes.length === 0) return null;
    let mostLeftNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].rectangle.center.x < mostLeftNode.rectangle.center.x) {
        mostLeftNode = nodes[i];
      }
    }
    return mostLeftNode;
  }

  /**
   * 获取一堆节点中，最右边的节点
   * @param nodes
   */
  function getMostRightNode(nodes: TextNode[]): TextNode | null {
    if (nodes.length === 0) return null;
    let mostRightNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].rectangle.center.x > mostRightNode.rectangle.center.x) {
        mostRightNode = nodes[i];
      }
    }
    return mostRightNode;
  }

  /**
   * 获取一堆节点中，最上边的节点
   * @param nodes
   */
  function getMostTopNode(nodes: TextNode[]): TextNode | null {
    if (nodes.length === 0) return null;
    let mostTopNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].rectangle.center.y < mostTopNode.rectangle.center.y) {
        mostTopNode = nodes[i];
      }
    }
    return mostTopNode;
  }

  /**
   * 获取一堆节点中，最下边的节点
   * @param nodes
   */
  function getMostBottomNode(nodes: TextNode[]): TextNode | null {
    if (nodes.length === 0) return null;
    let mostBottomNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].rectangle.center.y > mostBottomNode.rectangle.center.y) {
        mostBottomNode = nodes[i];
      }
    }
    return mostBottomNode;
  }
}
