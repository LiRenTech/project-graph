import { Color } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { StageStyleManager } from "../../../service/feedbackService/stageStyle/StageStyleManager";
import { Settings } from "../../../service/Settings";
import { Camera } from "../../../stage/Camera";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { ConnectPoint } from "../../../stage/stageObject/entity/ConnectPoint";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { PenStroke } from "../../../stage/stageObject/entity/PenStroke";
import { PortalNode } from "../../../stage/stageObject/entity/PortalNode";
import { Section } from "../../../stage/stageObject/entity/Section";
import { SvgNode } from "../../../stage/stageObject/entity/SvgNode";
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
import { SvgNodeRenderer } from "./svgNode/SvgNodeRenderer";
import { TextNodeRenderer } from "./textNode/TextNodeRenderer";
import { UrlNodeRenderer } from "./urlNode/urlNodeRenderer";

/**
 * 处理节点相关的绘制
 */
export namespace EntityRenderer {
  let sectionSortedZIndex: Section[] = [];
  export let sectionBitTitleRenderType: Settings.Settings["sectionBitTitleRenderType"] = "cover";

  export function init() {
    Settings.watch("sectionBitTitleRenderType", (value) => {
      sectionBitTitleRenderType = value;
    });
  }

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
      sortSectionsByZIndex();
    } else {
      // 假设fps=60，则10秒更新一次
      if (tickNumber % 600 === 0) {
        sortSectionsByZIndex();
      }
    }
    // 1 遍历所有section实体，画底部颜色
    for (const section of sectionSortedZIndex) {
      if (Renderer.isOverView(viewRectangle, section)) {
        continue;
      }
      SectionRenderer.renderBackgroundColor(section);
    }
    // 2 遍历所有传送门,渲染黑底
    for (const portalNode of StageManager.getPortalNodes()) {
      if (Renderer.isOverView(viewRectangle, portalNode)) {
        continue;
      }
      PortalNodeRenderer.renderBackground(portalNode);
    }
    // 最后更新帧
    tickNumber++;
  }

  /**
   * 统一渲染全部框的大标题
   */
  export function renderAllSectionsBigTitle(viewRectangle: Rectangle) {
    if (sectionBitTitleRenderType === "none") {
      return;
    }
    // 从最深层的最小框开始渲染
    // 目前的层级排序是假的，是直接按y轴从上往下判定
    // 认为最靠上的才是最底下的
    for (let z = sectionSortedZIndex.length - 1; z >= 0; z--) {
      const section = sectionSortedZIndex[z];
      if (Renderer.isOverView(viewRectangle, section)) {
        continue;
      }
      if (sectionBitTitleRenderType === "cover") {
        SectionRenderer.renderBigCoveredTitle(section);
      } else if (sectionBitTitleRenderType === "top") {
        SectionRenderer.renderTopTitle(section);
      }
    }
  }

  /**
   * 统一渲染所有实体
   * 返回实际渲染的实体数量
   */
  export function renderAllEntities(viewRectangle: Rectangle) {
    let renderedNodes = 0;

    // 2 遍历所有非section实体 / 非涂鸦实体
    for (const entity of StageManager.getEntities()) {
      if (entity instanceof Section) {
        continue;
      }
      if (entity instanceof PenStroke) {
        continue;
      }
      // 视线之外不画
      if (Renderer.isOverView(viewRectangle, entity)) {
        continue;
      }
      EntityRenderer.renderEntity(entity);
      renderedNodes++;
    }
    // 3 遍历所有section实体，画顶部大文字
    for (const section of StageManager.getSections()) {
      if (Renderer.isOverView(viewRectangle, section)) {
        continue;
      }
      SectionRenderer.render(section);
    }
    // 4 遍历所有涂鸦实体
    for (const penStroke of StageManager.getPenStrokes()) {
      if (Renderer.isOverView(viewRectangle, penStroke)) {
        continue;
      }
      EntityRenderer.renderEntity(penStroke);
    }
    return renderedNodes;
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
      TextNodeRenderer.renderTextNode(entity);
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
    } else if (entity instanceof SvgNode) {
      SvgNodeRenderer.render(entity);
    }
    // details右上角小按钮
    if (Camera.currentScale > Renderer.ignoreTextNodeTextRenderLessThanCameraScale) {
      EntityDetailsButtonRenderer(entity);
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
      StageStyleManager.currentStyle.NodeDetailsText,
      1.2,
      limitLiens,
    );
  }

  function renderConnectPoint(connectPoint: ConnectPoint) {
    if (connectPoint.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(connectPoint.collisionBox, StageStyleManager.currentStyle.CollideBoxSelected);
    }
    ShapeRenderer.renderCircle(
      Renderer.transformWorld2View(connectPoint.geometryCenter),
      connectPoint.radius * Camera.currentScale,
      Color.Transparent,
      StageStyleManager.currentStyle.StageObjectBorder,
      2 * Camera.currentScale,
    );
    renderEntityDetails(connectPoint);
  }

  function renderImageNode(imageNode: ImageNode) {
    if (imageNode.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(imageNode.collisionBox, StageStyleManager.currentStyle.CollideBoxSelected);
    }
    // 节点身体矩形
    // 2群群友反馈这个图片不加边框应该更好看。因为有透明logo图案，边框贴紧会很难看。

    // ShapeRenderer.renderRect(
    //   new Rectangle(
    //     Renderer.transformWorld2View(imageNode.rectangle.location),
    //     imageNode.rectangle.size.multiply(Camera.currentScale),
    //   ),
    //   Color.Transparent,
    //   StageStyleManager.currentStyle.StageObjectBorder,
    //   2 * Camera.currentScale,
    // );
    if (imageNode.state === "loading") {
      TextRenderer.renderTextFromCenter(
        "loading...",
        Renderer.transformWorld2View(imageNode.rectangle.center),
        20 * Camera.currentScale,
        StageStyleManager.currentStyle.StageObjectBorder,
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
      TextRenderer.renderOneLineText(
        "scale: " + imageNode.scaleNumber.toString(),
        Renderer.transformWorld2View(imageNode.rectangle.location.subtract(new Vector(0, 6))),
        3 * Camera.currentScale,
        Color.Gray,
      );
      TextRenderer.renderOneLineText(
        "origin size: " + imageNode.originImageSize.toString(),
        Renderer.transformWorld2View(imageNode.rectangle.location.subtract(new Vector(0, 3 + 6))),
        3 * Camera.currentScale,
        Color.Gray,
      );
    }
    renderEntityDetails(imageNode);
  }

  /**
   * 渲染涂鸦笔画
   * TODO: 绘制时的碰撞箱应该有一个合适的宽度
   * @param penStroke
   */
  function renderPenStroke(penStroke: PenStroke) {
    let penStrokeColor = penStroke.getColor();
    if (penStrokeColor.a === 0) {
      penStrokeColor = StageStyleManager.currentStyle.StageObjectBorder.clone();
    }
    // const path = penStroke.getPath();
    // if (path.length <= 3) {
    //   CurveRenderer.renderSolidLineMultipleWithWidth(
    //     penStroke.getPath().map((v) => Renderer.transformWorld2View(v)),
    //     penStrokeColor,
    //     penStroke.getSegmentList().map((seg) => seg.width * Camera.currentScale),
    //   );
    // } else {
    //   CurveRenderer.renderSolidLineMultipleSmoothly(
    //     penStroke.getPath().map((v) => Renderer.transformWorld2View(v)),
    //     penStrokeColor,
    //     penStroke.getSegmentList()[0].width * Camera.currentScale,
    //   );
    // }
    const segmentList = penStroke.getSegmentList();

    // console.log("@@", segmentList);

    CurveRenderer.renderPenStroke(
      segmentList.map((segment) => ({
        startLocation: Renderer.transformWorld2View(segment.startLocation),
        endLocation: Renderer.transformWorld2View(segment.endLocation),
        width: segment.width * Camera.currentScale,
      })),
      penStrokeColor,
    );
    if (penStroke.isMouseHover) {
      CollisionBoxRenderer.render(penStroke.collisionBox, StageStyleManager.currentStyle.CollideBoxPreSelected);
    }
    if (penStroke.isSelected) {
      CollisionBoxRenderer.render(
        penStroke.collisionBox,
        StageStyleManager.currentStyle.CollideBoxSelected.toNewAlpha(0.5),
      );
    }
  }
}
