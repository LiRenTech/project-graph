import { Color } from "../../../../dataStruct/Color";
import { Line } from "../../../../dataStruct/shape/Line";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { MultiTargetUndirectedEdge } from "../../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { CurveRenderer } from "../../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";
import { Renderer } from "../../renderer";

export namespace MultiTargetUndirectedEdgeRenderer {
  export function render(edge: MultiTargetUndirectedEdge) {
    //
    if (edge.isSelected) {
      //
    }
    const targetNodes = StageManager.getEntitiesByUUIDs(edge.targetUUIDs);
    if (targetNodes.length < 2) {
      // 特殊情况，出问题了属于是
      if (targetNodes.length === 1) {
        // 画一个圆环
        const node = targetNodes[0];
        const center = node.collisionBox.getRectangle().center;
        ShapeRenderer.renderCircle(
          Renderer.transformWorld2View(center),
          100 * Camera.currentScale,
          Color.Transparent,
          StageStyleManager.currentStyle.StageObjectBorder,
          2 * Camera.currentScale,
        );
      }
      if (targetNodes.length === 0) {
        // 在0 0 位置画圆
        ShapeRenderer.renderCircle(
          Renderer.transformWorld2View(Vector.getZero()),
          100 * Camera.currentScale,
          Color.Transparent,
          StageStyleManager.currentStyle.StageObjectBorder,
          2 * Camera.currentScale,
        );
      }
      return;
    }
    // 正常情况
    const boundingRectangle = Rectangle.getBoundingRectangle(targetNodes.map((n) => n.collisionBox.getRectangle()));
    const centerLocation = boundingRectangle.center;

    for (let i = 0; i < targetNodes.length; i++) {
      const node = targetNodes[i];
      const nodeRectangle = node.collisionBox.getRectangle();
      const targetLocation = nodeRectangle.getInnerLocationByRateVector(edge.rectRates[i]);
      const line = new Line(centerLocation, targetLocation);
      const targetPoint = nodeRectangle.getLineIntersectionPoint(line);

      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(centerLocation),
        Renderer.transformWorld2View(targetPoint),
        edge.color.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : edge.color,
        2 * Camera.currentScale,
      );
    }
  }
}
