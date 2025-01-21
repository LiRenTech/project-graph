import { v4 } from "uuid";
import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stageObject/StageObject";
import { ConnectPoint } from "../../../stageObject/entity/ConnectPoint";
import { SoundService } from "../../SoundService";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { RectangleNoteEffect } from "../../effect/concrete/RectangleNoteEffect";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 右键连线功能 的控制器
 * 有两节点连线，还可以触发多重连接
 */
export const ControllerNodeConnection = new ControllerClass();

/**
 * 仅限在当前文件中使用的记录
 * 右键点击的位置，仅用于连接检测按下位置和抬起位置是否重叠
 */
let _lastRightMouseClickLocation: Vector = new Vector(0, 0);

function isConnecting() {
  return Stage.connectFromEntities.length > 0;
}

function addConnectEffect(from: ConnectableEntity, to: ConnectableEntity) {
  for (const effect of EdgeRenderer.getConnectedEffects(from, to)) {
    Stage.effects.push(effect);
  }
}
/**
 *
 * @param event
 * @returns
 */
ControllerNodeConnection.mousedown = (event: MouseEvent) => {
  if (event.button === 0) {
    // 如果是左键，则检查是否在连接的过程中按下
    if (isConnecting()) {
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
        for (const fromEntity of Stage.connectFromEntities) {
          StageManager.connectEntity(fromEntity, connectPoint);
          addConnectEffect(fromEntity, connectPoint);
        }
        Stage.connectFromEntities = [connectPoint];
      }
    }
  }
  if (!(event.button == 2 || event.button == 3)) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );

  _lastRightMouseClickLocation = pressWorldLocation.clone();

  const clickedConnectableEntity: ConnectableEntity | null =
    StageManager.findConnectableEntityByLocation(pressWorldLocation);

  if (clickedConnectableEntity) {
    // 右键点击了某个节点
    Stage.connectFromEntities = [];
    for (const node of StageManager.getConnectableEntity()) {
      if (node.isSelected) {
        Stage.connectFromEntities.push(node);
      }
    }
    if (Stage.connectFromEntities.includes(clickedConnectableEntity)) {
      // 多重连接
      for (const node of StageManager.getConnectableEntity()) {
        if (node.isSelected) {
          // 特效
          Stage.effects.push(
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
      Stage.connectFromEntities = [clickedConnectableEntity];
      // 特效
      Stage.effects.push(
        new RectangleNoteEffect(
          new ProgressNumber(0, 15),
          clickedConnectableEntity.collisionBox.getRectangle().clone(),
          new Color(0, 255, 0, 1),
        ),
      );
    }
    // 播放音效
    SoundService.play.connectLineStart();
    Stage.isConnecting = true;
  }
};

ControllerNodeConnection.mousemove = (event: MouseEvent) => {
  if (Stage.isSelecting || Stage.isCutting) {
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
      Stage.connectToEntity = entity;
      isFindConnectToNode = true;
      SoundService.play.connectFindTarget();
      break;
    }
  }
  if (!isFindConnectToNode) {
    Stage.connectToEntity = null;
  }
  // 由于连接线要被渲染器绘制，所以需要更新总控制里的lastMoveLocation
  Controller.lastMoveLocation = worldLocation.clone();
};

ControllerNodeConnection.mouseup = (event: MouseEvent) => {
  if (!(event.button == 2 || event.button == 3)) {
    return;
  }
  Stage.isConnecting = false;
  // 结束连线
  if (isConnecting() && Stage.connectToEntity !== null) {
    let isHaveConnectResult = false; // 在多重链接的情况下，是否有连接成功
    for (const entity of Stage.connectFromEntities) {
      const connectResult = StageManager.connectEntity(
        entity,
        Stage.connectToEntity,
      );
      if (connectResult) {
        // 连接成功，特效
        isHaveConnectResult = true;
        addConnectEffect(entity, Stage.connectToEntity);
      } else {
        console.warn("连接失败！", entity, Stage.connectToEntity);
      }
    }
    if (isHaveConnectResult) {
      // 给连向的那个节点加特效
      Stage.effects.push(
        new CircleFlameEffect(
          new ProgressNumber(0, 15),
          Stage.connectToEntity.collisionBox.getRectangle().center,
          80,
          new Color(0, 255, 0, 1),
        ),
      );
    }
  }

  // issue #135
  // 一种更快捷的连接方法: 节点在选中状态下右键其它节点直接连接，不必拖动
  const releaseWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  if (
    releaseWorldLocation.x === _lastRightMouseClickLocation.x &&
    releaseWorldLocation.y === _lastRightMouseClickLocation.y
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
            addConnectEffect(selectedEntity, releaseTargetEntity);
          } else {
            console.warn("连接失败！", selectedEntity, releaseTargetEntity);
          }
        }
      }
    }
  }

  // 重置状态
  Stage.connectFromEntities = [];
  Stage.connectToEntity = null;
};
