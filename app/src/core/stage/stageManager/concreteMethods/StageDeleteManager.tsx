import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { NodeLogic } from "../../../service/dataGenerateService/autoComputeEngine/functions/nodeLogic";
import { ExplodeDashEffect } from "../../../service/feedbackService/effectEngine/concrete/ExplodeDashEffect";
import { Stage } from "../../Stage";
import { Association } from "../../stageObject/abstract/Association";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { Edge } from "../../stageObject/association/Edge";
import { MultiTargetUndirectedEdge } from "../../stageObject/association/MutiTargetUndirectedEdge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stageObject/entity/ImageNode";
import { PenStroke } from "../../stageObject/entity/PenStroke";
import { PortalNode } from "../../stageObject/entity/PortalNode";
import { Section } from "../../stageObject/entity/Section";
import { SvgNode } from "../../stageObject/entity/SvgNode";
import { TextNode } from "../../stageObject/entity/TextNode";
import { UrlNode } from "../../stageObject/entity/UrlNode";
import { SectionMethods } from "../basicMethods/SectionMethods";
import { StageSectionInOutManager } from "./StageSectionInOutManager";

/**
 * 包含一切删除舞台上的元素的方法
 */
export namespace StageDeleteManager {
  type DeleteHandler<T extends Entity> = (entity: T) => void;
  type Constructor<T> = { new (...args: any[]): T };
  const _deleteHandlers = new Map<Constructor<Entity>, DeleteHandler<Entity>>();
  // 类型注册器，保证一个类型对应一个函数，绝对类型安全，同时可扩展
  function registerHandler<T extends Entity>(constructor: Constructor<T>, handler: DeleteHandler<T>) {
    _deleteHandlers.set(constructor, handler as DeleteHandler<Entity>);
  }

  registerHandler(TextNode, deleteTextNode);
  registerHandler(Section, deleteSection);
  registerHandler(ConnectPoint, deleteConnectPoint);
  registerHandler(ImageNode, deleteImageNode);
  registerHandler(UrlNode, deleteUrlNode);
  registerHandler(PortalNode, deletePortalNode);
  registerHandler(PenStroke, deletePenStroke);
  registerHandler(SvgNode, deleteSvgNode);

  export function deleteEntities(deleteNodes: Entity[]) {
    for (const entity of deleteNodes) {
      const handler = findDeleteHandler(entity);
      handler?.(entity);
    }
  }

  function findDeleteHandler(entity: Entity) {
    for (const [ctor, handler] of _deleteHandlers) {
      if (entity instanceof ctor) return handler;
    }
    console.warn(`No delete handler for ${entity.constructor.name}`);
  }

  function deleteSvgNode(entity: SvgNode) {
    if (this.project.stageManager.getEntities().includes(entity)) {
      this.project.stageManager.deleteOneEntity(entity);
      // 删除所有相关的边
      deleteEntityAfterClearAssociation(entity);
    }
  }

  function deletePortalNode(entity: PortalNode) {
    if (this.project.stageManager.getPortalNodes().includes(entity)) {
      this.project.stageManager.deleteOnePortalNode(entity);
      // 删除所有相关的边
      deleteEntityAfterClearAssociation(entity);
    }
  }

  function deletePenStroke(penStroke: PenStroke) {
    if (this.project.stageManager.getPenStrokes().includes(penStroke)) {
      this.project.stageManager.deleteOnePenStroke(penStroke);
    }
  }

  function deleteSection(entity: Section) {
    if (!this.project.stageManager.getSections().includes(entity)) {
      console.warn("section not in sections!!!", entity.uuid);
      return;
    }

    // 先删除所有内部的东西
    if (entity.isCollapsed) {
      deleteEntities(entity.children);
    }

    // 再删除自己
    this.project.stageManager.deleteOneSection(entity);
    deleteEntityAfterClearAssociation(entity);
    // 将自己所有的父级Section的children添加自己的children
    const fatherSections = SectionMethods.getFatherSections(entity);
    StageSectionInOutManager.goInSections(entity.children, fatherSections);
  }
  function deleteImageNode(entity: ImageNode) {
    if (this.project.stageManager.getImageNodes().includes(entity)) {
      this.project.stageManager.deleteOneImage(entity);
      Stage.effectMachine.addEffect(
        new ExplodeDashEffect(new ProgressNumber(0, 30), entity.collisionBox.getRectangle(), Color.White),
      );
      // 删除所有相关的边
      deleteEntityAfterClearAssociation(entity);
    }
  }
  function deleteUrlNode(entity: UrlNode) {
    if (this.project.stageManager.getUrlNodes().includes(entity)) {
      this.project.stageManager.deleteOneUrlNode(entity);
      // 删除所有相关的边
      deleteEntityAfterClearAssociation(entity);
    }
  }

  function deleteConnectPoint(entity: ConnectPoint) {
    // 先判断这个node是否在nodes里
    if (this.project.stageManager.getConnectPoints().includes(entity)) {
      // 从数组中去除
      this.project.stageManager.deleteOneConnectPoint(entity);
      Stage.effectMachine.addEffect(
        new ExplodeDashEffect(new ProgressNumber(0, 30), entity.collisionBox.getRectangle(), Color.White),
      );
      // 删除所有相关的边
      deleteEntityAfterClearAssociation(entity);
    } else {
      console.warn("connect point not in connect points", entity.uuid);
    }
  }

  function deleteTextNode(entity: TextNode) {
    // 先判断这个node是否在nodes里
    if (this.project.stageManager.getTextNodes().includes(entity)) {
      // 删除逻辑节点存储的状态
      if (NodeLogic.delayStates.has(entity.uuid)) NodeLogic.delayStates.delete(entity.uuid);
      // 从数组中去除
      this.project.stageManager.deleteOneTextNode(entity);
      // 增加特效
      Stage.effectMachine.addEffect(
        new ExplodeDashEffect(
          new ProgressNumber(0, 30),
          entity.collisionBox.getRectangle(),
          entity.color.a === 0 ? Color.White : entity.color.clone(),
        ),
      );
    } else {
      console.warn("node not in nodes", entity.uuid);
    }
    // 删除所有相关的边
    deleteEntityAfterClearAssociation(entity);
  }

  /**
   * 删除所有相关的边
   * @param entity
   */
  function deleteEntityAfterClearAssociation(entity: Entity) {
    const prepareDeleteAssociation: Association[] = [];
    const visitedAssociations: Set<string> = new Set();

    for (const edge of this.project.stageManager.getAssociations()) {
      if (edge instanceof Edge) {
        if ((edge.source === entity || edge.target === entity) && visitedAssociations.has(edge.uuid) === false) {
          prepareDeleteAssociation.push(edge);
          visitedAssociations.add(edge.uuid);
        }
      } else if (edge instanceof MultiTargetUndirectedEdge) {
        if (edge.targetUUIDs.includes(entity.uuid) && visitedAssociations.has(edge.uuid) === false) {
          prepareDeleteAssociation.push(edge);
          visitedAssociations.add(edge.uuid);
        }
      }
    }
    for (const edge of prepareDeleteAssociation) {
      this.project.stageManager.deleteOneAssociation(edge);
    }
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
      this.project.stageManager.isEntityExists(fromNode.uuid) &&
      this.project.stageManager.isEntityExists(toNode.uuid)
    ) {
      // 删除边
      this.project.stageManager.deleteOneAssociation(deleteEdge);
      this.project.stageManager.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  export function deleteMultiTargetUndirectedEdge(edge: MultiTargetUndirectedEdge) {
    this.project.stageManager.deleteOneAssociation(edge);
    this.project.stageManager.updateReferences();
    return true;
  }
}
