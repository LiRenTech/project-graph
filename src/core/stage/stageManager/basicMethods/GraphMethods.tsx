import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { StageManager } from "../StageManager";

export namespace GraphMethods {
  export function isTree(node: ConnectableEntity): boolean {
    const dfs = (node: ConnectableEntity, visited: ConnectableEntity[]): boolean => {
      if (visited.includes(node)) {
        return false;
      }
      visited.push(node);
      for (const child of nodeChildrenArray(node)) {
        if (!dfs(child, visited)) {
          return false;
        }
      }
      return true;
    };

    return dfs(node, []);
  }

  /** 获取节点连接的子节点数组，未排除自环 */
  export function nodeChildrenArray(node: ConnectableEntity): ConnectableEntity[] {
    const res: ConnectableEntity[] = [];
    for (const edge of StageManager.getLineEdges()) {
      if (edge.source.uuid === node.uuid) {
        res.push(edge.target);
      }
    }
    return res;
  }

  /**
   * 获取一个节点的所有父亲节点，未排除自环
   * 性能有待优化！！
   */
  export function nodeParentArray(node: ConnectableEntity): ConnectableEntity[] {
    const res: ConnectableEntity[] = [];
    for (const edge of StageManager.getLineEdges()) {
      if (edge.target.uuid === node.uuid) {
        res.push(edge.source);
      }
    }
    return res;
  }

  export function isConnected(node: ConnectableEntity, target: ConnectableEntity): boolean {
    for (const edge of StageManager.getLineEdges()) {
      if (edge.source === node && edge.target === target) {
        return true;
      }
    }
    return false;
  }
}
