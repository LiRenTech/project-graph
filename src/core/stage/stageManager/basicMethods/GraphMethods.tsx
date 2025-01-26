import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { StageManager } from "../StageManager";

export namespace GraphMethods {
  export function isTree(node: ConnectableEntity): boolean {
    const dfs = (
      node: ConnectableEntity,
      visited: ConnectableEntity[],
    ): boolean => {
      if (visited.includes(node)) {
        return false;
      }
      visited.push(node);
      for (const child of StageManager.nodeChildrenArray(node)) {
        if (!dfs(child, visited)) {
          return false;
        }
      }
      return true;
    };

    return dfs(node, []);
  }
}
