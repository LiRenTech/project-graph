import { CursorNameEnum } from "../../../../../types/cursors";
import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Line } from "../../../../dataStruct/shape/Line";
import { Vector } from "../../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
import { GraphMethods } from "../../../../stage/stageManager/basicMethods/GraphMethods";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { Association } from "../../../../stage/stageObject/abstract/Association";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { Edge } from "../../../../stage/stageObject/association/Edge";
import { LineEdge } from "../../../../stage/stageObject/association/LineEdge";
import { ConnectPoint } from "../../../../stage/stageObject/entity/ConnectPoint";
import { PenStroke } from "../../../../stage/stageObject/entity/PenStroke";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { CircleFlameEffect } from "../../../feedbackService/effectEngine/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../feedbackService/effectEngine/concrete/LineCuttingEffect";
import { PenStrokeDeletedEffect } from "../../../feedbackService/effectEngine/concrete/PenStrokeDeletedEffect";
import { RectangleSplitTwoPartEffect } from "../../../feedbackService/effectEngine/concrete/RectangleSplitTwoPartEffect";
import { SoundService } from "../../../feedbackService/SoundService";
import { StageStyleManager } from "../../../feedbackService/stageStyle/StageStyleManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { isMac } from "../../../../../utils/platform";
import { MouseLocation } from "../../MouseLocation";

class CuttingControllerClass extends ControllerClass {
  private _isControlKeyDown = false;
  private _controlKeyEventRegistered = false;

  private onControlKeyDown = (event: KeyboardEvent) => {
    if (isMac && event.key === "Control" && !this._isControlKeyDown) {
      this._isControlKeyDown = true;
      Controller.isMouseDown[2] = true;
      // 模拟鼠标按下事件
      const fakeMouseEvent = new MouseEvent("mousedown", {
        button: 2,
        clientX: MouseLocation.vector().x,
        clientY: MouseLocation.vector().y,
      });
      this.mousedown(fakeMouseEvent);
    }
  };

  private onControlKeyUp = (event: KeyboardEvent) => {
    if (isMac && event.key === "Control" && this._isControlKeyDown) {
      this._isControlKeyDown = false;
      Controller.isMouseDown[2] = false;
      // 模拟鼠标松开事件
      const fakeMouseEvent = new MouseEvent("mouseup", {
        button: 2,
        clientX: MouseLocation.vector().x,
        clientY: MouseLocation.vector().y,
      });
      this.mouseup(fakeMouseEvent);
    }
  };

  private registerControlKeyEvents() {
    if (!this._controlKeyEventRegistered) {
      window.addEventListener("keydown", this.onControlKeyDown);
      window.addEventListener("keyup", this.onControlKeyUp);
      this._controlKeyEventRegistered = true;
    }
  }

  private unregisterControlKeyEvents() {
    if (this._controlKeyEventRegistered) {
      window.removeEventListener("keydown", this.onControlKeyDown);
      window.removeEventListener("keyup", this.onControlKeyUp);
      this._controlKeyEventRegistered = false;
    }
  }
  constructor() {
    super();
    this.registerControlKeyEvents();
  }

  destroy() {
    super.destroy();
    this.unregisterControlKeyEvents();
  }

  public cuttingLine: Line = new Line(Vector.getZero(), Vector.getZero());
  public lastMoveLocation = Vector.getZero();
  public warningEntity: Entity[] = [];
  public warningSections: Section[] = [];
  public warningAssociations: Association[] = [];
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
    if (!(event.button == 2 || event.button == 0 || event.button == 1)) {
      return;
    }

    // 左键按下的
    if (event.button === 0 && Stage.leftMouseMode === LeftMouseModeEnum.connectAndCut) {
      this.mouseDownEvent(event);
      return;
    }
    // 右键按下的
    if (event.button === 2 && Stage.mouseRightDragBackground === "cut") {
      this.mouseDownEvent(event);
      return;
    }
    // 中键按下的
    if (event.button === 1 && Stage.mouseRightDragBackground === "moveCamera") {
      this.mouseDownEvent(event);
      return;
    }
  };

  private mouseDownEvent(event: MouseEvent) {
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    this.lastMoveLocation = pressWorldLocation.clone();

    const isClickedEntity = StageManager.isEntityOnLocation(pressWorldLocation);
    const isClickedAssociation = StageManager.isAssociationOnLocation(pressWorldLocation);

    if (!isClickedEntity && !isClickedAssociation) {
      // 开始绘制切断线
      this.isUsing = true;
      this.cuttingStartLocation = pressWorldLocation.clone();
      this.cuttingLine = new Line(this.cuttingStartLocation, this.cuttingStartLocation.clone());
      // 添加音效提示
      SoundService.play.cuttingLineStart();
      // 鼠标提示
      Controller.setCursorNameHook(CursorNameEnum.Crosshair);
    } else {
      this.isUsing = false;
    }
  }

  public mousemove: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!this.isUsing) {
      return;
    }
    if (Stage.drawingControlMachine.isAdjusting) {
      this.isUsing = false;
      return;
    }
    // 正在切断线
    this.cuttingLine = new Line(this.cuttingStartLocation, this.lastMoveLocation);

    this.updateWarningObjectByCuttingLine();
    this.lastMoveLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY), // 鼠标位置
    );
    // 渲染器需要
    Controller.lastMoveLocation = this.lastMoveLocation.clone();
  };

  // 删除孤立质点
  private clearIsolationPoint() {
    // 待检测的质点集
    const connectedPoints: ConnectPoint[] = [];
    for (const edge of this.warningAssociations) {
      if (edge instanceof Edge) {
        if (edge.source instanceof ConnectPoint) {
          connectedPoints.push(edge.source);
        }
        if (edge.target instanceof ConnectPoint) {
          connectedPoints.push(edge.target);
        }
      }
    }
    // 检测所有待检测的质点是否是孤立状态
    const prepareDeleteConnectPoints: ConnectPoint[] = [];
    for (const point of connectedPoints) {
      const childCount = GraphMethods.nodeChildrenArray(point).length;
      const parentCount = GraphMethods.nodeParentArray(point).length;
      if (childCount === 0 && parentCount === 0) {
        prepareDeleteConnectPoints.push(point);
      }
    }
    // 开始删除孤立质点
    StageManager.deleteEntities(prepareDeleteConnectPoints);
  }

  public mouseUpFunction(mouseUpWindowLocation: Vector) {
    this.isUsing = false;
    // 最后再更新一下鼠标位置
    this.lastMoveLocation = Renderer.transformView2World(
      mouseUpWindowLocation, // 鼠标位置
    );
    this.updateWarningObjectByCuttingLine();
    // 鼠标提示解除
    Controller.setCursorNameHook(CursorNameEnum.Default);

    // 删除连线
    for (const edge of this.warningAssociations) {
      StageManager.deleteAssociation(edge);
      if (edge instanceof Edge) {
        if (edge instanceof LineEdge) {
          Stage.effectMachine.addEffects(EdgeRenderer.getCuttingEffects(edge));
        }
      }
    }
    // 删除实体
    StageManager.deleteEntities(this.warningEntity);
    // 删除产生的孤立质点
    this.clearIsolationPoint();
    // 特效
    this.addEffectByWarningEntity();

    this.warningEntity = [];
    this.warningSections = [];

    StageManager.updateReferences();

    this.warningAssociations = [];

    Stage.effectMachine.addEffect(
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        this.cuttingStartLocation,
        this.lastMoveLocation,
        StageStyleManager.currentStyle.effects.warningShadow,
        StageStyleManager.currentStyle.effects.warningShadow,
        this.cuttingStartLocation.distance(this.lastMoveLocation) / 10,
      ),
    );

    // 声音提示
    SoundService.play.cuttingLineRelease();
  }

  public mouseup: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!(event.button == 2 || event.button == 0 || event.button == 1)) {
      return;
    }
    if (!this.isUsing) {
      return;
    }
    this.mouseUpFunction(new Vector(event.clientX, event.clientY));
  };

  public mouseMoveOutWindowForcedShutdown(outsideLocation: Vector) {
    super.mouseMoveOutWindowForcedShutdown(outsideLocation);
    Stage.cuttingMachine.mouseUpFunction(outsideLocation);
  }

  // private clearWarningObject() {
  //   this.warningEntity = [];
  //   this.warningSections = [];
  //   this.warningEdges = [];
  // }

  /**
   * 更新斩断线经过的所有鼠标对象
   *
   * 目前的更新是直接清除所有然后再重新遍历所有对象，后续可以优化
   * 此函数会在鼠标移动被频繁调用，所以需要优化
   */
  private updateWarningObjectByCuttingLine() {
    this.warningEntity = [];

    this.twoPointsMap = {};

    for (const entity of StageManager.getEntities()) {
      // if (entity instanceof Section) {
      //   continue; // Section的碰撞箱比较特殊
      // }
      if (entity.isHiddenBySectionCollapse) {
        continue; // 隐藏的节点不参与碰撞检测
      }
      if (entity.collisionBox.isIntersectsWithLine(this.cuttingLine)) {
        this.warningEntity.push(entity);
      }

      // 特效
      const collidePoints = entity.collisionBox.getRectangle().getCollidePointsWithLine(this.cuttingLine);

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
    this.warningSections = [];
    for (const section of StageManager.getSections()) {
      if (section.isHiddenBySectionCollapse) {
        continue; // 隐藏的节点不参与碰撞检测
      }
      if (section.collisionBox.isIntersectsWithLine(this.cuttingLine)) {
        this.warningSections.push(section);
      }
    }

    this.warningAssociations = [];
    for (const edge of StageManager.getAssociations()) {
      if (edge instanceof Edge && edge.isHiddenBySectionCollapse) {
        continue; // 连线被隐藏了
      }
      if (edge.collisionBox.isIntersectsWithLine(this.cuttingLine)) {
        this.warningAssociations.push(edge);
      }
    }
  }

  /**
   * 用于在释放的时候添加特效
   */
  private addEffectByWarningEntity() {
    // 裂开特效
    for (const entity of this.warningEntity) {
      const collidePoints = this.twoPointsMap[entity.uuid];
      if (collidePoints) {
        let fillColor = Color.Transparent;
        if (entity instanceof TextNode) {
          fillColor = entity.color.clone();
        } else if (entity instanceof Section) {
          fillColor = entity.color.clone();
        }

        if (entity instanceof PenStroke) {
          Stage.effectMachine.addEffect(PenStrokeDeletedEffect.fromPenStroke(entity));
        } else {
          Stage.effectMachine.addEffect(
            new RectangleSplitTwoPartEffect(
              entity.collisionBox.getRectangle(),
              collidePoints,
              50,
              fillColor,
              StageStyleManager.currentStyle.StageObjectBorder,
              2,
            ),
          );
        }
      }
    }
  }
}

/**
 * 关于斩断线的控制器
 * 可以删除节点 也可以切断边
 */
export const ControllerCutting = new CuttingControllerClass();
