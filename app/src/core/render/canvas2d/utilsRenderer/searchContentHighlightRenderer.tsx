import { Color } from "../../../dataStruct/Color";
import { Project, service } from "../../../Project";
import { StageStyleManager } from "../../../service/feedbackService/stageStyle/StageStyleManager";
import { Stage } from "../../../stage/Stage";

/**
 * 高亮渲染所有搜索结果
 */
@service("searchContentHighlightRenderer")
export class SearchContentHighlightRenderer {
  constructor(private readonly project: Project) {}

  render(frameTickIndex: number) {
    //
    for (const stageObject of Stage.contentSearchEngine.searchResultNodes) {
      const rect = stageObject.collisionBox.getRectangle().expandFromCenter(10);
      this.project.shapeRenderer.renderRect(
        this.project.renderer.transformWorld2View(rect),
        Color.Transparent,
        StageStyleManager.currentStyle.effects.warningShadow.toNewAlpha(Math.sin(frameTickIndex * 0.25) * 0.25 + 0.5),
        4,
      );
    }
  }
}
