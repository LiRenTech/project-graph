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

  /**
   * 通过一个节点获取一个 可达节点集合/后继节点集合 Successor Set
   * @param node
   */
  export function getSuccessorSet(node: ConnectableEntity): ConnectableEntity[] {
    const result: ConnectableEntity[] = []; // 存储可达节点的结果集
    const visited: Set<string> = new Set(); // 用于记录已经访问过的节点，避免重复访问

    // 深度优先搜索 (DFS) 实现
    const dfs = (currentNode: ConnectableEntity): void => {
      if (visited.has(currentNode.uuid)) {
        return; // 如果节点已经被访问过，直接返回
      }
      visited.add(currentNode.uuid); // 标记当前节点为已访问
      result.push(currentNode); // 将当前节点加入结果集

      // 遍历当前节点的所有子节点
      const children = nodeChildrenArray(currentNode);
      for (const child of children) {
        dfs(child); // 对每个子节点递归调用 DFS
      }
    };

    // 从给定节点开始进行深度优先搜索
    dfs(node);

    return result; // 返回所有可达节点的集合
  }
}
