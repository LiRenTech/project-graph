import { Direction } from "../../../../types/directions";
import { Vector } from "../../../dataStruct/Vector";
import { DirectionKeyUtilsEngine } from "../DirectionKeyUtilsEngine/directionKeyUtilsEngine";

/**
 * 纯键盘控制引擎内部的 生成节点位置的方向控制内核
 */
export class KeyboardOnlyDirectionController extends DirectionKeyUtilsEngine {
  protected reset(): void {
    console.warn("重启位置");
  }

  public clearSpeedAndAcc(): void {
    this.speed = Vector.getZero();
    this.accelerate = Vector.getZero();
    this.accelerateCommander = Vector.getZero();
  }

  override init(): void {
    window.addEventListener("keydown", (event) => {
      if (event.key === "i") {
        this.keyPress(Direction.Up);
      } else if (event.key === "k") {
        this.keyPress(Direction.Down);
      } else if (event.key === "j") {
        this.keyPress(Direction.Left);
      } else if (event.key === "l") {
        this.keyPress(Direction.Right);
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "i") {
        this.keyRelease(Direction.Up);
      } else if (event.key === "k") {
        this.keyRelease(Direction.Down);
      } else if (event.key === "j") {
        this.keyRelease(Direction.Left);
      } else if (event.key === "l") {
        this.keyRelease(Direction.Right);
      }
    });
  }
}
