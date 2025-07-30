import { Project, service } from "@/core/Project";
import { Entity } from "@/core/stage/stageObject/abstract/StageEntity";
import { Section } from "@/core/stage/stageObject/entity/Section";

/**
 * 管理所有东西进出StageSection的逻辑
 */
@service("sectionInOutManager")
export class SectionInOutManager {
  constructor(private readonly project: Project) {}

  // 可能存在bug
  goInSection(entities: Entity[], section: Section) {
    for (const entity of entities) {
      if (section.children.includes(entity)) {
        // 已经在section里面了，不用再次进入
        continue;
      }
      if (entity === section) {
        // 自己不能包自己
        continue;
      }
      section.childrenUUIDs.push(entity.uuid);
      section.children.push(entity);
    }
    this.project.stageManager.updateReferences();
  }

  /**
   * 一些实体跳入多个Section（交叉嵌套）
   * 会先解除所有实体与Section的关联，再重新关联
   * @param entities
   * @param sections
   */
  goInSections(entities: Entity[], sections: Section[]) {
    // 先解除所有实体与Section的关联
    for (const entity of entities) {
      this.entityDropParent(entity);
    }
    // 再重新关联
    for (const section of sections) {
      this.goInSection(entities, section);
    }
  }

  goOutSection(entities: Entity[], section: Section) {
    for (const entity of entities) {
      this.sectionDropChild(section, entity);
    }
    this.project.stageManager.updateReferences();
  }

  private entityDropParent(entity: Entity) {
    for (const section of this.project.stageManager.getSections()) {
      if (section.childrenUUIDs.includes(entity.uuid)) {
        this.sectionDropChild(section, entity);
      }
    }
  }

  /**
   * Section 丢弃某个孩子
   * @param section
   * @param entity
   */
  private sectionDropChild(section: Section, entity: Entity) {
    const newChildrenUUID: string[] = [];
    const newChildren: Entity[] = [];
    for (const child of section.children) {
      if (entity.uuid !== child.uuid) {
        newChildrenUUID.push(child.uuid);
        newChildren.push(child);
      }
    }
    section.childrenUUIDs = newChildrenUUID;
    section.children = newChildren;
  }
}
