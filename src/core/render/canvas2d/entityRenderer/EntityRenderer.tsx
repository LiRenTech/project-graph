import { Color, mixColors } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { Camera } from "../../../stage/Camera";
import { Renderer } from "../renderer";
import { RenderUtils } from "../RenderUtils";
import { Section } from "../../../stageObject/entity/Section";
import { CollisionBoxRenderer } from "./CollisionBoxRenderer";
import { ConnectPoint } from "../../../stageObject/entity/ConnectPoint";
import { replaceTextWhenProtect } from "../../../../utils/font";
import { Random } from "../../../algorithm/random";
import { StageStyleManager } from "../../../stageStyle/StageStyleManager";
import { ImageNode } from "../../../stageObject/entity/ImageNode";
import { ImageRenderer } from "../ImageRenderer";
import { Entity } from "../../../stageObject/StageObject";

/**
 * 处理节点相关的绘制
 */
export namespace EntityRenderer {
  /**
   * 父渲染函数
   * @param entity
   */
  export function renderEntity(entity: Entity, viewRectangle: Rectangle) {
    // 视线之外不画
    if (!viewRectangle.isCollideWith(entity.collisionBox.getRectangle())) {
      return;
    }
    // section 折叠不画
    if (entity.isHiddenBySectionCollapse) {
      return;
    }
    if (entity instanceof Section) {
      renderSection(entity);
    } else if (entity instanceof TextNode) {
      renderNode(entity);
    } else if (entity instanceof ConnectPoint) {
      renderConnectPoint(entity);
    } else if (entity instanceof ImageNode) {
      renderImageNode(entity);
    }
  }
  function renderSection(section: Section) {
    if (section.isHiddenBySectionCollapse) {
      return;
    }
    if (section.isCollapsed) {
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
    } else {
      // 非折叠状态
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

    if (section.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(
        section.collisionBox,
        new Color(0, 255, 0, 0.5),
      );
    }
    // debug
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
    renderEntityDetails(section);
  }

  function renderNode(node: TextNode) {
    // 节点身体矩形
    RenderUtils.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(node.rectangle.location),
        node.rectangle.size.multiply(Camera.currentScale),
      ),
      node.color,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );

    if (!node.isEditing) {
      RenderUtils.renderText(
        Renderer.protectingPrivacy
          ? replaceTextWhenProtect(node.text)
          : node.text,
        Renderer.transformWorld2View(
          node.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)),
        ),
        Renderer.FONT_SIZE * Camera.currentScale,
        node.color.a === 1
          ? colorInvert(node.color)
          : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
      );
    }

    if (node.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(
        node.collisionBox,
        StageStyleManager.currentStyle.CollideBoxSelectedColor,
      );
    }
    if (node.isAiGenerating) {
      const borderColor =
        StageStyleManager.currentStyle.CollideBoxSelectedColor.clone();
      borderColor.a = Random.randomFloat(0.2, 1);
      // 在外面增加一个框
      RenderUtils.renderRect(
        new Rectangle(
          Renderer.transformWorld2View(node.rectangle.location),
          node.rectangle.size.multiply(Camera.currentScale),
        ),
        node.color,
        borderColor,
        Random.randomFloat(1, 10) * Camera.currentScale,
        Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
      );
    }

    renderEntityDetails(node);
  }

  function renderEntityDetails(entity: Entity) {
    if (entity.details && !entity.isEditingDetails) {
      if (Renderer.isAlwaysShowDetails) {
        _renderEntityDetails(entity);
      } else {
        if (entity.isMouseHover) {
          _renderEntityDetails(entity);
        }
      }
    }
  }
  function _renderEntityDetails(entity: Entity) {
    RenderUtils.renderMultiLineText(
      entity.details,
      Renderer.transformWorld2View(
        entity.collisionBox
          .getRectangle()
          .location.add(
            new Vector(0, entity.collisionBox.getRectangle().size.y),
          ),
      ),
      Renderer.FONT_SIZE_DETAILS * Camera.currentScale,
      Math.max(
        Renderer.NODE_DETAILS_WIDTH * Camera.currentScale,
        entity.collisionBox.getRectangle().size.x * Camera.currentScale,
      ),
      StageStyleManager.currentStyle.NodeDetailsTextColor,
    );
  }
  export function colorInvert(color: Color): Color {
    /**
     * 计算背景色的亮度 更精确的人眼感知亮度公式
     * 0.2126 * R + 0.7152 * G + 0.0722 * B，
     * 如果亮度较高，则使用黑色文字，
     * 如果亮度较低，则使用白色文字。
     * 这种方法能够确保无论背景色如何变化，文字都能保持足够的对比度。
     */

    const r = color.r;
    const g = color.g;
    const b = color.b;
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (brightness > 128) {
      return Color.Black; // 返回黑色
    } else {
      return Color.White; // 返回白色
    }
  }

  function renderConnectPoint(connectPoint: ConnectPoint) {
    if (connectPoint.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(
        connectPoint.collisionBox,
        StageStyleManager.currentStyle.CollideBoxSelectedColor,
      );
    }
    RenderUtils.renderCircle(
      Renderer.transformWorld2View(connectPoint.geometryCenter),
      connectPoint.radius * Camera.currentScale,
      Color.Transparent,
      Color.White,
      2 * Camera.currentScale,
    );
    renderEntityDetails(connectPoint);
  }

  function renderImageNode(imageNode: ImageNode) {
    if (imageNode.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(
        imageNode.collisionBox,
        StageStyleManager.currentStyle.CollideBoxSelectedColor,
      );
    }
    // 节点身体矩形
    RenderUtils.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(imageNode.rectangle.location),
        imageNode.rectangle.size.multiply(Camera.currentScale),
      ),
      Color.Transparent,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    if (imageNode.state === "loading") {
      RenderUtils.renderTextFromCenter(
        "loading...",
        Renderer.transformWorld2View(imageNode.rectangle.center),
        20 * Camera.currentScale,
        Color.White,
      );
    } else if (imageNode.state === "success") {
      ImageRenderer.renderImageElement(
        imageNode.imageElement,
        Renderer.transformWorld2View(imageNode.rectangle.location),
        imageNode.scaleNumber,
      );
    } else if (imageNode.state === "unknownError") {
      RenderUtils.renderTextFromCenter(
        "未知错误，建议反馈",
        Renderer.transformWorld2View(imageNode.rectangle.center),
        20 * Camera.currentScale,
        Color.Red,
      );
      RenderUtils.renderTextFromCenter(
        imageNode.uuid,
        Renderer.transformWorld2View(imageNode.rectangle.topCenter),
        10 * Camera.currentScale,
        Color.Red,
      );
      RenderUtils.renderTextFromCenter(
        imageNode.errorDetails,
        Renderer.transformWorld2View(imageNode.rectangle.bottomCenter),
        10 * Camera.currentScale,
        Color.Red,
      );
    } else if (imageNode.state === "encodingError") {
      RenderUtils.renderTextFromCenter(
        "图片base64编码错误",
        Renderer.transformWorld2View(imageNode.rectangle.center),
        20 * Camera.currentScale,
        Color.Red,
      );
      RenderUtils.renderTextFromCenter(
        imageNode.uuid,
        Renderer.transformWorld2View(imageNode.rectangle.topCenter),
        10 * Camera.currentScale,
        Color.Red,
      );
      RenderUtils.renderTextFromCenter(
        imageNode.errorDetails,
        Renderer.transformWorld2View(imageNode.rectangle.bottomCenter),
        10 * Camera.currentScale,
        Color.Red,
      );
    }
    // 调试，缩放信息和位置信息
    if (Renderer.isShowDebug) {
      RenderUtils.renderText(
        "scale: " + imageNode.scaleNumber.toString(),
        Renderer.transformWorld2View(
          imageNode.rectangle.location.subtract(new Vector(0, 6)),
        ),
        3 * Camera.currentScale,
        Color.Gray,
      );
      RenderUtils.renderText(
        "origin size: " + imageNode.originImageSize.toString(),
        Renderer.transformWorld2View(
          imageNode.rectangle.location.subtract(new Vector(0, 3 + 6)),
        ),
        3 * Camera.currentScale,
        Color.Gray,
      );
    }
    renderEntityDetails(imageNode);
  }
}
