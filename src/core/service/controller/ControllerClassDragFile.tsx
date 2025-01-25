import { Vector } from "../../dataStruct/Vector";

/**
 * 专门用来处理文件拖拽的类
 */
export class ControllerClassDragFile {
  constructor() {}
  /**
   * 当前是否是拖拽文件入窗口的状态
   */
  isDraggingFile = false;
  /**
   * 当前鼠标所在的世界坐标
   */
  draggingLocation = Vector.getZero();

  public lastMoveLocation: Vector = Vector.getZero();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public dragEnter = (_: DragEvent) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public dragOver = (_: DragEvent) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public dragLeave = (_: DragEvent) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public drop = (_: DragEvent) => {};

  public init() {
    window.addEventListener("dragenter", this.dragEnter, false);
    window.addEventListener("dragover", this.dragOver, false);
    window.addEventListener("dragleave", this.dragLeave, false);
    window.addEventListener("drop", this.drop, false);
  }
  public destroy() {
    window.removeEventListener("dragenter", this.dragEnter);
    window.removeEventListener("dragover", this.dragOver);
    window.removeEventListener("dragleave", this.dragLeave);
    window.removeEventListener("drop", this.drop);

    this.lastMoveLocation = Vector.getZero();
  }
}
