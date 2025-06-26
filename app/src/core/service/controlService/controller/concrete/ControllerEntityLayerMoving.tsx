import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Stage } from "../../../../stage/Stage";
import { SectionMethods } from "../../../../stage/stageManager/basicMethods/SectionMethods";
import { StageEntityMoveManager } from "../../../../stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageSectionInOutManager } from "../../../../stage/stageManager/concreteMethods/StageSectionInOutManager";
import { StageSectionPackManager } from "../../../../stage/stageManager/concreteMethods/StageSectionPackManager";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { EntityJumpMoveEffect } from "../../../feedbackService/effectEngine/concrete/EntityJumpMoveEffect";
import { EntityShakeEffect } from "../../../feedbackService/effectEngine/concrete/EntityShakeEffect";
import { RectanglePushInEffect } from "../../../feedbackService/effectEngine/concrete/RectanglePushInEffect";
import { TextRiseEffect } from "../../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ControllerClass } from "../ControllerClass";

/**
 * 创建节点层级移动控制器
 */

export class ControllerLayerMovingClass extends ControllerClass {
  public get isEnabled(): boolean {
    if (Stage.leftMouseMode === "draw") {
      return false;
    }
    return true;
  }

  public mousemove: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!this.project.controller.pressingKeySet.has("alt")) {
      return;
    }
    if (this.isEnabled === false) {
      return;
    }
    if (this.project.stageManager.getSelectedEntities().length === 0) {
      return;
    }
    this.project.controller.mouseLocation = this.project.renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
  };

  public mouseup: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!this.project.controller.pressingKeySet.has("alt")) {
      return;
    }
    if (this.isEnabled === false) {
      return;
    }
    if (this.project.stageManager.getSelectedEntities().length === 0) {
      return;
    }
    const mouseLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));

    // 提前检查点击的位置是否有一个TextNode，如果有，则转换成Section
    const entity = this.project.stageManager.findEntityByLocation(mouseLocation);
    if (entity && entity instanceof TextNode) {
      // 防止无限循环嵌套：当跳入的实体是选中的所有内容当中任意一个Section的内部时，禁止触发该操作
      const selectedEntities = this.project.stageManager.getSelectedEntities();
      for (const selectedEntity of selectedEntities) {
        if (selectedEntity instanceof Section && SectionMethods.isEntityInSection(entity, selectedEntity)) {
          this.project.effects.addEffect(EntityShakeEffect.fromEntity(entity));
          this.project.effects.addEffect(EntityShakeEffect.fromEntity(selectedEntity));
          this.project.effects.addEffect(TextRiseEffect.default("禁止将框套入自身内部"));
          return;
        }
      }

      const newSection = StageSectionPackManager.targetTextNodeToSection(entity);
      if (newSection && selectedEntities.length > 0) {
        // 获取所有选中实体的外接矩形的中心点，以便计算移动距离
        const centerLocation = Rectangle.getBoundingRectangle(
          selectedEntities.map((entity) => entity.collisionBox.getRectangle()),
        ).center;
        // 最后让所有选中的实体移动
        for (const selectedEntity of selectedEntities) {
          const delta = mouseLocation.subtract(centerLocation);
          selectedEntity.move(delta);
        }
        StageSectionInOutManager.goInSections(this.project.stageManager.getSelectedEntities(), [newSection]);
      }

      return; // 这个return必须写
    }

    // 即将跳入的sections区域
    const targetSections = SectionMethods.getSectionsByInnerLocation(mouseLocation);
    const selectedEntities = this.project.stageManager.getSelectedEntities();

    // 防止无限循环嵌套：当跳入的实体是选中的所有内容当中任意一个Section的内部时，禁止触发该操作
    for (const selectedEntity of selectedEntities) {
      if (selectedEntity instanceof Section) {
        for (const targetSection of targetSections) {
          if (SectionMethods.isEntityInSection(targetSection, selectedEntity)) {
            this.project.effects.addEffect(EntityShakeEffect.fromEntity(targetSection));
            this.project.effects.addEffect(TextRiseEffect.default("禁止将框套入自身内部"));
            return;
          }
        }
      }
    }

    // 移动位置

    // 1 计算所有节点应该移动的 delta
    // 1.0 计算当前框选的所有实体的中心位置
    const selectedRectangles = selectedEntities.map((entity) => {
      return entity.collisionBox.getRectangle();
    });
    const centerLocation = Rectangle.getBoundingRectangle(selectedRectangles).center;

    const delta = mouseLocation.subtract(centerLocation);
    // 4 特效(要先加特效，否则位置已经被改了)
    for (const entity of selectedEntities) {
      this.project.effects.addEffect(new EntityJumpMoveEffect(15, entity.collisionBox.getRectangle(), delta));
    }
    // 3 移动所有选中的实体 的位置
    StageEntityMoveManager.moveSelectedEntities(delta);

    // 改变层级
    if (targetSections.length === 0) {
      // 代表想要走到最外层空白位置
      for (const entity of selectedEntities) {
        const currentFatherSections = SectionMethods.getFatherSections(entity);
        for (const currentFatherSection of currentFatherSections) {
          this.project.stageManager.goOutSection([entity], currentFatherSection);

          // 特效
          this.project.effects.addEffect(
            RectanglePushInEffect.sectionGoInGoOut(
              entity.collisionBox.getRectangle(),
              currentFatherSection.collisionBox.getRectangle(),
              true,
            ),
          );
        }
      }
    } else {
      // 跑到了别的层级之中

      StageSectionInOutManager.goInSections(selectedEntities, targetSections);

      for (const section of targetSections) {
        // this.project.stageManager.goInSection(selectedEntities, section);

        // 特效
        for (const entity of selectedEntities) {
          this.project.effects.addEffect(
            RectanglePushInEffect.sectionGoInGoOut(
              entity.collisionBox.getRectangle(),
              section.collisionBox.getRectangle(),
            ),
          );
        }
      }
    }
  };
}
