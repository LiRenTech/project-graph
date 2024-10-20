import { Vector } from "../dataStruct/Vector";

/**
 * 一切舞台上的东西
 * 都具有碰撞箱，uuid
 */
export abstract class StageObject implements Disposable {
  [Symbol.dispose](): void {
    throw new Error("Method not implemented.");
  }
  
  public collisionBox: any;
  // public uuid: string;
  
  _isSelected: boolean = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this._isSelected = value;
  }
}

/**
 * 一切独立存在、能被移动的东西，且放在框里能被连带移动的东西
 * 实体
 */
export abstract class Entity extends StageObject {
  abstract move(delta: Vector): void;
  abstract moveTo(location: Vector): void;
}

/**
 * 一切可被Edge连接的东西，且会算入图分析算法的东西
 */
export abstract class ConnectableEntity extends Entity {}

/**
 * 一切连接关系的抽象
 */
export abstract class Association extends StageObject {
  public associationList: StageObject[] = [];
}

/**
 * 一切可被连接的关联
 */
export abstract class ConnectableAssociation extends Association {
  public associationList: ConnectableEntity[] = [];
}