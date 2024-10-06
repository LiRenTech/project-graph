import { ControllerClassDragFile } from "../ControllerClassDragFile";

/**
 * BUG: 始终无法触发文件拖入事件
 */
export const ControllerDragFile = new ControllerClassDragFile();



/**
 * 
 * @param event 
 */

ControllerDragFile.dragEnter = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  console.log(event);
  // 获取鼠标位置
  const x = event.clientX;
  const y = event.clientY;
  console.log("dragEnter", x, y);
};

ControllerDragFile.dragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  console.log(event);
};

ControllerDragFile.drop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const files = event.dataTransfer?.files;
  console.log(files);
  console.log(event);
};

ControllerDragFile.dragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};
