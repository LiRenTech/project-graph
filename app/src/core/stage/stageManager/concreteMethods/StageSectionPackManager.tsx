// import { Section } from "../../../stageObject/entity/Section";
// import { Entity } from "../../../stageObject/StageEntity";
import { v4 } from "uuid";
import { Dialog } from "../../../../components/dialog";
import { Settings } from "../../../service/Settings";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { GraphMethods } from "../basicMethods/GraphMethods";
import { SectionMethods } from "../basicMethods/SectionMethods";
import { StageManager } from "../StageManager";
import { StageManagerUtils } from "./StageManagerUtils";
import { StageSectionInOutManager } from "./StageSectionInOutManager";
import { StageHistoryManager } from "../StageHistoryManager";

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
    StageHistoryManager.recordStep();
  }

  /**
   * 将节点树转换成嵌套集合
   */
  export function textNodeTreeToSection(rootNode: TextNode): void {
    if (!GraphMethods.isTree(rootNode)) {
      return;
    }
    const dfs = (node: TextNode): Section | TextNode => {
      const childNodes = GraphMethods.nodeChildrenArray(node).filter((node) => node instanceof TextNode);
      if (childNodes.length === 0) {
        return node;
      }
      const childEntityList = [];
      for (const childNode of childNodes) {
        const transEntity = dfs(childNode);
        childEntityList.push(transEntity);
        // TODO: 断开主和子之间的连线
      }
      const section = targetTextNodeToSection(node);

      StageSectionInOutManager.goInSection(childEntityList, section);
      return section;
    };
    dfs(rootNode);
  }

  /**
   * 将指定的文本节点转换成Section
   * @param textNode
   */
  export function targetTextNodeToSection(textNode: TextNode): Section {
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
    return newSection;
  }

  /** 将多个实体打包成一个section，并添加到舞台中 */
  export async function packEntityToSection(addEntities: Entity[]) {
    if (addEntities.length === 0) {
      return;
    }
    addEntities = SectionMethods.shallowerNotSectionEntities(addEntities);
    // 检测父亲section是否是等同
    const firstParents = SectionMethods.getFatherSections(addEntities[0]);
    if (addEntities.length > 1) {
      let isAllSameFather = true;

      for (let i = 1; i < addEntities.length; i++) {
        const secondParents = SectionMethods.getFatherSections(addEntities[i]);
        if (firstParents.length !== secondParents.length) {
          isAllSameFather = false;
          break;
        }
        // 检查父亲数组是否相同
        const firstParentsString = firstParents
          .map((section) => section.uuid)
          .sort()
          .join();
        const secondParentsString = secondParents
          .map((section) => section.uuid)
          .sort()
          .join();
        if (firstParentsString !== secondParentsString) {
          isAllSameFather = false;
          break;
        }
      }

      if (!isAllSameFather) {
        // 暂时不支持交叉section的创建
        Dialog.show({
          title: "选中的实体不在同一层级下",
          content: "暂时不鼓励交叉section的直接打包型创建",
        });
        return;
      }
    }
    for (const fatherSection of firstParents) {
      StageManager.goOutSection(addEntities, fatherSection);
    }
    const section = Section.fromEntities(addEntities);
    section.text = StageManagerUtils.replaceAutoNameTemplate(await Settings.get("autoNamerSectionTemplate"), section);
    StageManager.addSection(section);
    for (const fatherSection of firstParents) {
      StageManager.goInSection([section], fatherSection);
    }
  }
}
