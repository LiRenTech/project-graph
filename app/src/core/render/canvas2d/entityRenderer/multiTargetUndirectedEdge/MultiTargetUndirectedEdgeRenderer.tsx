import { ConvexHull } from "../../../../algorithm/geometry/convexHull";
import { Color } from "../../../../dataStruct/Color";
import { Line } from "../../../../dataStruct/shape/Line";
import { Vector } from "../../../../dataStruct/Vector";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { MultiTargetUndirectedEdge } from "../../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { CurveRenderer } from "../../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../basicRenderer/textRenderer";
import { Renderer } from "../../renderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { EdgeRenderer } from "../edge/EdgeRenderer";

export namespace MultiTargetUndirectedEdgeRenderer {
  export function render(edge: MultiTargetUndirectedEdge) {
    if (edge.isSelected) {
      CollisionBoxRenderer.render(edge.collisionBox, StageStyleManager.currentStyle.CollideBoxSelected);
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
    // 正常情况, target >= 2
    const centerLocation = edge.centerLocation;
    const edgeColor = edge.color.equals(Color.Transparent)
      ? StageStyleManager.currentStyle.StageObjectBorder
      : edge.color;
    // 画文字
    if (edge.text !== "") {
      // 画文字
      TextRenderer.renderMultiLineTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(centerLocation),
        Renderer.FONT_SIZE * Camera.currentScale,
        Infinity,
        edgeColor,
      );
    }

    // 画每一条线
    for (let i = 0; i < targetNodes.length; i++) {
      const node = targetNodes[i];
      const nodeRectangle = node.collisionBox.getRectangle();
      const targetLocation = nodeRectangle.getInnerLocationByRateVector(edge.rectRates[i]);
      const line = new Line(centerLocation, targetLocation);
      const targetPoint = nodeRectangle.getLineIntersectionPoint(line);
      let toCenterPoint = centerLocation;
      if (edge.text !== "") {
        const textRectangle = edge.textRectangle;
        toCenterPoint = textRectangle.getLineIntersectionPoint(new Line(centerLocation, targetLocation));
      }
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(targetPoint),
        Renderer.transformWorld2View(toCenterPoint),
        edgeColor,
        2 * Camera.currentScale,
      );
      // 画箭头
      if (edge.arrow === "inner") {
        //
        EdgeRenderer.renderArrowHead(
          // Renderer.transformWorld2View(toCenterPoint),
          toCenterPoint,
          toCenterPoint.subtract(targetPoint).normalize(),
          15,
          edgeColor,
        );
      } else if (edge.arrow === "outer") {
        //
        EdgeRenderer.renderArrowHead(
          // Renderer.transformWorld2View(targetPoint),
          targetPoint,
          targetPoint.subtract(toCenterPoint).normalize(),
          15,
          edgeColor,
        );
      }
    }
    // 凸包渲染
    let convexPoints: Vector[] = [];
    targetNodes.map((node) => {
      const nodeRectangle = node.collisionBox.getRectangle().expandFromCenter(20);
      convexPoints.push(nodeRectangle.leftTop);
      convexPoints.push(nodeRectangle.rightTop);
      convexPoints.push(nodeRectangle.rightBottom);
      convexPoints.push(nodeRectangle.leftBottom);
    });
    if (edge.text !== "") {
      const textRectangle = edge.textRectangle.expandFromCenter(20);
      convexPoints.push(textRectangle.leftTop);
      convexPoints.push(textRectangle.rightTop);
      convexPoints.push(textRectangle.rightBottom);
      convexPoints.push(textRectangle.leftBottom);
    }
    convexPoints = ConvexHull.computeConvexHull(convexPoints);
    // 保证首尾相接
    convexPoints.push(convexPoints[0]);
    CurveRenderer.renderSolidLineMultiple(
      convexPoints.map((point) => Renderer.transformWorld2View(point)),
      edgeColor,
      2 * Camera.currentScale,
    );
  }
}
