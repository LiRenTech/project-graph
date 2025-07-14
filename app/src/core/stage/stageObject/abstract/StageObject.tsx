import { CollisionBox } from "../collisionBox/collisionBox";

/**
 * 注：关于舞台上的东西的这一部分的
 * 继承体系是 Rutubet 和 Littlefean 的讨论结果
 *
 */

/**
 * 一切舞台上的东西
 * 都具有碰撞箱，uuid
 */
export abstract class StageObject implements Disposable {
  // 资源释放
  [Symbol.dispose](): void {
    throw new Error("Method not implemented.");
  }

  // 舞台对象，必定有 uuid
  public abstract uuid: string;

  // 舞台对象，必定有碰撞箱
  public abstract collisionBox: CollisionBox;

  // 舞台对象，必定有选中状态
  _isSelected: boolean = false;

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    this._isSelected = value;
  }
}
