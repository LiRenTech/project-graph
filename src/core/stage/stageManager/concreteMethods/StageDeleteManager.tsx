import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { ExplodeAshEffect } from "../../../effect/concrete/ExplodeDashEffect";
import { Edge } from "../../../stageObject/association/Edge";
import { Section } from "../../../stageObject/entity/Section";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { Entity } from "../../../stageObject/StageObject";
import { Stage } from "../../Stage";
import { StageManager } from "../StageManager";

/**
 * 包含一切删除舞台上的元素的方法
 */
export namespace StageDeleteManager {
  export function deleteEntities(deleteNodes: Entity[]) {
    for (const entity of deleteNodes) {
      if (entity instanceof TextNode) {
        deleteTextNode(entity);
      } else if (entity instanceof Section) {
        deleteSection(entity);
      }
    }
    StageManager.updateReferences();
  }

  function deleteSection(entity: Section) {
    if (!StageManager.getSections().includes(entity)) {
      console.warn("section not in sections!!!", entity.uuid);
      return;
    }

    // 先删除所有内部的东西
    // for (const child of entity.children) {
    //   if (child instanceof TextNode) {
    //     deleteTextNode(child);
    //   } else if (child instanceof Section) {
    //     deleteSection(child);
    //   }
    // }

    // 再删除自己
    StageManager.deleteOneSection(entity);
  }

  function deleteTextNode(entity: TextNode) {
    // 先判断这个node是否在nodes里
    if (StageManager.getTextNodes().includes(entity)) {
      console.log("include node", entity.uuid);
      // 从数组中去除
      StageManager.deleteOneTextNode(entity);
      // 增加特效
      Stage.effects.push(
        new ExplodeAshEffect(
          new ProgressNumber(0, 30),
          entity.collisionBox.getRectangle(),
          entity.color.a === 0 ? Color.White : entity.color.clone(),
        ),
      );
    } else {
      console.warn("node not in nodes", entity.uuid);
    }
    // 删除所有相关的边
    const prepareDeleteEdges: Edge[] = [];
    for (const edge of StageManager.getEdges()) {
      if (edge.source === entity || edge.target === entity) {
        prepareDeleteEdges.push(edge);
      }
    }
    for (const edge of prepareDeleteEdges) {
      StageManager.deleteOneEdge(edge);
    }
    console.log("delete node", entity.uuid);
  }

  /**
   * 注意不要在遍历edges数组中调用这个方法，否则会导致数组长度变化，导致索引错误
   * @param deleteEdge 要删除的边
   * @returns
   */
  export function deleteEdge(deleteEdge: Edge): boolean {
    const fromNode = deleteEdge.source;
    const toNode = deleteEdge.target;
    // 先判断这两个节点是否在nodes里
    if (
      StageManager.getTextNodes().includes(fromNode) &&
      StageManager.getTextNodes().includes(toNode)
    ) {
      // 删除边
      StageManager.deleteOneEdge(deleteEdge);
      StageManager.updateReferences();
      return true;
    } else {
      console.log("node not in nodes");
      return false;
    }
  }
}
