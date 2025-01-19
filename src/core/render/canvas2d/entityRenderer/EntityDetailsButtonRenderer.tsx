import { MouseLocation } from "../../../MouseLocation";
import { NumberFunctions } from "../../../algorithm/numberFunctions";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Entity } from "../../../stageObject/StageObject";
import { StageStyleManager } from "../../../stageStyle/StageStyleManager";
import { RenderUtils } from "../RenderUtils";
import { Renderer } from "../renderer";
/**
 * 仅仅渲染一个节点右上角的按钮
 */
export function EntityDetailsButtonRenderer(entity: Entity) {
  if (!entity.details) {
    return;
  }
  // ShapeRenderer.renderRect(
  //   entity.detailsButtonRectangle().transformWorld2View(),
  //   StageStyleManager.currentStyle.DetailsDebugTextColor,
  //   StageStyleManager.currentStyle.DetailsDebugTextColor,
  //   2 * Camera.currentScale,
  //   Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
  // );
  let isMouseHovering = false;
  // 鼠标悬浮在按钮上提示文字
  if (
    entity
      .detailsButtonRectangle()
      .isPointIn(Renderer.transformView2World(MouseLocation.vector()))
  ) {
    isMouseHovering = true;
    if (!entity.isEditingDetails)
      // 鼠标悬浮在这上面
      RenderUtils.renderText(
        "点击展开或关闭节点注释详情",
        Renderer.transformWorld2View(
          entity.detailsButtonRectangle().topCenter.subtract(new Vector(0, 12)),
        ),
        12 * Camera.currentScale,
        StageStyleManager.currentStyle.DetailsDebugTextColor,
      );
  }
  RenderUtils.renderText(
    entity.isEditingDetails ? "✏️" : "📃",
    Renderer.transformWorld2View(entity.detailsButtonRectangle().leftTop),
    isMouseHovering ? getFontSizeByTime() : 20 * Camera.currentScale,
  );
}

function getFontSizeByTime() {
  const r = NumberFunctions.sinNumberByTime(19, 21, 0.25);
  return r * Camera.currentScale;
}
