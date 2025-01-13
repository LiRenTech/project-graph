import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { ExplodeAshEffect } from "../../../effect/concrete/ExplodeDashEffect";
import { LineEdge } from "../../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../../stageObject/entity/ConnectPoint";
import { ImageNode } from "../../../stageObject/entity/ImageNode";
import { Section } from "../../../stageObject/entity/Section";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { UrlNode } from "../../../stageObject/entity/UrlNode";
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
      } else if (entity instanceof ConnectPoint) {
        deleteConnectPoint(entity);
      } else if (entity instanceof ImageNode) {
        deleteImageNode(entity);
      } else if (entity instanceof UrlNode) {
        deleteUrlNode(entity);
      }
    }
    // StageManager.updateReferences();
  }

  function deleteSection(entity: Section) {
    if (!StageManager.getSections().includes(entity)) {
      console.warn("section not in sections!!!", entity.uuid);
      return;
    }

    // 先删除所有内部的东西
    if (entity.isCollapsed) {
      deleteEntities(entity.children);
    }

    // 再删除自己
    StageManager.deleteOneSection(entity);
    deleteEntityAfterClearEdges(entity);
    // 将自己所有的父级Section的children添加自己的children
    const fatherSections =
      StageManager.SectionOptions.getFatherSections(entity);
    for (const fatherSection of fatherSections) {
      StageManager.goInSection(entity.children, fatherSection);
    }
  }
  function deleteImageNode(entity: ImageNode) {
    if (StageManager.getImageNodes().includes(entity)) {
      StageManager.deleteOneImage(entity);
      Stage.effects.push(
        new ExplodeAshEffect(
          new ProgressNumber(0, 30),
          entity.collisionBox.getRectangle(),
          Color.White,
        ),
      );
      // 删除所有相关的边
      deleteEntityAfterClearEdges(entity);
    }
  }
  function deleteUrlNode(entity: UrlNode) {
    if (StageManager.getUrlNodes().includes(entity)) {
      StageManager.deleteOneUrlNode(entity);
      // 删除所有相关的边
      deleteEntityAfterClearEdges(entity);
    }
  }

  function deleteConnectPoint(entity: ConnectPoint) {
    // 先判断这个node是否在nodes里
    if (StageManager.getConnectPoints().includes(entity)) {
      // 从数组中去除
      StageManager.deleteOneConnectPoint(entity);
      Stage.effects.push(
        new ExplodeAshEffect(
          new ProgressNumber(0, 30),
          entity.collisionBox.getRectangle(),
          Color.White,
        ),
      );
      // 删除所有相关的边
      deleteEntityAfterClearEdges(entity);
    } else {
      console.warn("connect point not in connect points", entity.uuid);
    }
  }

  function deleteTextNode(entity: TextNode) {
    // 先判断这个node是否在nodes里
    if (StageManager.getTextNodes().includes(entity)) {
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
    deleteEntityAfterClearEdges(entity);
  }

  /**
   * 删除所有相关的边
   * @param entity
   */
  function deleteEntityAfterClearEdges(entity: Entity) {
    const prepareDeleteEdges: LineEdge[] = [];
    for (const edge of StageManager.getLineEdges()) {
      if (edge.source === entity || edge.target === entity) {
        prepareDeleteEdges.push(edge);
      }
    }
    for (const edge of prepareDeleteEdges) {
      StageManager.deleteOneEdge(edge);
    }
  }

  /**
   * 注意不要在遍历edges数组中调用这个方法，否则会导致数组长度变化，导致索引错误
   * @param deleteEdge 要删除的边
   * @returns
   */
  export function deleteEdge(deleteEdge: LineEdge): boolean {
    const fromNode = deleteEdge.source;
    const toNode = deleteEdge.target;
    // 先判断这两个节点是否在nodes里
    if (
      StageManager.isEntityExists(fromNode.uuid) &&
      StageManager.isEntityExists(toNode.uuid)
    ) {
      // 删除边
      StageManager.deleteOneEdge(deleteEdge);
      StageManager.updateReferences();
      return true;
    } else {
      return false;
    }
  }
}
