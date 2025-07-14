import { Entity } from "../../../stageObject/abstract/StageEntity";
import { Section } from "../../../stageObject/entity/Section";
import { StageHistoryManager } from "../../StageHistoryManager";
import { StageManager } from "../../StageManager";

export namespace LayoutEntityManager {
  /**
   *
   * @param layoutFunction 排列方法
   * @param isDeep 是否递归
   */
  export function layoutBySelected(layoutFunction: (entities: Entity[]) => void, isDeep: boolean) {
    const entities = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    if (isDeep) {
      // 递归
      const dfs = (entityList: Entity[]) => {
        // 检查每一个实体
        for (const entity of entityList) {
          // console.log(entity);
          // 如果当前这个实体是 Section，就进入到Section内部
          if (entity instanceof Section) {
            const childEntity = entity.children;
            dfs(childEntity);
          }
        }
        layoutFunction(entityList);
      };
      dfs(entities);
    } else {
      layoutFunction(entities);
    }
    StageHistoryManager.recordStep();
  }
}
