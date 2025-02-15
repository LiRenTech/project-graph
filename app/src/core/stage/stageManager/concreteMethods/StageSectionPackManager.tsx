// import { Section } from "../../../stageObject/entity/Section";
// import { Entity } from "../../../stageObject/StageEntity";
import { v4 } from "uuid";
import { Section } from "../../stageObject/entity/Section";
import { SectionMethods } from "../basicMethods/SectionMethods";
import { StageManager } from "../StageManager";
import { StageSectionInOutManager } from "./StageSectionInOutManager";
import { GraphMethods } from "../basicMethods/GraphMethods";
import { TextNode } from "../../stageObject/entity/TextNode";

/**
 * 管理所有东西进出StageSection的逻辑
 */
export namespace StageSectionPackManager {
  /** 折叠起来 */
  export function packSection(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      modifyHiddenDfs(section, true);
      section.isCollapsed = true;
    }
    StageManager.updateReferences();
  }

  /**
   * 由于复层折叠，引起所有子节点的被隐藏状态发生改变
   * @param section
   * @param isCollapsed
   */
  function modifyHiddenDfs(section: Section, isCollapsed: boolean) {
    // section.isCollapsed = isCollapsed;
    for (const childEntity of section.children) {
      if (childEntity instanceof Section) {
        modifyHiddenDfs(childEntity, isCollapsed);
      }
      childEntity.isHiddenBySectionCollapse = isCollapsed;
    }
  }

  /** 展开 */
  export function unpackSection(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      modifyHiddenDfs(section, false);
      section.isCollapsed = false;
    }
    StageManager.updateReferences();
  }

  export function switchCollapse(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      if (section.isCollapsed) {
        unpackSection();
      } else {
        packSection();
      }
    }
  }
  /**
   * 将所有选中的节点当场转换成Section
   */
  export function textNodeToSection(): void {
    for (const textNode of StageManager.getTextNodes()) {
      if (!textNode.isSelected) {
        continue;
      }
      targetTextNodeToSection(textNode);
    }
  }

  /**
   * 将指定的文本节点转换成Section
   * @param textNode
   */
  export function targetTextNodeToSection(textNode: TextNode) {
    // 获取这个节点的父级Section
    const fatherSections = SectionMethods.getFatherSections(textNode);
    const rect = textNode.collisionBox.getRectangle().expandFromCenter(50);
    const newSection = new Section({
      uuid: v4(),
      text: textNode.text,
      location: [rect.left, rect.top],
      size: [rect.size.x, rect.size.y],
      color: [textNode.color.r, textNode.color.g, textNode.color.b, textNode.color.a],
      details: textNode.details,
    });
    newSection.adjustLocationAndSize();
    // 获取所有连向它的和它连向的东西
    const fatherConnections = GraphMethods.nodeParentArray(textNode);
    const childConnections = GraphMethods.nodeChildrenArray(textNode);

    // 删除原来的textNode
    StageManager.deleteEntities([textNode]);
    // 将新的Section加入舞台
    StageManager.addSection(newSection);
    for (const fatherSection of fatherSections) {
      StageSectionInOutManager.goInSection([newSection], fatherSection);
    }

    // 将所有连向它的东西连到新的Section
    for (const fatherConnection of fatherConnections) {
      StageManager.connectEntity(fatherConnection, newSection);
    }
    // 将所有连向新的Section的东西连到它
    for (const childConnection of childConnections) {
      StageManager.connectEntity(newSection, childConnection);
    }
    // 更新section的碰撞箱
    newSection.adjustLocationAndSize();
  }
}
