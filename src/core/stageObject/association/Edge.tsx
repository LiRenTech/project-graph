import { Line } from "../../dataStruct/shape/Line";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { StageManager } from "../../stage/stageManager/StageManager";
import { CollisionBox } from "../collisionBox/collisionBox";
import { ConnectableAssociation, ConnectableEntity } from "../StageObject";

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
    const oldValue = this._isSelected;
    this._isSelected = value;
    if (oldValue !== value) {
      if (oldValue === true) {
        // 减少了一个选中节点
        StageManager.selectedEdgeCount--;
      } else {
        // 增加了一个选中节点
        StageManager.selectedEdgeCount++;
      }
    }
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
