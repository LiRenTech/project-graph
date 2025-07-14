import { Vector } from "../../../dataStruct/Vector";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { Section } from "../../stageObject/entity/Section";
import { StageManager } from "../StageManager";

export namespace SectionMethods {
  /**
   * 获取一个实体的第一层所有父亲Sections
   * 注：需要遍历所有Section
   * @param entity
   */
  export function getFatherSections(entity: Entity): Section[] {
    const result = [];
    for (const section of StageManager.getSections()) {
      if (section.children.includes(entity)) {
        result.push(section);
      }
    }
    return result;
  }

  /**
   * 获取一个实体被他包围的全部实体，一层一层的包含并以数组返回
   * A{B{C{entity}}}
   * 会返回 [C, B, A]
   * @param entity
   */
  export function getFatherSectionsList(entity: Entity): Section[] {
    const result = [];
    for (const section of StageManager.getSections()) {
      if (isEntityInSection_fake(entity, section)) {
        result.push(section);
      }
    }
    return getSortedSectionsByZ(result).reverse();
  }

  /**
   * 根据一个点，获取包含这个点的所有集合（深集合优先）
   * （小集合会覆盖大集合）
   * 也就是 SectionA ∈ SectionB，
   * 点击发生在 SectionA 中时，会返回 [SectionA]，不含有 SectionB
   * @returns
   */
  export function getSectionsByInnerLocation(location: Vector): Section[] {
    const sections: Section[] = [];
    for (const section of StageManager.getSections()) {
      if (section.isCollapsed || section.isHiddenBySectionCollapse) {
        continue;
      }
      if (section.collisionBox.getRectangle().isPointIn(location)) {
        sections.push(section);
      }
    }
    return deeperSections(sections);
  }

  /**
   * 用于去除重叠集合，当有完全包含的集合时，返回最小的集合
   * @param sections
   */
  function deeperSections(sections: Section[]): Section[] {
    const outerSections: Section[] = []; // 要被排除的Section

    for (const sectionI of sections) {
      for (const sectionJ of sections) {
        if (sectionI === sectionJ) {
          continue;
        }
        if (isEntityInSection(sectionI, sectionJ) && !isEntityInSection(sectionJ, sectionI)) {
          // I 在 J 中，J不在I中，J大，排除J
          outerSections.push(sectionJ);
        }
      }
    }
    const result: Section[] = [];
    for (const section of sections) {
      if (!outerSections.includes(section)) {
        result.push(section);
      }
    }
    return result;
  }

  /**
   * 通过多个Section，获取最外层的Section（即没有父亲的Section）
   * @param sections
   * @returns
   */
  export function shallowerSection(sections: Section[]): Section[] {
    const rootSections: Section[] = [];
    const sectionMap = new Map<string, Section>();
    // 首先将所有section放入map，方便快速查找
    for (const section of sections) {
      sectionMap.set(section.uuid, section);
    }
    // 遍历所有section，检查是否有父亲节点
    for (const section of sections) {
      for (const child of section.children) {
        sectionMap.delete(child.uuid);
      }
    }
    for (const section of sectionMap.keys()) {
      const result = sectionMap.get(section);
      if (result) {
        rootSections.push(result);
      }
    }

    return rootSections;
  }

  export function shallowerNotSectionEntities(entities: Entity[]): Entity[] {
    // shallowerSection + 所有非Section的实体
    const sections = entities.filter((entity) => entity instanceof Section);
    const nonSections = entities.filter((entity) => !(entity instanceof Section));
    // 遍历所有非section实体，如果是任何一个section的子节点，则删除
    const result: Entity[] = [];
    for (const entity of nonSections) {
      let isAnyChild = false;
      for (const section of sections) {
        if (isEntityInSection(entity, section)) {
          isAnyChild = true;
        }
      }
      if (!isAnyChild) {
        result.push(entity);
      }
    }
    result.push(...sections);
    return result;
  }

  /**
   * 检测某个实体是否在某个集合内，跨级也算
   * @param entity
   * @param section
   */
  export function isEntityInSection(entity: Entity, section: Section): boolean {
    return _isEntityInSection(entity, section, 0);
  }

  /**
   * 检测某个实体的几何区域是否在某个集合内，仅计算碰撞，不看引用，所以是个假的
   * 性能比较高
   * @param entity
   * @param section
   */
  function isEntityInSection_fake(entity: Entity, section: Section): boolean {
    const entityBox = entity.collisionBox.getRectangle();
    const sectionBox = section.collisionBox.getRectangle();
    return entityBox.isCollideWithRectangle(sectionBox);
  }

  function _isEntityInSection(entity: Entity, section: Section, deep = 0): boolean {
    if (deep > 996) {
      return false;
    }
    // 直接先检测一级
    if (section.children.includes(entity)) {
      return true;
    } else {
      // 涉及跨级检测
      for (const child of section.children) {
        if (child instanceof Section) {
          return _isEntityInSection(entity, child, deep + 1);
        }
      }
      return false;
    }
  }

  /**
   * 检测一个Section内部是否符合树形嵌套结构
   * @param rootNode
   */
  export function isTreePack(rootNode: Section) {
    const dfs = (node: Entity, visited: Entity[]): boolean => {
      if (visited.includes(node)) {
        return false;
      }
      visited.push(node);
      if (node instanceof Section) {
        for (const child of node.children) {
          if (!dfs(child, visited)) {
            return false;
          }
        }
      }
      return true;
    };
    return dfs(rootNode, []);
  }

  /**
   * 返回一个Section框的最大嵌套深度
   * @param section
   */
  export function getSectionMaxDeep(section: Section): number {
    const visited: Section[] = [];
    const dfs = (node: Section, deep = 1): number => {
      if (visited.includes(node)) {
        return deep;
      }
      visited.push(node);
      for (const child of node.children) {
        if (child instanceof Section) {
          deep = Math.max(deep, dfs(child, deep + 1));
        }
      }
      return deep;
    };
    return dfs(section);
  }

  /**
   * 用途：
   * 根据选中的多个Section，获取所有选中的实体（包括子实体）
   * 可以解决复制多个Section时，内部实体的连线问题
   * @param selectedEntities
   */
  export function getAllEntitiesInSelectedSectionsOrEntities(selectedEntities: Entity[]): Entity[] {
    const entityUUIDSet = new Set<string>();
    const dfs = (currentEntity: Entity) => {
      if (currentEntity.uuid in entityUUIDSet) {
        return;
      }
      if (currentEntity instanceof Section) {
        for (const child of currentEntity.children) {
          dfs(child);
        }
      }
      entityUUIDSet.add(currentEntity.uuid);
    };
    for (const entity of selectedEntities) {
      dfs(entity);
    }
    return StageManager.getEntitiesByUUIDs(Array.from(entityUUIDSet));
  }

  export function getSortedSectionsByZ(sections: Section[]): Section[] {
    // 先按y排序，从上到下，先不管z
    return sections.sort((a, b) => a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top);
  }
}
