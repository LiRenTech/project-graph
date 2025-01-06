import { Color, colorInvert } from "../../../dataStruct/Color";
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
import { EntityDetailsButtonRenderer } from "./EntityDetailsButtonRenderer";
import { SectionRenderer } from "./section/SectionRenderer";
import {
  getLogicNodeRenderName,
  LogicNodeNameEnum,
  LogicNodeNameToRenderNameMap,
} from "../../../stage/autoComputeEngine/logicNodeNameEnum";

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
      SectionRenderer.render(entity);
    } else if (entity instanceof TextNode) {
      renderNode(entity);
    } else if (entity instanceof ConnectPoint) {
      renderConnectPoint(entity);
    } else if (entity instanceof ImageNode) {
      renderImageNode(entity);
    }
    // details右上角小按钮
    EntityDetailsButtonRenderer(entity);
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
      if (node.text.startsWith("#") && node.text.endsWith("#")) {
        // 检查下是不是逻辑节点
        for (const key of Object.keys(LogicNodeNameToRenderNameMap)) {
          if (node.text === key) {
            const logicNodeName = key as LogicNodeNameEnum;
            RenderUtils.renderTextFromCenter(
              getLogicNodeRenderName(logicNodeName),
              Renderer.transformWorld2View(node.rectangle.center),
              Renderer.FONT_SIZE * Camera.currentScale,
              node.color.a === 1
                ? colorInvert(node.color)
                : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
              Color.Green,
              10 * Camera.currentScale,
            );
          }
        }
      } else {
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

  export function renderEntityDetails(entity: Entity) {
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
    } else if (
      imageNode.state === "encodingError" ||
      imageNode.state === "unknownError"
    ) {
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
      if (imageNode.state === "unknownError") {
        RenderUtils.renderTextFromCenter(
          "未知错误，建议反馈",
          Renderer.transformWorld2View(imageNode.rectangle.center),
          20 * Camera.currentScale,
          Color.Red,
        );
      } else if (imageNode.state === "encodingError") {
        RenderUtils.renderTextFromCenter(
          "图片base64编码错误",
          Renderer.transformWorld2View(imageNode.rectangle.center),
          20 * Camera.currentScale,
          Color.Red,
        );
      }
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
