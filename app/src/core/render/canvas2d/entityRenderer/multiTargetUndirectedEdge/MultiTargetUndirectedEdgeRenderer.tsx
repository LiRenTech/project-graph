import { ConvexHull } from "../../../../algorithm/geometry/convexHull";
import { Color } from "../../../../dataStruct/Color";
import { Line } from "../../../../dataStruct/shape/Line";
import { Vector } from "../../../../dataStruct/Vector";
import { Project, service } from "../../../../Project";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { MultiTargetUndirectedEdge } from "../../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { Renderer } from "../../renderer";

@service("multiTargetUndirectedEdgeRenderer")
export class MultiTargetUndirectedEdgeRenderer {
  constructor(private readonly project: Project) {}

  render(edge: MultiTargetUndirectedEdge) {
    if (edge.isSelected) {
      this.project.collisionBoxRenderer.render(edge.collisionBox, StageStyleManager.currentStyle.CollideBoxSelected);
    }
    const targetNodes = this.project.stageManager.getEntitiesByUUIDs(edge.targetUUIDs);
    if (targetNodes.length < 2) {
      // 特殊情况，出问题了属于是
      if (targetNodes.length === 1) {
        // 画一个圆环
        const node = targetNodes[0];
        const center = node.collisionBox.getRectangle().center;
        this.project.shapeRenderer.renderCircle(
          this.project.renderer.transformWorld2View(center),
          100 * this.project.camera.currentScale,
          Color.Transparent,
          StageStyleManager.currentStyle.StageObjectBorder,
          2 * this.project.camera.currentScale,
        );
      }
      if (targetNodes.length === 0) {
        // 在0 0 位置画圆
        this.project.shapeRenderer.renderCircle(
          this.project.renderer.transformWorld2View(Vector.getZero()),
          100 * this.project.camera.currentScale,
          Color.Transparent,
          StageStyleManager.currentStyle.StageObjectBorder,
          2 * this.project.camera.currentScale,
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
      this.project.textRenderer.renderMultiLineTextFromCenter(
        edge.text,
        this.project.renderer.transformWorld2View(centerLocation),
        Renderer.FONT_SIZE * this.project.camera.currentScale,
        Infinity,
        edgeColor,
      );
    }
    if (edge.renderType === "line") {
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
        this.project.curveRenderer.renderSolidLine(
          this.project.renderer.transformWorld2View(targetPoint),
          this.project.renderer.transformWorld2View(toCenterPoint),
          edgeColor,
          2 * this.project.camera.currentScale,
        );
        // 画箭头
        if (edge.arrow === "inner") {
          //
          this.project.edgeRenderer.renderArrowHead(
            // Renderer.transformWorld2View(toCenterPoint),
            toCenterPoint,
            toCenterPoint.subtract(targetPoint).normalize(),
            15,
            edgeColor,
          );
        } else if (edge.arrow === "outer") {
          //
          this.project.edgeRenderer.renderArrowHead(
            // Renderer.transformWorld2View(targetPoint),
            targetPoint,
            targetPoint.subtract(toCenterPoint).normalize(),
            15,
            edgeColor,
          );
        }
      }
    } else if (edge.renderType === "convex") {
      // 凸包渲染
      let convexPoints: Vector[] = [];
      targetNodes.map((node) => {
        const nodeRectangle = node.collisionBox.getRectangle().expandFromCenter(edge.padding);
        convexPoints.push(nodeRectangle.leftTop);
        convexPoints.push(nodeRectangle.rightTop);
        convexPoints.push(nodeRectangle.rightBottom);
        convexPoints.push(nodeRectangle.leftBottom);
      });
      if (edge.text !== "") {
        const textRectangle = edge.textRectangle.expandFromCenter(edge.padding);
        convexPoints.push(textRectangle.leftTop);
        convexPoints.push(textRectangle.rightTop);
        convexPoints.push(textRectangle.rightBottom);
        convexPoints.push(textRectangle.leftBottom);
      }
      convexPoints = ConvexHull.computeConvexHull(convexPoints);
      // 保证首尾相接
      convexPoints.push(convexPoints[0]);
      this.project.curveRenderer.renderSolidLineMultiple(
        convexPoints.map((point) => this.project.renderer.transformWorld2View(point)),
        edgeColor.toNewAlpha(0.5),
        8 * this.project.camera.currentScale,
      );
    }
  }
}
