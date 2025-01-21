import { Dialog } from "../../../../utils/dialog";
import { NumberFunctions } from "../../../algorithm/numberFunctions";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { autoLayoutFastTreeMode } from "../../../service/autoLayoutEngine/autoLayoutFastTreeMode";
import { EntityAlignEffect } from "../../../service/effectEngine/concrete/EntityAlignEffect";
import { RectangleRenderEffect } from "../../../service/effectEngine/concrete/RectangleRenderEffect";
import { SoundService } from "../../../service/SoundService";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { ConnectableEntity, Entity } from "../../../stageObject/StageObject";
import { Stage } from "../../Stage";
import { StageManager } from "../StageManager";

/**
 * 自动对齐和布局管理器
 */
export namespace StageAutoAlignManager {
  /**
   * 吸附函数
   * 用于鼠标松开的时候自动移动位置一小段距离
   */
  export function alignAllSelected() {
    const selectedEntities = StageManager.getSelectedEntities();
    const viewRectangle = Renderer.getCoverWorldRectangle();
    const otherEntities = StageManager.getEntities()
      .filter((entity) => !entity.isSelected)
      .filter((entity) =>
        entity.collisionBox.getRectangle().isAbsoluteIn(viewRectangle),
      );
    for (const selectedEntity of selectedEntities) {
      if (!(selectedEntity instanceof TextNode)) {
        continue;
      }
      onEntityMoveAlignToOtherEntity(selectedEntity, otherEntities);
    }
  }

  /**
   * 预先对齐显示反馈
   * 用于鼠标移动的时候显示对齐的效果
   */
  export function preAlignAllSelected() {
    const selectedEntities = StageManager.getSelectedEntities();
    const viewRectangle = Renderer.getCoverWorldRectangle();
    const otherEntities = StageManager.getEntities()
      .filter((entity) => !entity.isSelected)
      .filter((entity) =>
        entity.collisionBox.getRectangle().isAbsoluteIn(viewRectangle),
      );
    for (const selectedEntity of selectedEntities) {
      if (!(selectedEntity instanceof TextNode)) {
        continue;
      }
      onEntityMoveAlignToOtherEntity(selectedEntity, otherEntities, true);
    }
  }

  /**
   * 将一个节点对齐到其他节点
   * @param selectedEntity
   * @param otherEntities 其他未选中的节点，在上游做好筛选
   */
  function onEntityMoveAlignToOtherEntity(
    selectedEntity: Entity,
    otherEntities: Entity[],
    isPreAlign = false,
  ) {
    // // 只能和一个节点对齐
    // let isHaveAlignTarget = false;
    // 按照与 selectedEntity 的距离排序
    const sortedOtherEntities = otherEntities
      .sort((a, b) => {
        const distanceA = calculateDistance(selectedEntity, a);
        const distanceB = calculateDistance(selectedEntity, b);
        return distanceA - distanceB; // 升序排序
      })
      .filter((entity) => {
        // 排除entity是selectedEntity的父亲Section框
        // 可以偷个懒，如果检测两个entity具有位置重叠了，那么直接排除过滤掉
        return !entity.collisionBox
          .getRectangle()
          .isCollideWithRectangle(selectedEntity.collisionBox.getRectangle());
      });
    let isAlign = false;
    // 目前先只做节点吸附
    let xMoveDiff = 0;
    let yMoveDiff = 0;
    const xTargetRectangles: Rectangle[] = [];
    const yTargetRectangles: Rectangle[] = [];
    // X轴对齐 ||||
    for (const otherEntity of sortedOtherEntities) {
      xMoveDiff = onEntityMoveAlignToTargetEntityX(
        selectedEntity,
        otherEntity,
        isPreAlign,
      );
      if (xMoveDiff !== 0) {
        isAlign = true;
        xTargetRectangles.push(otherEntity.collisionBox.getRectangle());
        break;
      }
    }
    // Y轴对齐 =
    for (const otherEntity of sortedOtherEntities) {
      yMoveDiff = onEntityMoveAlignToTargetEntityY(
        selectedEntity,
        otherEntity,
        isPreAlign,
      );
      if (yMoveDiff !== 0) {
        isAlign = true;
        yTargetRectangles.push(otherEntity.collisionBox.getRectangle());
        break;
      }
    }
    if (isAlign && isPreAlign) {
      // 预先对齐显示反馈
      const rectangle = selectedEntity.collisionBox.getRectangle();
      const moveTargetRectangle = rectangle.clone();
      moveTargetRectangle.location.x += xMoveDiff;
      moveTargetRectangle.location.y += yMoveDiff;

      Stage.effects.push(
        RectangleRenderEffect.fromPreAlign(moveTargetRectangle),
      );
      for (const targetRectangle of xTargetRectangles.concat(
        yTargetRectangles,
      )) {
        Stage.effects.push(
          EntityAlignEffect.fromEntity(moveTargetRectangle, targetRectangle),
        );
      }
    }
    if (isAlign && !isPreAlign) {
      SoundService.play.alignAndAttach();
    }
  }

  function _addAlignEffect(selectedEntity: Entity, otherEntity: Entity) {
    Stage.effects.push(
      EntityAlignEffect.fromEntity(
        selectedEntity.collisionBox.getRectangle(),
        otherEntity.collisionBox.getRectangle(),
      ),
    );
  }

  /**
   * 将一个节点对齐到另一个节点
   * @param selectedEntity
   * @param otherEntity
   * @returns
   */
  function onEntityMoveAlignToTargetEntityX(
    selectedEntity: Entity,
    otherEntity: Entity,
    isPreAlign = false,
  ): number {
    // 左侧x轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().left,
        otherEntity.collisionBox.getRectangle().left,
        25,
      )
    ) {
      const distance =
        otherEntity.collisionBox.getRectangle().left -
        selectedEntity.collisionBox.getRectangle().left;
      if (!isPreAlign) {
        selectedEntity.move(new Vector(distance, 0));
      }
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return distance;
    }
    // 右侧x轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().right,
        otherEntity.collisionBox.getRectangle().right,
        25,
      )
    ) {
      const distance =
        otherEntity.collisionBox.getRectangle().right -
        selectedEntity.collisionBox.getRectangle().right;
      if (!isPreAlign) {
        selectedEntity.move(new Vector(distance, 0));
      }
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return distance;
    }
    return 0;
  }

  function onEntityMoveAlignToTargetEntityY(
    selectedEntity: Entity,
    otherEntity: Entity,
    isPreAlign = false,
  ): number {
    // 上侧y轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().top,
        otherEntity.collisionBox.getRectangle().top,
        25,
      )
    ) {
      const distance =
        otherEntity.collisionBox.getRectangle().top -
        selectedEntity.collisionBox.getRectangle().top;
      if (!isPreAlign) {
        selectedEntity.move(new Vector(0, distance));
      }
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return distance;
    }
    // 下侧y轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().bottom,
        otherEntity.collisionBox.getRectangle().bottom,
        25,
      )
    ) {
      const distance =
        otherEntity.collisionBox.getRectangle().bottom -
        selectedEntity.collisionBox.getRectangle().bottom;
      if (!isPreAlign) {
        selectedEntity.move(new Vector(0, distance));
      }
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return distance;
    }
    return 0;
  }

  // 假设你有一个方法可以计算两个节点之间的距离
  function calculateDistance(entityA: Entity, entityB: Entity) {
    const rectA = entityA.collisionBox.getRectangle();
    const rectB = entityB.collisionBox.getRectangle();

    // 计算距离，可以根据需要选择合适的距离计算方式
    const dx = rectA.center.x - rectB.center.x;
    const dy = rectA.center.y - rectB.center.y;

    return Math.sqrt(dx * dx + dy * dy); // 返回欧几里得距离
  }

  /**
   * 自动布局树形结构
   * @param selectedRootEntity
   */
  export function autoLayoutSelectedFastTreeMode(
    selectedRootEntity: ConnectableEntity,
  ) {
    // 检测树形结构
    if (!StageManager.isTree(selectedRootEntity)) {
      // 不是树形结构，不做任何处理
      Dialog.show({
        title: "提示",
        content: "选择的节点必须是树形结构的根节点",
      });
      return;
    }
    autoLayoutFastTreeMode(selectedRootEntity);
  }
}
