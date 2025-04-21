import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { MultiTargetUndirectedEdge } from "../../stageObject/association/MutiTargetUndirectedEdge";
import { StageManager } from "../StageManager";

/**
 * 多源无向边移动中心点
 */
export namespace StageMultiTargetEdgeMove {
  /**
   *
   * @param lastMoveLocation 鼠标按下的位置
   * @param diffLocation 鼠标移动向量
   */
  export function moveMultiTargetEdge(diffLocation: Vector) {
    for (const association of StageManager.getSelectedAssociations()) {
      if (!(association instanceof MultiTargetUndirectedEdge)) {
        continue;
      }
      if (!association.isSelected) {
        continue;
      }
      // const startMouseDragLocation = lastMoveLocation.clone();
      // const endMouseDragLocation = startMouseDragLocation.add(diffLocation);

      const boundingRectangle = Rectangle.getBoundingRectangle(
        StageManager.getEntitiesByUUIDs(association.targetUUIDs).map((n) => n.collisionBox.getRectangle()),
      );
      // 当前的中心点
      const currentCenter = association.centerLocation;
      // 新的中心点
      const newCenter = currentCenter.add(diffLocation);
      // 新的比例
      const newRate = new Vector(
        (newCenter.x - boundingRectangle.location.x) / boundingRectangle.width,
        (newCenter.y - boundingRectangle.location.y) / boundingRectangle.height,
      );
      association.centerRate = newRate;
    }
  }
}
