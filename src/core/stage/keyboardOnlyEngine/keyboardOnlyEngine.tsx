import { Vector } from "../../dataStruct/Vector";
import { Camera } from "../Camera";
import { StageManager } from "../stageManager/StageManager";
import { ConnectableEntity } from "../../stageObject/StageObject";
import { Dialog } from "../../../utils/dialog";
import { editTextNode } from "../../controller/concrete/utilsControl";
import { SelectChangeEngine } from "./selectChangeEngine";
import { KeyboardOnlyDirectionController } from "./keyboardOnlyDirectionController";
import { Stage } from "../Stage";
import { EdgeRenderer } from "../../render/canvas2d/entityRenderer/edge/EdgeRenderer";

/**
 * 纯键盘控制的相关引擎
 */
export namespace KeyboardOnlyEngine {
  /**
   * 虚拟目标位置控制器
   */
  const targetLocationController = new KeyboardOnlyDirectionController();

  export function virtualTargetLocation(): Vector {
    return targetLocationController.location;
  }

  export function init() {
    bindKeyEvents();
    targetLocationController.init();
  }

  export function logicTick() {
    targetLocationController.logicTick();
  }

  /**
   * 开始绑定按键事件
   * 仅在最开始调用一次
   */
  function bindKeyEvents() {
    console.log("bindKeyEvents");
    window.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        if (isEnableVirtualCreate()) {
          createStart();
        }
      } else if (event.key === "Enter") {
        // 这个还必须在down的位置上，因为在up上会导致无限触发
        const selectedNode = StageManager.getTextNodes().find(
          (node) => node.isSelected,
        );
        if (!selectedNode) return;
        // 编辑节点
        editTextNode(selectedNode);
      } else {
        SelectChangeEngine.listenKeyDown(event);
      }
    });
    window.addEventListener("keyup", (event) => {
      if (event.key === "Tab") {
        if (isCreating()) {
          createFinished();
        }
      }
    });
  }

  /**
   * 是否达到了按下Tab键的前置条件
   */
  export function isEnableVirtualCreate(): boolean {
    // 确保只有一个节点被选中
    const selectConnectableEntities =
      StageManager.getConnectableEntity().filter((node) => node.isSelected);
    if (selectConnectableEntities.length !== 1) {
      return false;
    }
    return true;
  }

  let _isCreating = false;
  /**
   * 当前是否是按下Tab键不松开的情况
   * @returns
   */
  export function isCreating(): boolean {
    return _isCreating;
  }

  let lastDiffLocation = new Vector(200, 0);

  export function createStart(): void {
    if (isCreating()) {
      // 已经在创建状态，不要重复创建
      return;
    }
    _isCreating = true;
    // 记录上一次按下Tab键的时间
    lastPressTabTime = Date.now();
    // 计算并更新虚拟目标位置
    const selectConnectableEntities =
      StageManager.getConnectableEntity().filter((node) => node.isSelected);

    // 如果只有一个节点被选中，则生成到右边的位置
    if (selectConnectableEntities.length === 1) {
      targetLocationController.resetLocation(
        selectConnectableEntities[0].collisionBox
          .getRectangle()
          .rightCenter.add(lastDiffLocation),
      );
    }
  }
  let lastPressTabTime = 0;

  /**
   * 返回按下Tab键的时间完成率，0-1之间，0表示刚刚按下Tab键，1表示已经达到可以松开Tab键的状态
   * @returns
   */
  export function getPressTabTimeInterval(): number {
    // 计算距离上次按下Tab键的时间间隔
    const now = Date.now();
    const interval = now - lastPressTabTime;
    return interval;
  }

  async function createFinished() {
    _isCreating = false;
    if (getPressTabTimeInterval() < 100) {
      Dialog.show({
        title: "松开Tab键过快💨",
        content:
          "按下Tab键的时间要在0.1秒以上，在松开Tab键之前，可以通过IKJL键移动虚拟目标位置。",
        type: "warning",
      });
      return;
    }
    // 获取当前选择的所有节点
    const selectConnectableEntities =
      StageManager.getConnectableEntity().filter((node) => node.isSelected);
    if (isTargetLocationHaveEntity()) {
      // 连接到之前的节点
      const entity = StageManager.findEntityByLocation(virtualTargetLocation());
      if (entity && entity instanceof ConnectableEntity) {
        // 连接到之前的节点
        for (const selectedEntity of selectConnectableEntities) {
          StageManager.connectEntity(selectedEntity, entity);
          Stage.effects.push(
            ...EdgeRenderer.getConnectedEffects(selectedEntity, entity),
          );
        }
        // 选择到新创建的节点
        entity.isSelected = true;
        // 取消选择之前的节点
        for (const selectedEntity of selectConnectableEntities) {
          selectedEntity.isSelected = false;
        }
        // 视野移动到新创建的节点
        Camera.location = virtualTargetLocation().clone();
      }
    } else {
      // 更新diffLocation
      lastDiffLocation = virtualTargetLocation()
        .clone()
        .subtract(
          selectConnectableEntities[0].collisionBox.getRectangle().center,
        );
      // 创建一个新的节点
      const newNodeUUID = await StageManager.addTextNodeByClick(
        virtualTargetLocation().clone(),
        [],
      );
      const newNode = StageManager.getTextNodeByUUID(newNodeUUID);
      if (!newNode) return;
      // 连接到之前的节点
      for (const entity of selectConnectableEntities) {
        StageManager.connectEntity(entity, newNode);
        Stage.effects.push(
          ...EdgeRenderer.getConnectedEffects(entity, newNode),
        );
      }
      // 选择到新创建的节点
      newNode.isSelected = true;
      // 取消选择之前的节点
      for (const entity of selectConnectableEntities) {
        entity.isSelected = false;
      }
      // 视野移动到新创建的节点
      Camera.location = virtualTargetLocation().clone();
      editTextNode(newNode);
    }
  }

  export function moveVirtualTarget(delta: Vector): void {
    targetLocationController.resetLocation(virtualTargetLocation().add(delta));
  }

  /**
   * 取消创建
   */
  export function createCancel(): void {
    // do nothing
    _isCreating = false;
  }

  /**
   * 是否有实体在虚拟目标位置
   * @returns
   */
  export function isTargetLocationHaveEntity(): boolean {
    const entities = StageManager.getConnectableEntity();
    for (const entity of entities) {
      if (entity.collisionBox.isContainsPoint(virtualTargetLocation())) {
        return true;
      }
    }
    return false;
  }
}
