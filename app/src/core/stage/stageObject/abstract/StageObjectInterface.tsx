/**
 * 此文件记录各种关于舞台场景的特性
 */

import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";

export interface ResizeAble {
  /**
   * 拽住右下角的拖拽点拖拽，来改变大小
   * @param delta
   */
  resizeHandle(delta: Vector): void;

  /**
   * 获取改变大小的拖拽区域
   */
  getResizeHandleRect(): Rectangle;
}
