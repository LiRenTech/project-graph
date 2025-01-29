import { Vector } from "../../../dataStruct/Vector";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";

/**
 * 仅在keyboardOnlyEngine模块中使用
 * 纯键盘操作，按下Tab自动生长节点时，自动选择一开始瞬间出现的初始目标位置
 * 的功能模块
 *
 * 以尽可能减少用户按方向键更改目标位置的操作，提高效率
 */
export namespace NewTargetLocationSelector {
  export let diffLocation = new Vector(150, 0);

  /**
   *
   * @param selectedNode 当前选择的是哪个节点
   * @returns 返回最佳的目标位置
   */
  export function onTabDown(selectedNode: ConnectableEntity): Vector {
    return selectedNode.collisionBox.getRectangle().center.add(diffLocation);
  }

  /**
   * 在Tab键抬起时
   * @param selectedNode 当前选择的是哪个节点
   * @param finalChoiceLocation 最终用户选择生成的位置
   */
  export function onTabUp(selectedNode: ConnectableEntity, finalChoiceLocation: Vector): void {
    diffLocation = finalChoiceLocation.subtract(selectedNode.collisionBox.getRectangle().center);
  }
}
