import { Color } from "../../../dataStruct/Color";
import { StageStyleManager } from "../../../service/feedbackService/stageStyle/StageStyleManager";
import { Stage } from "../../../stage/Stage";
import { ShapeRenderer } from "../basicRenderer/shapeRenderer";

/**
 * 高亮渲染所有搜索结果
 */
export function searchContentHighlightRenderer(frameTickIndex: number) {
  //
  for (const stageObject of Stage.contentSearchEngine.searchResultNodes) {
    const rect = stageObject.collisionBox.getRectangle().expandFromCenter(10);
    ShapeRenderer.renderRect(
      rect.transformWorld2View(),
      Color.Transparent,
      StageStyleManager.currentStyle.effects.warningShadow.toNewAlpha(Math.sin(frameTickIndex * 0.25) * 0.25 + 0.5),
      4,
    );
  }
}
