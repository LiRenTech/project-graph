import { Vector } from "../../../dataStruct/Vector";
import { Entity } from "./StageEntity";

/**
 * 一切可被Edge连接的东西，且会算入图分析算法的东西
 */
export abstract class ConnectableEntity extends Entity {
  /**
   * 几何中心点
   * 用于联动旋转等算法
   */
  abstract geometryCenter: Vector;

  /**
   * 当该实体被连线识别时，会改成false
   */
  public unknown = true;
}
