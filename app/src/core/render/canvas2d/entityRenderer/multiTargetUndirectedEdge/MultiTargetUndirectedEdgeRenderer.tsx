import { Color } from "../../../../dataStruct/Color";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { MultiTargetUndirectedEdge } from "../../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { CurveRenderer } from "../../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";

export namespace MultiTargetUndirectedEdgeRenderer {
  export function render(edge: MultiTargetUndirectedEdge) {
    //
    if (edge.isSelected) {
      //
    }
    const nodes = StageManager.getEntitiesByUUIDs(edge.targetUUIDs);
    if (nodes.length < 2) {
      // 特殊情况，出问题了属于是
      if (nodes.length === 1) {
        // 画一个圆环
        const node = nodes[0];
        const center = node.collisionBox.getRectangle().center;
        ShapeRenderer.renderCircle(
          center,
          100 * Camera.currentScale,
          Color.Transparent,
          StageStyleManager.currentStyle.StageObjectBorder,
          2 * Camera.currentScale,
        );
      }
      if (nodes.length === 0) {
        // 在0 0 位置画圆
        ShapeRenderer.renderCircle(
          Vector.getZero(),
          100 * Camera.currentScale,
          Color.Transparent,
          StageStyleManager.currentStyle.StageObjectBorder,
          2 * Camera.currentScale,
        );
      }
      return;
    }
    const boundingRectangle = Rectangle.getBoundingRectangle(nodes.map((n) => n.collisionBox.getRectangle()));
    const center = boundingRectangle.center;

    for (const node of nodes) {
      CurveRenderer.renderSolidLine(
        center,
        node.collisionBox.getRectangle().center,
        StageStyleManager.currentStyle.StageObjectBorder,
        2 * Camera.currentScale,
      );
    }
  }
}
