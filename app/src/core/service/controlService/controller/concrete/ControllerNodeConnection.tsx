import { v4 } from "uuid";
import { CursorNameEnum } from "../../../../../types/cursors";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../../stage/stageObject/abstract/ConnectableEntity";
import { ConnectPoint } from "../../../../stage/stageObject/entity/ConnectPoint";
import { RectangleNoteEffect } from "../../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { SoundService } from "../../../feedbackService/SoundService";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { addTextNodeByLocation } from "./utilsControl";
import { StageStyleManager } from "../../../feedbackService/stageStyle/StageStyleManager";

/**
 * 连线控制器
 * 目前的连接方式：
 * 拖连（可多重）、
 * 左右键点连：右键有点问题
 * 折连、
 * 拖拽再生连（可多重）、
 */
class ControllerNodeConnectionClass extends ControllerClass {
  /**
   * 仅限在当前文件中使用的记录
   * 右键点击的位置，仅用于连接检测按下位置和抬起位置是否重叠
   */
  private _lastRightMousePressLocation: Vector = new Vector(0, 0);

  private _isUsing: boolean = false;
  public get isUsing(): boolean {
    return this._isUsing;
  }
  /**
   * 用于多重连接
   */
  public connectFromEntities: ConnectableEntity[] = [];
  public connectToEntity: ConnectableEntity | null = null;

  /**
   * 拖拽时左键生成质点
   * @param pressWorldLocation
   */
  private onLeftMouseDown(pressWorldLocation: Vector) {
    // 如果是左键，则检查是否在连接的过程中按下
    if (this.isConnecting()) {
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
        // 选中这个质点
        for (const entity of StageManager.getConnectableEntity()) {
          if (entity.isSelected) {
            entity.isSelected = false;
          }
        }
        connectPoint.isSelected = true;
      }
    }
  }

  public mousedown: (event: MouseEvent) => void = (event) => {
    if (!(event.button == 2 || event.button == 0)) {
      return;
    }
    if (event.button === 0 && Stage.leftMouseMode === LeftMouseModeEnum.connectAndCut) {
      this.onMouseDown(event);
    }
    if (event.button === 2) {
      this.onMouseDown(event);
    }
  };

  private onMouseDown(event: MouseEvent) {
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));

    if (event.button === 0 && Stage.leftMouseMode !== LeftMouseModeEnum.connectAndCut) {
      // 在非左键模式下点击左键
      this.onLeftMouseDown(pressWorldLocation);
    }

    this._lastRightMousePressLocation = pressWorldLocation.clone();

    const clickedConnectableEntity: ConnectableEntity | null =
      StageManager.findConnectableEntityByLocation(pressWorldLocation);
    if (clickedConnectableEntity === null) {
      return;
    }

    // 右键点击了某个节点
    this.connectFromEntities = [];
    for (const node of StageManager.getConnectableEntity()) {
      if (node.isSelected) {
        this.connectFromEntities.push(node);
      }
    }
    /**
     * 有两种情况：
     * 1. 从框选的节点开始右键拖拽连线，此时需要触发多重连接
     * 2. 从没有框选的节点开始右键拖拽连线，此时不需要触发多重连接
     * ┌───┐┌───┐       ┌───┐┌───┐
     * │┌─┐││┌─┐│ ┌─┐   │┌─┐││┌─┐│ ┌─┐
     * │└─┘││└─┘│ └─┘   │└─┘││└─┘│ └┬┘
     * └─┬─┘└───┘       └───┘└───┘  │
     *   │                          │
     *   │                          │
     *   └──►┌─┐              ┌─┐◄──┘
     *       └─┘              └─┘
     * 右边的方法还是有用的，减少了一步提前框选的操作。
     */
    if (this.connectFromEntities.includes(clickedConnectableEntity)) {
      // 多重连接
      for (const node of StageManager.getConnectableEntity()) {
        if (node.isSelected) {
          // 特效
          Stage.effectMachine.addEffect(
            new RectangleNoteEffect(
              new ProgressNumber(0, 15),
              node.collisionBox.getRectangle().clone(),
              StageStyleManager.currentStyle.effects.successShadow.clone(),
            ),
          );
        }
      }
    } else {
      // 不触发多重连接
      // 只触发一次连接
      this.connectFromEntities = [clickedConnectableEntity];
      // 特效
      Stage.effectMachine.addEffect(
        new RectangleNoteEffect(
          new ProgressNumber(0, 15),
          clickedConnectableEntity.collisionBox.getRectangle().clone(),
          StageStyleManager.currentStyle.effects.successShadow.clone(),
        ),
      );
    }
    // 播放音效
    SoundService.play.connectLineStart();
    this._isUsing = true;
    Controller.setCursorNameHook(CursorNameEnum.Crosshair);
  }

  /**
   * 在mousemove的过程中，是否鼠标悬浮在了目标节点上
   */
  private isMouseHoverOnTarget = false;

  public mousemove: (event: MouseEvent) => void = (event) => {
    if (Stage.selectMachine.isUsing || Stage.cuttingMachine.isUsing) {
      return;
    }
    if (!this._isUsing) {
      return;
    }
    if (Controller.isMouseDown[0] && Stage.leftMouseMode === LeftMouseModeEnum.connectAndCut) {
      this.mouseMove(event);
    }
    if (Controller.isMouseDown[2]) {
      this.mouseMove(event);
    }
  };

  private mouseMove(event: MouseEvent) {
    const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    // 连接线
    let isFindConnectToNode = false;
    for (const entity of StageManager.getConnectableEntity()) {
      if (entity.collisionBox.isContainsPoint(worldLocation)) {
        // 找到了连接的节点，吸附上去
        this.connectToEntity = entity;
        isFindConnectToNode = true;
        if (!this.isMouseHoverOnTarget) {
          SoundService.play.connectFindTarget();
        }
        this.isMouseHoverOnTarget = true;
        break;
      }
    }
    if (!isFindConnectToNode) {
      this.connectToEntity = null;
      this.isMouseHoverOnTarget = false;
    }
    // 由于连接线要被渲染器绘制，所以需要更新总控制里的lastMoveLocation
    Controller.lastMoveLocation = worldLocation.clone();
  }

  public mouseup: (event: MouseEvent) => void = (event) => {
    if (!(event.button == 2 || event.button == 0)) {
      return;
    }
    if (!this.isConnecting()) {
      return;
    }
    if (event.button === 0 && Stage.leftMouseMode === LeftMouseModeEnum.connectAndCut) {
      this.mouseUp(event);
    } else if (event.button === 2) {
      this.mouseUp(event);
    }
  };

  private mouseUp(event: MouseEvent) {
    const releaseWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const releaseTargetEntity = StageManager.findConnectableEntityByLocation(releaseWorldLocation);
    // 结束连线
    if (releaseTargetEntity !== null) {
      // 在目标节点上弹起

      // 区分是拖拽松开连线还是点击松开连线
      if (releaseWorldLocation.distance(this._lastRightMousePressLocation) < 5) {
        // 距离过近，说明是点击事件，而不是拖拽事件
        // 这个可能歪打误撞地被用户触发
        this.clickMultiConnect(releaseWorldLocation);
      } else {
        // 鼠标在待连接节点上抬起
        if (this.connectToEntity) {
          this.multiConnect(this.connectToEntity);
        }
      }
    } else {
      // 鼠标在空白位置抬起
      // 额外复制一个数组，因为回调函数执行前，这个数组已经被清空了
      const newConnectFromEntities = this.connectFromEntities;

      addTextNodeByLocation(releaseWorldLocation, true, (uuid) => {
        const createdNode = StageManager.getTextNodeByUUID(uuid) as ConnectableEntity;
        for (const fromEntity of newConnectFromEntities) {
          const connectResult = StageManager.connectEntity(fromEntity, createdNode);
          if (connectResult) {
            this.addConnectEffect(fromEntity, createdNode);
          }
        }
      });
    }
    this.clear();
    Controller.setCursorNameHook(CursorNameEnum.Default);
  }

  /**
   * 一种更快捷的连接方法: 节点在选中状态下右键其它节点直接连接，不必拖动
   * issue #135
   * @param releaseWorldLocation
   */
  private clickMultiConnect(releaseWorldLocation: Vector) {
    // 右键点击位置和抬起位置重叠，说明是右键单击事件，没有发生拖拽现象
    const releaseTargetEntity = StageManager.findConnectableEntityByLocation(releaseWorldLocation);
    if (!releaseTargetEntity) {
      return;
    }
    const selectedEntities = StageManager.getConnectableEntity().filter((entity) => entity.isSelected);
    // 还要保证当前舞台有节点被选中
    for (const selectedEntity of selectedEntities) {
      const connectResult = StageManager.connectEntity(selectedEntity, releaseTargetEntity);
      if (connectResult) {
        // 连接成功，特效
        this.addConnectEffect(selectedEntity, releaseTargetEntity);
      } else {
        console.warn("连接失败！", selectedEntity, releaseTargetEntity);
      }
    }
  }

  private clear() {
    // 重置状态
    this.connectFromEntities = [];
    this.connectToEntity = null;
    this._isUsing = false;
  }

  private multiConnect(connectToEntity: ConnectableEntity) {
    // 鼠标在待连接节点上抬起
    let isHaveConnectResult = false; // 在多重链接的情况下，是否有连接成功

    const isPressC = Controller.pressingKeySet.has("c");

    for (const entity of this.connectFromEntities) {
      const connectResult = StageManager.connectEntity(entity, connectToEntity, isPressC);
      if (connectResult) {
        // 连接成功，特效
        isHaveConnectResult = true;
        this.addConnectEffect(entity, connectToEntity);
      } else {
        console.warn("连接失败！", entity, connectToEntity);
      }
    }
    if (isHaveConnectResult) {
      // 给连向的那个节点加特效
    }
  }

  private isConnecting() {
    return this.connectFromEntities.length > 0 && this._isUsing;
  }

  private addConnectEffect(from: ConnectableEntity, to: ConnectableEntity) {
    for (const effect of EdgeRenderer.getConnectedEffects(from, to)) {
      Stage.effectMachine.addEffect(effect);
    }
  }
}

/**
 * 右键连线功能 的控制器
 * 有两节点连线，还可以触发多重连接
 */
export const ControllerNodeConnection = new ControllerNodeConnectionClass();
