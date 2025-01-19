import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { MouseLocation } from "../../../../MouseLocation";
import { Camera } from "../../../../stage/Camera";
import { UrlNode } from "../../../../stageObject/entity/UrlNode";
import { StageStyleManager } from "../../../../stageStyle/StageStyleManager";
import { CurveRenderer } from "../../curveRenderer";
import { Renderer } from "../../renderer";
import { ShapeRenderer } from "../../shapeRenderer";
import { TextRenderer } from "../../textRenderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { EntityRenderer } from "../EntityRenderer";

export namespace UrlNodeRenderer {
  export function render(urlNode: UrlNode): void {
    if (urlNode.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(
        urlNode.collisionBox,
        StageStyleManager.currentStyle.CollideBoxSelectedColor,
      );
    }
    // 节点身体矩形
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(urlNode.rectangle.location),
        urlNode.rectangle.size.multiply(Camera.currentScale),
      ),
      urlNode.color,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    // 绘制标题
    if (!urlNode.isEditingTitle) {
      TextRenderer.renderText(
        urlNode.title,
        Renderer.transformWorld2View(
          urlNode.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)),
        ),
        Renderer.FONT_SIZE * Camera.currentScale,
        StageStyleManager.currentStyle.StageObjectBorderColor,
      );
    }
    // 绘制分界线
    CurveRenderer.renderDashedLine(
      Renderer.transformWorld2View(
        urlNode.rectangle.location.add(new Vector(0, UrlNode.titleHeight)),
      ),
      Renderer.transformWorld2View(
        urlNode.rectangle.location.add(
          new Vector(urlNode.rectangle.size.x, UrlNode.titleHeight),
        ),
      ),
      StageStyleManager.currentStyle.StageObjectBorderColor,
      1 * Camera.currentScale,
      4 * Camera.currentScale,
    );
    // 绘制url
    TextRenderer.renderText(
      urlNode.url,
      Renderer.transformWorld2View(
        urlNode.rectangle.location.add(
          new Vector(
            Renderer.NODE_PADDING,
            UrlNode.titleHeight + Renderer.NODE_PADDING,
          ),
        ),
      ),
      Renderer.FONT_SIZE * 0.5 * Camera.currentScale,
      StageStyleManager.currentStyle.StageObjectBorderColor,
    );
    EntityRenderer.renderEntityDetails(urlNode);
    // 绘制特效
    renderHoverState(urlNode);
  }

  function renderHoverState(urlNode: UrlNode): void {
    const mouseLocation = Renderer.transformView2World(MouseLocation.vector());
    if (urlNode.titleRectangle.isPointIn(mouseLocation)) {
      // 鼠标在标题上
      ShapeRenderer.renderRect(
        urlNode.titleRectangle.transformWorld2View(),
        StageStyleManager.currentStyle.CollideBoxPreSelectedColor,
        StageStyleManager.currentStyle.CollideBoxSelectedColor,
        2 * Camera.currentScale,
        0,
      );
    } else if (urlNode.urlRectangle.isPointIn(mouseLocation)) {
      // 鼠标在url上
      ShapeRenderer.renderRect(
        urlNode.urlRectangle.transformWorld2View(),
        StageStyleManager.currentStyle.CollideBoxPreSelectedColor,
        StageStyleManager.currentStyle.CollideBoxSelectedColor,
        2 * Camera.currentScale,
        0,
      );
      // 绘制提示
      TextRenderer.renderText(
        "双击打开链接",
        Renderer.transformWorld2View(
          urlNode.rectangle.leftBottom.add(new Vector(0, 20)),
        ),
        Renderer.FONT_SIZE * 0.5 * Camera.currentScale,
        StageStyleManager.currentStyle.StageObjectBorderColor,
      );
    }
  }
}
