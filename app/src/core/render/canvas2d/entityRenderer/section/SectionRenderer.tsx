import { Color, colorInvert, mixColors } from "../../../../dataStruct/Color";
import { CubicBezierCurve } from "../../../../dataStruct/shape/Curve";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { Canvas } from "../../../../stage/Canvas";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { CurveRenderer } from "../../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../basicRenderer/textRenderer";
import { Renderer } from "../../renderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { EntityRenderer } from "../EntityRenderer";

export namespace SectionRenderer {
  /** 画折叠状态 */
  function renderCollapsed(section: Section) {
    // 折叠状态
    const renderRectangle = new Rectangle(
      Renderer.transformWorld2View(section.rectangle.location),
      section.rectangle.size.multiply(Camera.currentScale),
    );
    ShapeRenderer.renderRect(
      renderRectangle,
      section.color,
      mixColors(StageStyleManager.currentStyle.StageObjectBorder, Color.Black, 0.5),
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    // 外框
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(section.rectangle.location.subtract(Vector.same(4))),
        section.rectangle.size.add(Vector.same(4 * 2)).multiply(Camera.currentScale),
      ),
      section.color,
      StageStyleManager.currentStyle.StageObjectBorder,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * 1.5 * Camera.currentScale,
    );
    if (!section.isEditingTitle) {
      TextRenderer.renderOneLineText(
        section.text,
        Renderer.transformWorld2View(section.rectangle.location.add(Vector.same(Renderer.NODE_PADDING))),
        Renderer.FONT_SIZE * Camera.currentScale,
        section.color.a === 1 ? colorInvert(section.color) : colorInvert(StageStyleManager.currentStyle.Background),
      );
    }
  }

  // 非折叠状态
  function renderNoCollapse(section: Section) {
    // 注意：这里智能画边框
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(section.rectangle.location),
        section.rectangle.size.multiply(Camera.currentScale),
      ),
      Color.Transparent,
      StageStyleManager.currentStyle.StageObjectBorder,
      Camera.currentScale > 0.2 ? 2 * Camera.currentScale : 2,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    if (Camera.currentScale > 0.2 && !section.isEditingTitle) {
      // 正常显示标题
      TextRenderer.renderOneLineText(
        section.text,
        Renderer.transformWorld2View(section.rectangle.location.add(Vector.same(Renderer.NODE_PADDING))),
        Renderer.FONT_SIZE * Camera.currentScale,
        section.color.a === 1 ? colorInvert(section.color) : colorInvert(StageStyleManager.currentStyle.Background),
      );
    }
  }

  export function renderBackgroundColor(section: Section) {
    const color = section.color.clone();
    color.a = Math.min(color.a, 0.5);
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(section.rectangle.location),
        section.rectangle.size.multiply(Camera.currentScale),
      ),
      color,
      Color.Transparent,
      0,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
  }

  export function renderBigTitle(section: Section) {
    if (Camera.currentScale >= Section.bigTitleCameraScale) {
      return;
    }
    const fontSizeVector = getFontSizeBySectionSize(section);
    const fontHeight = fontSizeVector.y;
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(section.rectangle.location),
        section.rectangle.size.multiply(Camera.currentScale),
      ),
      section.color.a === 0 ? StageStyleManager.currentStyle.Background.toNewAlpha(0.5) : section.color.toNewAlpha(0.5),
      StageStyleManager.currentStyle.StageObjectBorder,
      2 * Camera.currentScale,
    );
    // 缩放过小了，显示巨大化文字
    TextRenderer.renderTextFromCenter(
      section.text,
      Renderer.transformWorld2View(section.rectangle.center),
      fontHeight * Camera.currentScale,
      section.color.a === 1 ? colorInvert(section.color) : colorInvert(StageStyleManager.currentStyle.Background),
    );

    // =========== 另一种方法
    // const fontSize = 30 * (0.5 * Camera.currentScale + 0.5);
    // const leftTopLocation = section.collisionBox.getRectangle().leftTop;
    // const leftTopViewLocation = Renderer.transformWorld2View(leftTopLocation);
    // const leftTopFontViewLocation = leftTopViewLocation.subtract(new Vector(0, fontSize));
    // const bgColor =
    //   section.color.a === 0
    //     ? StageStyleManager.currentStyle.BackgroundColor.toNewAlpha(0.5)
    //     : section.color.toNewAlpha(0.5);

    // const textColor =
    //   section.color.a === 1 ? colorInvert(section.color) : colorInvert(StageStyleManager.currentStyle.BackgroundColor);
    // const textSize = getTextSize(section.text, fontSize);
    // ShapeRenderer.renderRect(
    //   new Rectangle(leftTopFontViewLocation, textSize).expandFromCenter(2),
    //   bgColor,
    //   StageStyleManager.currentStyle.StageObjectBorderColor,
    //   2 * Camera.currentScale,
    //   2,
    // );

    // TextRenderer.renderText(section.text, leftTopFontViewLocation, fontSize, textColor);
  }

  function getFontSizeBySectionSize(section: Section): Vector {
    // 缩放过小了，显示巨大化文字
    TextRenderer.renderOneLineText("", Vector.getZero(), 100);

    const textSize = Canvas.ctx.measureText(section.text);
    const width = textSize.width;
    const height = 100;
    // 计算文字宽高比
    const ratio = width / height;
    // 计算section宽高比
    const sectionRatio = section.rectangle.size.x / section.rectangle.size.y;

    let fontHeight;
    if (sectionRatio < ratio) {
      fontHeight = section.rectangle.size.x / ratio;
    } else {
      fontHeight = section.rectangle.size.y;
    }
    return new Vector(ratio * fontHeight, fontHeight);
  }

  export function render(section: Section): void {
    if (section.isHiddenBySectionCollapse) {
      return;
    }

    if (section.isCollapsed) {
      // 折叠状态
      renderCollapsed(section);
    } else {
      // 非折叠状态
      renderNoCollapse(section);
    }

    if (section.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(section.collisionBox, StageStyleManager.currentStyle.CollideBoxSelected);
    }
    // debug: 绿色虚线 观察父子关系
    if (Renderer.isShowDebug) {
      for (const child of section.children) {
        const start = section.rectangle.topCenter;
        const end = child.collisionBox.getRectangle().leftTop;
        const DIS = 100;
        // const rate = (end.y - start.y) / section.rectangle.height;
        CurveRenderer.renderGradientBezierCurve(
          new CubicBezierCurve(
            Renderer.transformWorld2View(start),
            Renderer.transformWorld2View(start.add(new Vector(0, -DIS))),
            Renderer.transformWorld2View(end.add(new Vector(0, -DIS))),
            Renderer.transformWorld2View(end),
          ),
          Color.Green,
          Color.Red,
          2 * Camera.currentScale,
        );
      }
    }
    EntityRenderer.renderEntityDetails(section);
  }
}
