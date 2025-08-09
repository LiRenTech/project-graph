import { Vector } from "@graphif/data-structures";
import { ControllerClass } from "../ControllerClass";

export class ControllerContextMenuClass extends ControllerClass {
  /** view */
  private mouseDownLocation: Vector = new Vector(0, 0);

  public mousedown = (event: MouseEvent) => {
    if (event.button !== 2) {
      return; // Only handle right-clicks
    }

    this.mouseDownLocation = new Vector(event.clientX, event.clientY);
  };
  public mouseup = (event: MouseEvent) => {
    if (event.button !== 2) {
      return; // Only handle right-clicks
    }

    const mouseUpLocation = new Vector(event.clientX, event.clientY);
    const distance = this.mouseDownLocation.distance(mouseUpLocation);

    if (distance < 5) {
      this.project.emit("contextmenu", mouseUpLocation);
    }
  };
}
