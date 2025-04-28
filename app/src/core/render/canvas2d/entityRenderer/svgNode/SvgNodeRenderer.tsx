import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { SvgNode } from "../../../../stage/stageObject/entity/SvgNode";
import { SvgRenderer } from "../../basicRenderer/svgRenderer";
import { Renderer } from "../../renderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { EntityRenderer } from "../EntityRenderer";

/**
 * 渲染SVG节点
 */
export namespace SvgNodeRenderer {
  // 渲染SVG节点
  export function render(svgNode: SvgNode) {
    if (svgNode.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(svgNode.collisionBox, StageStyleManager.currentStyle.CollideBoxSelected);
    }
    SvgRenderer.renderSvgFromLeftTopWithoutSize(
      svgNode.content,
      Renderer.transformWorld2View(svgNode.location),
      svgNode.scaleNumber,
    );
    EntityRenderer.renderEntityDetails(svgNode);
  }
}
