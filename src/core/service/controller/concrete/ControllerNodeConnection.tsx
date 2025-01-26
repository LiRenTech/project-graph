import { v4 } from "uuid";
import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/StageObject";
import { ConnectPoint } from "../../../stage/stageObject/entity/ConnectPoint";
import { SoundService } from "../../SoundService";
import { CircleFlameEffect } from "../../effectEngine/concrete/CircleFlameEffect";
import { RectangleNoteEffect } from "../../effectEngine/concrete/RectangleNoteEffect";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { PointDashEffect } from "../../effectEngine/concrete/PointDashEffect";
import { addTextNodeByLocation } from "./utilsControl";

class ControllerNodeConnectionClass extends ControllerClass {
  /**
   * 仅限在当前文件中使用的记录
   * 右键点击的位置，仅用于连接检测按下位置和抬起位置是否重叠
   */
  private _lastRightMouseClickLocation: Vector = new Vector(0, 0);

  private _isUsing: boolean = false;
  public get isUsing(): boolean {
    return this._isUsing;
  }
  /**
   * 用于多重连接
   */
  public connectFromEntities: ConnectableEntity[] = [];
  public connectToEntity: ConnectableEntity | null = null;

  public mousedown: (event: MouseEvent) => void = (event) => {
    if (event.button === 0) {
      // 如果是左键，则检查是否在连接的过程中按下
      if (this.isConnecting()) {
        const pressWorldLocation = Renderer.transformView2World(
          new Vector(event.clientX, event.clientY),
        );
        const clickedConnectableEntity: ConnectableEntity | null =
          StageManager.findConnectableEntityByLocation(pressWorldLocation);
        if (clickedConnectableEntity === null) {
          // 在这里创建一个质点
          const connectPoint = new ConnectPoint({
            uuid: v4(),
            location: [pressWorldLocation.x, pressWorldLocation.y],
          });
          StageManager.addConnectPoint(connectPoint);
          for (const fromEntity of this.connectFromEntities) {
            StageManager.connectEntity(fromEntity, connectPoint);
            this.addConnectEffect(fromEntity, connectPoint);
          }
          this.connectFromEntities = [connectPoint];
        }
      }
    }
    if (!(event.button == 2 || event.button == 3)) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );

    this._lastRightMouseClickLocation = pressWorldLocation.clone();

    const clickedConnectableEntity: ConnectableEntity | null =
      StageManager.findConnectableEntityByLocation(pressWorldLocation);

    if (clickedConnectableEntity) {
      // 右键点击了某个节点
      this.connectFromEntities = [];
      for (const node of StageManager.getConnectableEntity()) {
        if (node.isSelected) {
          this.connectFromEntities.push(node);
        }
      }
      if (this.connectFromEntities.includes(clickedConnectableEntity)) {
        // 多重连接
        for (const node of StageManager.getConnectableEntity()) {
          if (node.isSelected) {
            // 特效
            Stage.effectMachine.addEffect(
              new RectangleNoteEffect(
                new ProgressNumber(0, 15),
                node.collisionBox.getRectangle().clone(),
                new Color(0, 255, 0, 1),
              ),
            );
          }
        }
      } else {
        // 不触发多重连接
        this.connectFromEntities = [clickedConnectableEntity];
        // 特效
        Stage.effectMachine.addEffect(
          new RectangleNoteEffect(
            new ProgressNumber(0, 15),
            clickedConnectableEntity.collisionBox.getRectangle().clone(),
            new Color(0, 255, 0, 1),
          ),
        );
      }
      // 播放音效
      SoundService.play.connectLineStart();
      this._isUsing = true;
    }
  };

  public mousemove: (event: MouseEvent) => void = (event) => {
    if (Stage.selectMachine.isUsing || Stage.cuttingMachine.isUsing) {
      return;
    }
    if (!(Controller.isMouseDown[2] || Controller.isMouseDown[3])) {
      return;
    }
    const worldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    // 连接线
    let isFindConnectToNode = false;
    for (const entity of StageManager.getConnectableEntity()) {
      if (entity.collisionBox.isContainsPoint(worldLocation)) {
        // 找到了连接的节点，吸附上去
        this.connectToEntity = entity;
        isFindConnectToNode = true;
        SoundService.play.connectFindTarget();
        break;
      }
    }
    if (!isFindConnectToNode) {
      this.connectToEntity = null;
    }
    // 由于连接线要被渲染器绘制，所以需要更新总控制里的lastMoveLocation
    Controller.lastMoveLocation = worldLocation.clone();
  };

  public mouseup: (event: MouseEvent) => void = (event) => {
    if (!(event.button == 2 || event.button == 3)) {
      return;
    }
    this._isUsing = false;
    // 结束连线
    if (this.isConnecting()) {
      if (this.connectToEntity === null) {
        // 鼠标在空白位置抬起
        const pressLocation = Renderer.transformView2World(
          new Vector(event.clientX, event.clientY),
        );

        // 额外复制一个数组，因为回调函数执行前，这个数组已经被清空了
        const newConnectFromEntities = this.connectFromEntities;

        addTextNodeByLocation(pressLocation, false, (uuid) => {
          const createdNode = StageManager.getTextNodeByUUID(
            uuid,
          ) as ConnectableEntity;
          for (const fromEntity of newConnectFromEntities) {
            const connectResult = StageManager.connectEntity(
              fromEntity,
              createdNode,
            );
            if (connectResult) {
              this.addConnectEffect(fromEntity, createdNode);
            }
          }
        });
      } else {
        // 鼠标在待连接节点上抬起
        let isHaveConnectResult = false; // 在多重链接的情况下，是否有连接成功
        for (const entity of this.connectFromEntities) {
          const connectResult = StageManager.connectEntity(
            entity,
            this.connectToEntity,
          );
          if (connectResult) {
            // 连接成功，特效
            isHaveConnectResult = true;
            this.addConnectEffect(entity, this.connectToEntity);
          } else {
            console.warn("连接失败！", entity, this.connectToEntity);
          }
        }
        if (isHaveConnectResult) {
          // 给连向的那个节点加特效
          Stage.effectMachine.addEffect(
            new CircleFlameEffect(
              new ProgressNumber(0, 15),
              this.connectToEntity.collisionBox.getRectangle().center,
              80,
              new Color(0, 255, 0, 1),
            ),
          );
        }
      }
    }

    // 这个可能歪打误撞地被用户触发
    // issue #135
    // 一种更快捷的连接方法: 节点在选中状态下右键其它节点直接连接，不必拖动
    const releaseWorldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    if (
      releaseWorldLocation.x === this._lastRightMouseClickLocation.x &&
      releaseWorldLocation.y === this._lastRightMouseClickLocation.y
    ) {
      // 右键点击位置和抬起位置重叠，说明是右键单击事件，没有发生拖拽现象
      const releaseTargetEntity =
        StageManager.findConnectableEntityByLocation(releaseWorldLocation);
      if (releaseTargetEntity) {
        const selectedEntities = StageManager.getConnectableEntity().filter(
          (entity) => entity.isSelected,
        );
        // 还要保证当前舞台有节点被选中
        if (selectedEntities.length > 0) {
          for (const selectedEntity of selectedEntities) {
            const connectResult = StageManager.connectEntity(
              selectedEntity,
              releaseTargetEntity,
            );
            if (connectResult) {
              // 连接成功，特效
              this.addConnectEffect(selectedEntity, releaseTargetEntity);
            } else {
              console.warn("连接失败！", selectedEntity, releaseTargetEntity);
            }
          }
        }
      }
    }

    // 重置状态
    this.connectFromEntities = [];
    this.connectToEntity = null;
  };

  private isConnecting() {
    return this.connectFromEntities.length > 0;
  }

  private addConnectEffect(from: ConnectableEntity, to: ConnectableEntity) {
    for (const effect of EdgeRenderer.getConnectedEffects(from, to)) {
      Stage.effectMachine.addEffect(effect);
    }
  }

  public mainTick() {
    // 产生连接线端点的粒子特效
    if (this.connectFromEntities.length > 0 && Controller.lastMoveLocation) {
      let connectTargetNode = null;
      for (const node of StageManager.getConnectableEntity()) {
        if (node.collisionBox.isContainsPoint(Controller.lastMoveLocation)) {
          connectTargetNode = node;
          break;
        }
      }
      if (connectTargetNode === null) {
        // 如果鼠标位置没有和任何节点相交
        Stage.effectMachine.addEffect(
          PointDashEffect.fromMouseEffect(
            Controller.lastMoveLocation,
            this.connectFromEntities.length * 5,
          ),
        );
      }
    }
  }
}

/**
 * 右键连线功能 的控制器
 * 有两节点连线，还可以触发多重连接
 */
export const ControllerNodeConnection = new ControllerNodeConnectionClass();
