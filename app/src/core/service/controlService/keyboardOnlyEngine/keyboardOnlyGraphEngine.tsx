import { Vector } from "@graphif/data-structures";
import { Project, service } from "../../../Project";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { KeyboardOnlyDirectionController } from "./keyboardOnlyDirectionController";
import { NewTargetLocationSelector } from "./newTargetLocationSelector";

/**
 * 纯键盘创建图论型的引擎
 */
@service("keyboardOnlyGraphEngine")
export class KeyboardOnlyGraphEngine {
  /**
   * 虚拟目标位置控制器
   */
  private targetLocationController = new KeyboardOnlyDirectionController();

  virtualTargetLocation(): Vector {
    return this.targetLocationController.location;
  }

  tick() {
    this.targetLocationController.logicTick();
  }

  constructor(private readonly project: Project) {
    this.targetLocationController.init();
  }
  /**
   * 是否达到了按下Tab键的前置条件
   */
  isEnableVirtualCreate(): boolean {
    // 确保只有一个节点被选中
    const selectConnectableEntities = this.project.stageManager
      .getConnectableEntity()
      .filter((node) => node.isSelected);
    if (selectConnectableEntities.length !== 1) {
      return false;
    }
    return true;
  }

  private _isCreating = false;
  /**
   * 当前是否是按下Tab键不松开的情况
   * @returns
   */
  isCreating(): boolean {
    return this._isCreating;
  }

  /**
   * 按下Tab键开始创建
   * @returns
   */
  createStart(): void {
    if (!this.project.keyboardOnlyEngine.isOpenning()) {
      return;
    }
    if (this.isCreating()) {
      // 已经在创建状态，不要重复创建
      return;
    }
    this._isCreating = true;
    // 记录上一次按下Tab键的时间
    this.lastPressTabTime = Date.now();
    // 计算并更新虚拟目标位置
    const selectConnectableEntities = this.project.stageManager
      .getConnectableEntity()
      .filter((node) => node.isSelected);

    // 如果只有一个节点被选中，则生成到右边的位置
    if (selectConnectableEntities.length === 1) {
      // 更新方向控制器的位置
      this.targetLocationController.resetLocation(
        selectConnectableEntities[0].collisionBox.getRectangle().center.add(NewTargetLocationSelector.diffLocation),
      );
      // 清空加速度和速度
      this.targetLocationController.clearSpeedAndAcc();
      // 最后更新虚拟目标位置
      NewTargetLocationSelector.onTabDown(selectConnectableEntities[0]);
    }
  }
  private lastPressTabTime = 0;

  /**
   * 返回按下Tab键的时间完成率，0-1之间，0表示刚刚按下Tab键，1表示已经达到可以松开Tab键的状态
   * @returns
   */
  getPressTabTimeInterval(): number {
    // 计算距离上次按下Tab键的时间间隔
    const now = Date.now();
    const interval = now - this.lastPressTabTime;
    return interval;
  }

  async createFinished() {
    this._isCreating = false;
    if (this.getPressTabTimeInterval() < 100) {
      this.project.effects.addEffect(TextRiseEffect.default("松开 生长键 过快💨"));
      return;
    }

    // 获取当前选择的所有节点
    const selectConnectableEntities = this.project.stageManager
      .getConnectableEntity()
      .filter((node) => node.isSelected);
    if (this.isTargetLocationHaveEntity()) {
      // 连接到之前的节点
      const entity = this.project.stageManager.findEntityByLocation(this.virtualTargetLocation());
      if (entity && entity instanceof ConnectableEntity) {
        // 连接到之前的节点
        for (const selectedEntity of selectConnectableEntities) {
          this.project.stageManager.connectEntity(selectedEntity, entity);
          this.project.effects.addEffects(this.project.edgeRenderer.getConnectedEffects(selectedEntity, entity));
        }
        // 选择到新创建的节点
        entity.isSelected = true;
        // 取消选择之前的节点
        for (const selectedEntity of selectConnectableEntities) {
          selectedEntity.isSelected = false;
        }
        // 鹿松狸 ：不要移动视野更好
        // 视野移动到新创建的节点
        // Camera.location = virtualTargetLocation().clone();
      }
    } else {
      // 更新diffLocation
      NewTargetLocationSelector.onTabUp(selectConnectableEntities[0], this.virtualTargetLocation());
      // 创建一个新的节点
      const newNodeUUID = await this.project.nodeAdder.addTextNodeByClick(this.virtualTargetLocation().clone(), []);
      const newNode = this.project.stageManager.getTextNodeByUUID(newNodeUUID);
      if (!newNode) return;
      // 连接到之前的节点
      for (const entity of selectConnectableEntities) {
        this.project.stageManager.connectEntity(entity, newNode);
        this.project.effects.addEffects(this.project.edgeRenderer.getConnectedEffects(entity, newNode));
      }
      // 选择到新创建的节点
      newNode.isSelected = true;
      // 取消选择之前的节点
      for (const entity of selectConnectableEntities) {
        entity.isSelected = false;
      }
      // 视野移动到新创建的节点
      // Camera.location = virtualTargetLocation().clone();
      this.project.controllerUtils.editTextNode(newNode);
    }
  }

  moveVirtualTarget(delta: Vector): void {
    this.targetLocationController.resetLocation(this.virtualTargetLocation().add(delta));
  }

  /**
   * 取消创建
   */
  createCancel(): void {
    // do nothing
    this._isCreating = false;
  }

  /**
   * 是否有实体在虚拟目标位置
   * @returns
   */
  isTargetLocationHaveEntity(): boolean {
    const entities = this.project.stageManager.getConnectableEntity();
    for (const entity of entities) {
      if (entity.collisionBox.isContainsPoint(this.virtualTargetLocation())) {
        return true;
      }
    }
    return false;
  }
}
