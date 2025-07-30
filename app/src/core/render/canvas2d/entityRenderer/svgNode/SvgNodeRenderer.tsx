import { Project, service } from "@/core/Project";
import { SvgNode } from "@/core/stage/stageObject/entity/SvgNode";

/**
 * 渲染SVG节点
 */
@service("svgNodeRenderer")
export class SvgNodeRenderer {
  constructor(private readonly project: Project) {}

  // 渲染SVG节点
  render(svgNode: SvgNode) {
    if (svgNode.isSelected) {
      // 在外面增加一个框
      this.project.collisionBoxRenderer.render(
        svgNode.collisionBox,
        this.project.stageStyleManager.currentStyle.CollideBoxSelected,
      );
    }
    if (svgNode.state === "loading") {
      // 正在加载
      this.project.textRenderer.renderTextFromCenter(
        "Loading...",
        svgNode.collisionBox.getRectangle().center,
        16 * this.project.camera.currentScale,
        this.project.stageStyleManager.currentStyle.CollideBoxPreSelected,
      );
    } else if (svgNode.state === "loaded") {
      this.project.svgRenderer.renderSvgFromLeftTopWithoutSize(
        svgNode.content,
        this.project.renderer.transformWorld2View(svgNode.location),
        svgNode.scaleNumber,
      );
    } else if (svgNode.state === "error") {
      this.project.textRenderer.renderTextFromCenter(
        "Error",
        svgNode.collisionBox.getRectangle().center,
        16 * this.project.camera.currentScale,
        this.project.stageStyleManager.currentStyle.effects.warningShadow,
      );
    }

    this.project.entityRenderer.renderEntityDetails(svgNode);
  }
}
