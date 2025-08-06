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
    this.project.imageRenderer.renderImageElement(
      svgNode.image,
      this.project.renderer.transformWorld2View(svgNode.collisionBox.getRectangle().location),
      svgNode.scale,
    );

    this.project.entityRenderer.renderEntityDetails(svgNode);
  }
}
