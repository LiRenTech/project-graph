import { CursorNameEnum } from "../../../../../types/cursors";
import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Line } from "../../../../dataStruct/shape/Line";
import { Vector } from "../../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { LineEdge } from "../../../../stage/stageObject/association/LineEdge";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { CircleFlameEffect } from "../../../feedbackService/effectEngine/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../feedbackService/effectEngine/concrete/LineCuttingEffect";
import { RectangleSplitTwoPartEffect } from "../../../feedbackService/effectEngine/concrete/RectangleSplitTwoPartEffect";
import { SoundService } from "../../../feedbackService/SoundService";
import { StageStyleManager } from "../../../feedbackService/stageStyle/StageStyleManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

class CuttingControllerClass extends ControllerClass {
  public cuttingLine: Line = new Line(Vector.getZero(), Vector.getZero());
  public lastMoveLocation = Vector.getZero();
  public warningEntity: Entity[] = [];
  public warningSections: Section[] = [];
  public warningEdges: LineEdge[] = [];
  // 是否正在使用
  public isUsing = false;

  /**
   * 切割时与实体相交的两点
   */
  private twoPointsMap: Record<string, Vector[]> = {};

  /**
   * 开始绘制斩断线的起点位置
   */
  private cuttingStartLocation = Vector.getZero();

  public mousedown: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!(event.button == 2 || event.button == 3)) {
      return;
    }
    if (Stage.mouseRightDragBackground !== "cut") {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    ControllerCutting.lastMoveLocation = pressWorldLocation.clone();

    const isClickedEntity = StageManager.isEntityOnLocation(pressWorldLocation);
    const isClickedAssociation = StageManager.isAssociationOnLocation(pressWorldLocation);

    if (!isClickedEntity && !isClickedAssociation) {
      // 开始绘制切断线
      ControllerCutting.isUsing = true;
      ControllerCutting.cuttingStartLocation = pressWorldLocation.clone();
      ControllerCutting.cuttingLine = new Line(
        ControllerCutting.cuttingStartLocation,
        ControllerCutting.cuttingStartLocation.clone(),
      );
      // 添加音效提示
      SoundService.play.cuttingLineStart();
      // 鼠标提示
      Controller.setCursorNameHook(CursorNameEnum.Crosshair);
    } else {
      ControllerCutting.isUsing = false;
    }
  };

  public mousemove: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!ControllerCutting.isUsing) {
      return;
    }
    // 正在切断线
    ControllerCutting.cuttingLine = new Line(
      ControllerCutting.cuttingStartLocation,
      ControllerCutting.lastMoveLocation,
    );

    ControllerCutting.warningEntity = [];

    this.twoPointsMap = {};

    for (const entity of StageManager.getEntities()) {
      // if (entity instanceof Section) {
      //   continue; // Section的碰撞箱比较特殊
      // }
      if (entity.isHiddenBySectionCollapse) {
        continue; // 隐藏的节点不参与碰撞检测
      }
      if (entity.collisionBox.isIntersectsWithLine(ControllerCutting.cuttingLine)) {
        ControllerCutting.warningEntity.push(entity);
      }

      // 特效
      const collidePoints = entity.collisionBox.getRectangle().getCollidePointsWithLine(ControllerCutting.cuttingLine);

      if (collidePoints.length === 2) {
        this.twoPointsMap[entity.uuid] = collidePoints;
      }

      // 增加两点特效
      for (const collidePoint of collidePoints) {
        Stage.effectMachine.addEffect(
          new CircleFlameEffect(new ProgressNumber(0, 5), collidePoint, 10, new Color(255, 255, 255, 1)),
        );
      }
    }

    ControllerCutting.warningSections = [];
    for (const section of StageManager.getSections()) {
      if (section.isHiddenBySectionCollapse) {
        continue; // 隐藏的节点不参与碰撞检测
      }
      if (section.collisionBox.isIntersectsWithLine(ControllerCutting.cuttingLine)) {
        ControllerCutting.warningSections.push(section);
      }
    }

    ControllerCutting.warningEdges = [];
    for (const edge of StageManager.getLineEdges()) {
      if (edge.isHiddenBySectionCollapse) {
        continue; // 连线被隐藏了
      }
      if (edge.collisionBox.isIntersectsWithLine(ControllerCutting.cuttingLine)) {
        ControllerCutting.warningEdges.push(edge);
      }
    }
    ControllerCutting.lastMoveLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY), // 鼠标位置
    );
    // 渲染器需要
    Controller.lastMoveLocation = ControllerCutting.lastMoveLocation.clone();
  };

  public mouseup: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!(event.button == 2 || event.button == 3)) {
      return;
    }
    if (!ControllerCutting.isUsing) {
      return;
    }
    ControllerCutting.isUsing = false;
    // 鼠标提示解除
    Controller.setCursorNameHook(CursorNameEnum.Default);

    for (const edge of ControllerCutting.warningEdges) {
      StageManager.deleteEdge(edge);
      for (const effect of EdgeRenderer.getCuttingEffects(edge)) {
        Stage.effectMachine.addEffect(effect);
      }
    }
    StageManager.deleteEntities(ControllerCutting.warningEntity);
    // 裂开特效
    for (const entity of ControllerCutting.warningEntity) {
      const collidePoints = this.twoPointsMap[entity.uuid];
      if (collidePoints) {
        console.log(collidePoints, "分开了");
        Stage.effectMachine.addEffect(
          new RectangleSplitTwoPartEffect(
            entity.collisionBox.getRectangle(),
            collidePoints,
            50,
            StageStyleManager.currentStyle.SelectRectangleFillColor.toSolid(),
            StageStyleManager.currentStyle.StageObjectBorderColor,
            2,
          ),
        );
      }
    }
    ControllerCutting.warningEntity = [];
    ControllerCutting.warningSections = [];

    StageManager.updateReferences();

    ControllerCutting.warningEdges = [];

    Stage.effectMachine.addEffect(
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        ControllerCutting.cuttingStartLocation,
        ControllerCutting.lastMoveLocation,
        StageStyleManager.currentStyle.effects.warningShadow,
        StageStyleManager.currentStyle.effects.warningShadow,
        ControllerCutting.cuttingStartLocation.distance(ControllerCutting.lastMoveLocation) / 10,
      ),
    );

    // 声音提示
    SoundService.play.cuttingLineRelease();
  };
}

/**
 * 关于斩断线的控制器
 * 可以删除节点 也可以切断边
 */
export const ControllerCutting = new CuttingControllerClass();
