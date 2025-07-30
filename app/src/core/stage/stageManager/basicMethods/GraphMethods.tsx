import { Project, service } from "@/core/Project";
import { ConnectableEntity } from "@/core/stage/stageObject/abstract/ConnectableEntity";
import { Edge } from "@/core/stage/stageObject/association/Edge";

@service("graphMethods")
export class GraphMethods {
  constructor(protected readonly project: Project) {}

  isTree(node: ConnectableEntity): boolean {
    const dfs = (node: ConnectableEntity, visited: ConnectableEntity[]): boolean => {
      if (visited.includes(node)) {
        return false;
      }
      visited.push(node);
      for (const child of this.nodeChildrenArray(node)) {
        if (!dfs(child, visited)) {
          return false;
        }
      }
      return true;
    };

    return dfs(node, []);
  }

  /** 获取节点连接的子节点数组，未排除自环 */
  nodeChildrenArray(node: ConnectableEntity): ConnectableEntity[] {
    const res: ConnectableEntity[] = [];
    for (const edge of this.project.stageManager.getLineEdges()) {
      if (edge.source.uuid === node.uuid) {
        res.push(edge.target);
      }
    }
    return res;
  }

  /**
   * 获取一个节点的所有父亲节点，排除自环
   * 性能有待优化！！
   */
  nodeParentArray(node: ConnectableEntity): ConnectableEntity[] {
    const res: ConnectableEntity[] = [];
    for (const edge of this.project.stageManager.getLineEdges()) {
      if (edge.target.uuid === node.uuid && edge.target.uuid !== edge.source.uuid) {
        res.push(edge.source);
      }
    }
    return res;
  }

  /**
   * 获取反向边集
   * @param edges
   */
  private getReversedEdgeDict(): Record<string, string> {
    const res: Record<string, string> = {};
    for (const edge of this.project.stageManager.getLineEdges()) {
      res[edge.target.uuid] = edge.source.uuid;
    }
    return res;
  }

  /**
   * 获取自己的祖宗节点
   * @param node 节点
   */
  getRoots(node: ConnectableEntity): ConnectableEntity[] {
    const reverseEdges = this.getReversedEdgeDict();
    let rootUUID = node.uuid;
    const visited: Set<string> = new Set(); // 用于记录已经访问过的节点，避免重复访问
    while (reverseEdges[rootUUID] && !visited.has(rootUUID)) {
      visited.add(rootUUID);
      const parentUUID = reverseEdges[rootUUID];
      const parent = this.project.stageManager.getConnectableEntityByUUID(parentUUID);
      if (parent) {
        rootUUID = parentUUID;
      } else {
        break;
      }
    }
    const root = this.project.stageManager.getConnectableEntityByUUID(rootUUID);
    if (root) {
      return [root];
    } else {
      return [];
    }
  }

  isConnected(node: ConnectableEntity, target: ConnectableEntity): boolean {
    for (const edge of this.project.stageManager.getLineEdges()) {
      if (edge.source === node && edge.target === target) {
        return true;
      }
    }
    return false;
  }

  /**
   * 通过一个节点获取一个 可达节点集合/后继节点集合 Successor Set
   * 包括它自己
   * @param node
   */
  getSuccessorSet(node: ConnectableEntity, isHaveSelf: boolean = true): ConnectableEntity[] {
    let result: ConnectableEntity[] = []; // 存储可达节点的结果集
    const visited: Set<string> = new Set(); // 用于记录已经访问过的节点，避免重复访问

    // 深度优先搜索 (DFS) 实现
    const dfs = (currentNode: ConnectableEntity): void => {
      if (visited.has(currentNode.uuid)) {
        return; // 如果节点已经被访问过，直接返回
      }
      visited.add(currentNode.uuid); // 标记当前节点为已访问
      result.push(currentNode); // 将当前节点加入结果集

      // 遍历当前节点的所有子节点
      const children = this.nodeChildrenArray(currentNode);
      for (const child of children) {
        dfs(child); // 对每个子节点递归调用 DFS
      }
    };

    // 从给定节点开始进行深度优先搜索
    dfs(node);
    if (!isHaveSelf) {
      result = result.filter((n) => n === node);
    }

    return result; // 返回所有可达节点的集合
  }

  /**
   * 获取一个节点的一步可达节点集合/后继节点集合 One-Step Successor Set
   * 排除自环
   * @param node
   */
  getOneStepSuccessorSet(node: ConnectableEntity): ConnectableEntity[] {
    const result: ConnectableEntity[] = []; // 存储可达节点的结果集
    for (const edge of this.project.stageManager.getLineEdges()) {
      if (edge.source === node && edge.target.uuid !== edge.source.uuid) {
        result.push(edge.target);
      }
    }
    return result;
  }

  getEdgesBetween(node1: ConnectableEntity, node2: ConnectableEntity): Edge[] {
    const result: Edge[] = []; // 存储连接两个节点的边的结果集
    for (const edge of this.project.stageManager.getEdges()) {
      if (edge.source === node1 && edge.target === node2) {
        result.push(edge);
      }
    }
    return result;
  }

  getEdgeFromTwoEntity(fromNode: ConnectableEntity, toNode: ConnectableEntity): Edge | null {
    for (const edge of this.project.stageManager.getEdges()) {
      if (edge.source === fromNode && edge.target === toNode) {
        return edge;
      }
    }
    return null;
  }
}
