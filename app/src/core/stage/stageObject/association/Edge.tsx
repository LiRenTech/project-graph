import { Vector } from "@graphif/data-structures";
import { Line, Rectangle } from "@graphif/shapes";
import { ConnectableAssociation } from "@/core/stage/stageObject/abstract/Association";
import { ConnectableEntity } from "@/core/stage/stageObject/abstract/ConnectableEntity";
import { CollisionBox } from "@/core/stage/stageObject/collisionBox/collisionBox";

/**
 * 连接两个实体的有向边
 */
export abstract class Edge extends ConnectableAssociation {
  public abstract uuid: string;
  /**
   * 线段上的文字
   */
  public abstract text: string;
  abstract collisionBox: CollisionBox;
  /** 连接两个实体的部分 */

  protected abstract _source: ConnectableEntity;
  protected abstract _target: ConnectableEntity;

  get source(): ConnectableEntity {
    return this._source;
  }
  set source(value: ConnectableEntity) {
    this._source = value;
  }
  get isHiddenBySectionCollapse(): boolean {
    return this.source.isHiddenBySectionCollapse && this.target.isHiddenBySectionCollapse;
  }

  get target(): ConnectableEntity {
    return this._target;
  }
  set target(value: ConnectableEntity) {
    this._target = value;
  }
  /** region 选中状态 */
  /**
   * 是否被选中
   */
  _isSelected: boolean = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this._isSelected = value;
  }

  /**
   * 任何有向边都可以标注文字
   * 进而获得该文字的外框矩形
   */
  abstract get textRectangle(): Rectangle;

  /**
   * 获取两个实体之间的直线
   * 此直线两端在两个实体外接矩形的边缘，延长后可过两个实体外接矩形的中心
   */
  get bodyLine(): Line {
    const sourceRectangle = this.source.collisionBox.getRectangle();
    const targetRectangle = this.target.collisionBox.getRectangle();

    const edgeCenterLine = new Line(
      sourceRectangle.getInnerLocationByRateVector(this._sourceRectangleRate),
      targetRectangle.getInnerLocationByRateVector(this._targetRectangleRate),
    );
    const startPoint = sourceRectangle.getLineIntersectionPoint(edgeCenterLine);
    const endPoint = targetRectangle.getLineIntersectionPoint(edgeCenterLine);
    return new Line(startPoint, endPoint);
  }

  /**
   * 获取该连线的起始点位置对应的世界坐标
   */
  get sourceLocation(): Vector {
    return this.source.collisionBox.getRectangle().getInnerLocationByRateVector(this._sourceRectangleRate);
  }
  /**
   * 获取该连线的终止点位置对应的世界坐标
   */
  get targetLocation(): Vector {
    return this.target.collisionBox.getRectangle().getInnerLocationByRateVector(this._targetRectangleRate);
  }

  public _targetRectangleRate: Vector = new Vector(0.5, 0.5);
  public _sourceRectangleRate: Vector = new Vector(0.5, 0.5);

  get targetRectangleRate(): Vector {
    return this._targetRectangleRate;
  }
  get sourceRectangleRate(): Vector {
    return this._sourceRectangleRate;
  }
  // 设置接头比率位置
  setTargetRectangleRate(rateVector: Vector) {
    this._targetRectangleRate = rateVector;
  }
  setSourceRectangleRate(rateVector: Vector) {
    this._sourceRectangleRate = rateVector;
  }

  /**
   * 静态方法：
   * 获取两个实体外接矩形的连线线段，（只连接到两个边，不连到矩形中心）
   * @param source
   * @param target
   * @returns
   */
  static getCenterLine(source: ConnectableEntity, target: ConnectableEntity): Line {
    const sourceRectangle = source.collisionBox.getRectangle();
    const targetRectangle = target.collisionBox.getRectangle();

    const edgeCenterLine = new Line(sourceRectangle.center, targetRectangle.center);
    const startPoint = sourceRectangle.getLineIntersectionPoint(edgeCenterLine);
    const endPoint = targetRectangle.getLineIntersectionPoint(edgeCenterLine);
    return new Line(startPoint, endPoint);
  }

  /** 线段上的文字相关 */
  /**
   * 调整线段上的文字的外框矩形
   */
  abstract adjustSizeByText(): void;

  public rename(text: string) {
    this.text = text;
    this.adjustSizeByText();
  }

  /** 碰撞相关 */
  /**
   * 用于碰撞箱框选
   * @param rectangle
   */
  public isIntersectsWithRectangle(rectangle: Rectangle): boolean {
    return this.collisionBox.isIntersectsWithRectangle(rectangle);
  }

  /**
   * 用于鼠标悬浮在线上的时候
   * @param location
   * @returns
   */
  public isIntersectsWithLocation(location: Vector): boolean {
    return this.collisionBox.isContainsPoint(location);
  }

  /**
   * 用于线段框选
   * @param line
   * @returns
   */
  public isIntersectsWithLine(line: Line): boolean {
    return this.collisionBox.isIntersectsWithLine(line);
  }
}
