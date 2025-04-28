import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { SvgNode } from "../../../../stage/stageObject/entity/SvgNode";
import { SvgRenderer } from "../../basicRenderer/svgRenderer";
import { TextRenderer } from "../../basicRenderer/textRenderer";
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
    if (svgNode.state === "loading") {
      // 正在加载
      TextRenderer.renderTextFromCenter(
        "Loading...",
        svgNode.collisionBox.getRectangle().center,
        16 * Camera.currentScale,
        StageStyleManager.currentStyle.CollideBoxPreSelected,
      );
    } else if (svgNode.state === "loaded") {
      SvgRenderer.renderSvgFromLeftTopWithoutSize(
        svgNode.content,
        Renderer.transformWorld2View(svgNode.location),
        svgNode.scaleNumber,
      );
    } else if (svgNode.state === "error") {
      TextRenderer.renderTextFromCenter(
        "Error",
        svgNode.collisionBox.getRectangle().center,
        16 * Camera.currentScale,
        StageStyleManager.currentStyle.effects.warningShadow,
      );
    }

    EntityRenderer.renderEntityDetails(svgNode);
  }
}
