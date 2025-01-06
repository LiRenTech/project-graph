import { Color, colorInvert, mixColors } from "../../../../dataStruct/Color";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Camera } from "../../../../stage/Camera";
import { Renderer } from "../../renderer";
import { RenderUtils } from "../../RenderUtils";
import { Section } from "../../../../stageObject/entity/Section";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { StageStyleManager } from "../../../../stageStyle/StageStyleManager";
import { EntityRenderer } from "../EntityRenderer";
import { Canvas } from "../../../../stage/Canvas";

export namespace SectionRenderer {
  /** 画折叠状态 */
  function renderCollapsed(section: Section) {
    // 折叠状态
    const renderRectangle = new Rectangle(
      Renderer.transformWorld2View(section.rectangle.location),
      section.rectangle.size.multiply(Camera.currentScale),
    );
    RenderUtils.renderRect(
      renderRectangle,
      section.color,
      mixColors(
        StageStyleManager.currentStyle.StageObjectBorderColor,
        Color.Black,
        0.5,
      ),
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    // 外框
    RenderUtils.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(
          section.rectangle.location.subtract(Vector.same(4)),
        ),
        section.rectangle.size
          .add(Vector.same(4 * 2))
          .multiply(Camera.currentScale),
      ),
      section.color,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * 1.5 * Camera.currentScale,
    );

    RenderUtils.renderText(
      section.text,
      Renderer.transformWorld2View(
        section.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)),
      ),
      Renderer.FONT_SIZE * Camera.currentScale,
      section.color.a === 1
        ? colorInvert(section.color)
        : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
    );
  }

  // 非折叠状态
  function renderNoCollapse(section: Section) {
    RenderUtils.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(section.rectangle.location),
        section.rectangle.size.multiply(Camera.currentScale),
      ),
      section.color,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    if (Camera.currentScale > 0.2) {
      // 正常显示标题
      RenderUtils.renderText(
        section.text,
        Renderer.transformWorld2View(
          section.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)),
        ),
        Renderer.FONT_SIZE * Camera.currentScale,
        section.color.a === 1
          ? colorInvert(section.color)
          : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
      );
    } else {
      const fontSizeVector = getFontSizeBySectionSize(section);
      const fontHeight = fontSizeVector.y;
      // 缩放过小了，显示巨大化文字
      RenderUtils.renderTextFromCenter(
        section.text,
        Renderer.transformWorld2View(section.rectangle.center),
        fontHeight * Camera.currentScale,
        section.color.a === 1
          ? colorInvert(section.color)
          : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
      );
    }
  }

  function getFontSizeBySectionSize(section: Section): Vector {
    // 缩放过小了，显示巨大化文字
    RenderUtils.renderText("", Vector.getZero(), 100);

    const textSize = Canvas.ctx.measureText(section.text);
    const width = textSize.width;
    const height = 100;
    // console.log("textSize", width, height);
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
      CollisionBoxRenderer.render(
        section.collisionBox,
        new Color(0, 255, 0, 0.5),
      );
    }
    // debug: 绿色虚线
    if (Renderer.isShowDebug) {
      for (const child of section.children) {
        RenderUtils.renderDashedLine(
          Renderer.transformWorld2View(section.rectangle.leftTop),
          Renderer.transformWorld2View(
            child.collisionBox.getRectangle().leftTop,
          ),
          Color.Green,
          0.2 * Camera.currentScale,
          5 * Camera.currentScale,
        );
      }
    }
    EntityRenderer.renderEntityDetails(section);
  }
}
