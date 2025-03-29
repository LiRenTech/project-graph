import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { ControllerClass } from "../ControllerClass";

class ControllerEntityResizeClass extends ControllerClass {
  private changeSizeEntity: Entity | null = null;
  public mousedown: (event: MouseEvent) => void = (event) => {
    if (!(event.button == 0)) {
      return;
    }
    // 检查是否有选中的物体
    const selectedEntities = StageManager.getSelectedEntities();
    if (selectedEntities.length === 0) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    this.lastMoveLocation = pressWorldLocation.clone();
    for (const selectedEntity of selectedEntities) {
      if (selectedEntity instanceof TextNode) {
        if (selectedEntity.text.length <= TextNode.enableResizeCharCount) {
          continue;
        }
        const resizeRect = selectedEntity.getResizeHandleRect();
        if (resizeRect.isPointIn(pressWorldLocation)) {
          // 点中了扩大缩小的东西
          this.changeSizeEntity = selectedEntity;
          break;
        }
      }
    }
  };

  public mousemove: (event: MouseEvent) => void = (event) => {
    if (this.changeSizeEntity === null) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const diff = pressWorldLocation.subtract(this.lastMoveLocation);
    if (this.changeSizeEntity instanceof TextNode) {
      this.changeSizeEntity.resizeHandle(diff);
    }
    this.lastMoveLocation = pressWorldLocation.clone();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public mouseup: (event: MouseEvent) => void = (_event) => {
    if (this.changeSizeEntity === null) {
      return;
    }
    // if (this.changeSizeEntity instanceof TextNode) {
    //   Stage.effectMachine.addEffect(new EntityDashTipEffect(50, this.changeSizeEntity.getResizeHandleRect()));
    // }
    this.changeSizeEntity = null;
    // const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  };
}

export const ControllerEntityResize = new ControllerEntityResizeClass();
