import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { PortalNode } from "../../../../stage/stageObject/entity/PortalNode";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../basicRenderer/textRenderer";
import { Renderer } from "../../renderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { EntityRenderer } from "../EntityRenderer";

export namespace PortalNodeRenderer {
  export function render(portalNode: PortalNode) {
    const leftTopLocation = portalNode.location;
    ShapeRenderer.renderRect(
      new Rectangle(leftTopLocation, portalNode.size).transformWorld2View(),
      portalNode.color,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    if (portalNode.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(portalNode.collisionBox, StageStyleManager.currentStyle.CollideBoxSelectedColor);
    }
    EntityRenderer.renderEntityDetails(portalNode);

    // 绘制debug信息
    if (Renderer.isShowDebug) {
      TextRenderer.renderMultiLineText(
        `${portalNode.title}, [${portalNode.portalFilePath}]\n${portalNode.targetLocation.toString()}`,
        Renderer.transformWorld2View(portalNode.location),
        10 * Camera.currentScale,
        1000 * Camera.currentScale,
        StageStyleManager.currentStyle.DetailsDebugTextColor,
      );
    }
  }
}
