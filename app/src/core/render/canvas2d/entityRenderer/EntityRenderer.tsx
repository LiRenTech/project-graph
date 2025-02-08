import { replaceTextWhenProtect } from "../../../../utils/font";
import { Random } from "../../../algorithm/random";
import { Color, colorInvert } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { AutoComputeUtils } from "../../../service/dataGenerateService/autoComputeEngine/AutoComputeUtils";
import {
  getLogicNodeRenderName,
  LogicNodeNameEnum,
  LogicNodeNameToRenderNameMap,
} from "../../../service/dataGenerateService/autoComputeEngine/logicNodeNameEnum";
import { StageStyleManager } from "../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../stage/Camera";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { ConnectPoint } from "../../../stage/stageObject/entity/ConnectPoint";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { PenStroke } from "../../../stage/stageObject/entity/PenStroke";
import { PortalNode } from "../../../stage/stageObject/entity/PortalNode";
import { Section } from "../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../stage/stageObject/entity/UrlNode";
import { CurveRenderer } from "../basicRenderer/curveRenderer";
import { ImageRenderer } from "../basicRenderer/ImageRenderer";
import { ShapeRenderer } from "../basicRenderer/shapeRenderer";
import { TextRenderer } from "../basicRenderer/textRenderer";
import { Renderer } from "../renderer";
import { CollisionBoxRenderer } from "./CollisionBoxRenderer";
import { EntityDetailsButtonRenderer } from "./EntityDetailsButtonRenderer";
import { PortalNodeRenderer } from "./portalNode/portalNodeRenderer";
import { SectionRenderer } from "./section/SectionRenderer";
import { UrlNodeRenderer } from "./urlNode/urlNodeRenderer";

/**
 * 处理节点相关的绘制
 */
export namespace EntityRenderer {
  let sectionSortedZIndex: Section[] = [];

  /**
   * 对所有section排序一次
   * 为了防止每帧都调用导致排序，为了提高性能
   * 决定：每隔几秒更新一次
   */
  export function sortSectionsByZIndex() {
    const sections = StageManager.getSections();
    sections.sort((a, b) => a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top);
    sectionSortedZIndex = sections;
  }

  let tickNumber = 0;

  export function renderAllSectionsBackground(viewRectangle: Rectangle) {
    if (sectionSortedZIndex.length != StageManager.getSections().length) {
      // console.log("强制更新了一次");
      sortSectionsByZIndex();
    } else {
      // 假设fps=60，则10秒更新一次
      if (tickNumber % 600 === 0) {
        // console.log("更新了一次");
        sortSectionsByZIndex();
      }
    }
    // 1 遍历所有section实体，画底部颜色
    for (const section of sectionSortedZIndex) {
      if (isOverView(viewRectangle, section)) {
        continue;
      }
      SectionRenderer.renderBackgroundColor(section);
    }
    tickNumber++;
  }

  export function renderAllSectionsBigTitle(viewRectangle: Rectangle) {
    for (let i = sectionSortedZIndex.length - 1; i >= 0; i--) {
      const section = sectionSortedZIndex[i];
      if (isOverView(viewRectangle, section)) {
        continue;
      }
      SectionRenderer.renderBigTitle(section);
    }
  }

  /**
   * 统一渲染所有实体
   * 返回实际渲染的实体数量
   */
  export function renderAllEntities(viewRectangle: Rectangle) {
    let renderedNodes = 0;

    // 2 遍历所有非section实体
    for (const entity of StageManager.getEntities()) {
      if (entity instanceof Section) {
        continue;
      }
      // 视线之外不画
      if (isOverView(viewRectangle, entity)) {
        continue;
      }
      EntityRenderer.renderEntity(entity);
      renderedNodes++;
    }
    // 3 遍历所有section实体，画顶部大文字
    for (const section of StageManager.getSections()) {
      if (isOverView(viewRectangle, section)) {
        continue;
      }
      SectionRenderer.render(section);
    }
    return renderedNodes;
  }

  // 是否超出了视野之外
  function isOverView(viewRectangle: Rectangle, entity: Entity): boolean {
    if (!Camera.limitCameraInCycleSpace && !viewRectangle.isCollideWith(entity.collisionBox.getRectangle())) {
      return true;
    }
    return false;
  }

  /**
   * 父渲染函数
   * @param entity
   */
  export function renderEntity(entity: Entity) {
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
    } else if (entity instanceof UrlNode) {
      UrlNodeRenderer.render(entity);
    } else if (entity instanceof PenStroke) {
      renderPenStroke(entity);
    } else if (entity instanceof PortalNode) {
      PortalNodeRenderer.render(entity);
    }
    // details右上角小按钮
    EntityDetailsButtonRenderer(entity);
  }

  function renderNode(node: TextNode) {
    // 节点身体矩形
    let fillColor = node.color;
    if (Camera.currentScale < 0.065 && fillColor.a === 0) {
      const color = StageStyleManager.currentStyle.StageObjectBorderColor.clone();
      color.a = 0.2;
      fillColor = color;
    }
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(node.rectangle.location),
        node.rectangle.size.multiply(Camera.currentScale),
      ),
      fillColor,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );

    // 视野缩放过小就不渲染内部文字
    if (Camera.currentScale > 0.065) {
      renderTextNodeTextLayer(node);
    }

    if (node.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(node.collisionBox, StageStyleManager.currentStyle.CollideBoxSelectedColor);
    }
    if (node.isAiGenerating) {
      const borderColor = StageStyleManager.currentStyle.CollideBoxSelectedColor.clone();
      borderColor.a = Random.randomFloat(0.2, 1);
      // 在外面增加一个框
      ShapeRenderer.renderRect(
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

  /**
   * 画节点文字层信息
   * @param node
   */
  function renderTextNodeTextLayer(node: TextNode) {
    if (!node.isEditing) {
      // 非编辑，正常显示状态
      if (!node.text) {
        TextRenderer.renderTextFromCenter(
          "undefined",
          Renderer.transformWorld2View(node.rectangle.center),
          Renderer.FONT_SIZE * Camera.currentScale,
          node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
          Color.Red,
          30 * Camera.currentScale,
        );
      } else if (AutoComputeUtils.isNameIsLogicNode(node.text)) {
        // 检查下是不是逻辑节点
        let isFindLogicName = false;
        for (const key of Object.keys(LogicNodeNameToRenderNameMap)) {
          if (node.text === key) {
            isFindLogicName = true;
            const logicNodeName = key as LogicNodeNameEnum;
            TextRenderer.renderTextFromCenter(
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
        if (!isFindLogicName) {
          // 未知的逻辑节点，可能是版本过低
          TextRenderer.renderTextFromCenter(
            node.text,
            Renderer.transformWorld2View(node.rectangle.center),
            Renderer.FONT_SIZE * Camera.currentScale,
            node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
            Color.Red,
            10 * Camera.currentScale,
            Random.randomInt(-5, 5) * Camera.currentScale,
            Random.randomInt(-15, 15) * Camera.currentScale,
          );
          ShapeRenderer.renderRect(
            new Rectangle(
              Renderer.transformWorld2View(
                node.rectangle.location.add(new Vector(Random.randomInt(-5, 5), Random.randomInt(-5, 5))),
              ),
              node.rectangle.size.multiply(Camera.currentScale),
            ),
            node.color,
            new Color(255, 0, 0, 0.5),
            Random.randomFloat(1, 10) * Camera.currentScale,
            Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
          );
        }
      } else {
        TextRenderer.renderMultiLineText(
          Renderer.protectingPrivacy ? replaceTextWhenProtect(node.text) : node.text,
          Renderer.transformWorld2View(
            node.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)).add(new Vector(0, Renderer.FONT_SIZE / 4)),
          ),
          Renderer.FONT_SIZE * Camera.currentScale,
          Infinity,
          node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
          1.5,
        );
      }
    } else {
      // 编辑状态下，显示一些提示信息
      // TextRenderer.renderText(
      //   "Esc 或 Ctrl+Enter 退出编辑状态",
      //   Renderer.transformWorld2View(
      //     node.rectangle.location.add(new Vector(0, -25)),
      //   ),
      //   20 * Camera.currentScale,
      //   StageStyleManager.currentStyle.GridHeavyColor,
      // );
    }
  }

  /**
   * 渲染实体下方的注释（详细信息）
   * @param entity
   */
  export function renderEntityDetails(entity: Entity) {
    if (entity.details && !entity.isEditingDetails) {
      if (Renderer.isAlwaysShowDetails) {
        _renderEntityDetails(entity, Renderer.ENTITY_DETAILS_LIENS_LIMIT);
      } else {
        if (entity.isMouseHover) {
          _renderEntityDetails(entity, Renderer.ENTITY_DETAILS_LIENS_LIMIT);
        }
      }
    }
  }
  function _renderEntityDetails(entity: Entity, limitLiens: number) {
    TextRenderer.renderMultiLineText(
      entity.details,
      Renderer.transformWorld2View(
        entity.collisionBox.getRectangle().location.add(new Vector(0, entity.collisionBox.getRectangle().size.y)),
      ),
      Renderer.FONT_SIZE_DETAILS * Camera.currentScale,
      Math.max(
        Renderer.ENTITY_DETAILS_WIDTH * Camera.currentScale,
        entity.collisionBox.getRectangle().size.x * Camera.currentScale,
      ),
      StageStyleManager.currentStyle.NodeDetailsTextColor,
      1.2,
      limitLiens,
    );
  }

  function renderConnectPoint(connectPoint: ConnectPoint) {
    if (connectPoint.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(connectPoint.collisionBox, StageStyleManager.currentStyle.CollideBoxSelectedColor);
    }
    ShapeRenderer.renderCircle(
      Renderer.transformWorld2View(connectPoint.geometryCenter),
      connectPoint.radius * Camera.currentScale,
      Color.Transparent,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
    );
    renderEntityDetails(connectPoint);
  }

  function renderImageNode(imageNode: ImageNode) {
    if (imageNode.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(imageNode.collisionBox, StageStyleManager.currentStyle.CollideBoxSelectedColor);
    }
    // 节点身体矩形
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(imageNode.rectangle.location),
        imageNode.rectangle.size.multiply(Camera.currentScale),
      ),
      Color.Transparent,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
    );
    if (imageNode.state === "loading") {
      TextRenderer.renderTextFromCenter(
        "loading...",
        Renderer.transformWorld2View(imageNode.rectangle.center),
        20 * Camera.currentScale,
        StageStyleManager.currentStyle.StageObjectBorderColor,
      );
    } else if (imageNode.state === "success") {
      ImageRenderer.renderImageElement(
        imageNode.imageElement,
        Renderer.transformWorld2View(imageNode.rectangle.location),
        imageNode.scaleNumber,
      );
    } else if (imageNode.state === "encodingError" || imageNode.state === "unknownError") {
      TextRenderer.renderTextFromCenter(
        imageNode.uuid,
        Renderer.transformWorld2View(imageNode.rectangle.topCenter),
        10 * Camera.currentScale,
        Color.Red,
      );
      TextRenderer.renderTextFromCenter(
        imageNode.errorDetails,
        Renderer.transformWorld2View(imageNode.rectangle.bottomCenter),
        10 * Camera.currentScale,
        Color.Red,
      );
      if (imageNode.state === "unknownError") {
        TextRenderer.renderTextFromCenter(
          "未知错误，建议反馈",
          Renderer.transformWorld2View(imageNode.rectangle.center),
          20 * Camera.currentScale,
          Color.Red,
        );
      } else if (imageNode.state === "encodingError") {
        TextRenderer.renderTextFromCenter(
          "图片base64编码错误",
          Renderer.transformWorld2View(imageNode.rectangle.center),
          20 * Camera.currentScale,
          Color.Red,
        );
      }
    }
    // 调试，缩放信息和位置信息
    if (Renderer.isShowDebug) {
      TextRenderer.renderText(
        "scale: " + imageNode.scaleNumber.toString(),
        Renderer.transformWorld2View(imageNode.rectangle.location.subtract(new Vector(0, 6))),
        3 * Camera.currentScale,
        Color.Gray,
      );
      TextRenderer.renderText(
        "origin size: " + imageNode.originImageSize.toString(),
        Renderer.transformWorld2View(imageNode.rectangle.location.subtract(new Vector(0, 3 + 6))),
        3 * Camera.currentScale,
        Color.Gray,
      );
    }
    renderEntityDetails(imageNode);
  }
  function renderPenStroke(penStroke: PenStroke) {
    CurveRenderer.renderSolidLineMultipleWithWidth(
      penStroke.getPath().map((v) => Renderer.transformWorld2View(v)),
      penStroke.getColor(),
      penStroke.getSegmentList().map((seg) => seg.width * Camera.currentScale),
    );
  }
}
