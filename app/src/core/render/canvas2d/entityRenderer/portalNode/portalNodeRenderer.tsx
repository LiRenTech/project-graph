import { Color } from "../../../../dataStruct/Color";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { MouseLocation } from "../../../../service/controlService/MouseLocation";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { PortalNode } from "../../../../stage/stageObject/entity/PortalNode";
import { CurveRenderer } from "../../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../basicRenderer/textRenderer";
import { Renderer } from "../../renderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { EntityRenderer } from "../EntityRenderer";

export namespace PortalNodeRenderer {
  /**
   * 主渲染
   * @param portalNode
   */
  export function render(portalNode: PortalNode) {
    const leftTopLocation = portalNode.location;
    const rightTopLocation = portalNode.collisionBox.getRectangle().rightTop;
    // 绘制矩形
    ShapeRenderer.renderRect(
      new Rectangle(leftTopLocation, portalNode.size).transformWorld2View(),
      portalNode.color,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
    // 虚线 1
    CurveRenderer.renderDashedLine(
      Renderer.transformWorld2View(leftTopLocation.add(new Vector(0, PortalNode.TITLE_LINE_Y))),
      Renderer.transformWorld2View(rightTopLocation.add(new Vector(0, PortalNode.TITLE_LINE_Y))),
      StageStyleManager.currentStyle.StageObjectBorderColor,
      1 * Camera.currentScale,
      10 * Camera.currentScale,
    );
    // 绘制标题，和节点文字大小保持一致
    TextRenderer.renderText(
      portalNode.title,
      Renderer.transformWorld2View(leftTopLocation.add(Vector.same(Renderer.NODE_PADDING))),
      Renderer.FONT_SIZE * Camera.currentScale,
      StageStyleManager.currentStyle.StageObjectBorderColor,
    );
    // 虚线 2
    CurveRenderer.renderDashedLine(
      Renderer.transformWorld2View(leftTopLocation.add(new Vector(0, PortalNode.PATH_LINE_Y))),
      Renderer.transformWorld2View(rightTopLocation.add(new Vector(0, PortalNode.PATH_LINE_Y))),
      StageStyleManager.currentStyle.StageObjectBorderColor,
      1 * Camera.currentScale,
      5 * Camera.currentScale,
    );
    // 绘制文件路径文字
    TextRenderer.renderText(
      `path: "${portalNode.portalFilePath}"`,
      Renderer.transformWorld2View(
        leftTopLocation.add(new Vector(0, PortalNode.TITLE_LINE_Y)).add(Vector.same(Renderer.NODE_PADDING)),
      ),
      Renderer.FONT_SIZE_DETAILS * Camera.currentScale,
      StageStyleManager.currentStyle.StageObjectBorderColor,
    );

    // 选中状态
    if (portalNode.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(portalNode.collisionBox, StageStyleManager.currentStyle.CollideBoxSelectedColor);
    }
    // 绘制实体详情
    EntityRenderer.renderEntityDetails(portalNode);

    // 绘制debug信息
    if (Renderer.isShowDebug) {
      TextRenderer.renderMultiLineText(
        `${portalNode.title}, [${portalNode.portalFilePath}]\n${portalNode.targetLocation.toString()}`,
        Renderer.transformWorld2View(portalNode.location),
        10 * Camera.currentScale,
        1000 * Camera.currentScale,
        StageStyleManager.currentStyle.DetailsDebugTextColor,
      );
    }

    renderHoverState(portalNode);
  }

  function renderHoverState(portalNode: PortalNode) {
    const mouseLocation = Renderer.transformView2World(MouseLocation.vector());
    const bodyRectangle = portalNode.collisionBox.getRectangle();
    if (bodyRectangle.isPointIn(mouseLocation)) {
      const titleRectangle = portalNode.titleRectangleArea();
      const pathRectangle = portalNode.pathRectangleArea();
      if (titleRectangle.isPointIn(mouseLocation)) {
        // 鼠标在标题区域
        // 绘制矩形
        ShapeRenderer.renderRect(
          titleRectangle.transformWorld2View(),
          StageStyleManager.currentStyle.CollideBoxPreSelectedColor,
          StageStyleManager.currentStyle.CollideBoxSelectedColor,
          2 * Camera.currentScale,
          Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
        );
        // 绘制悬浮提示文字
        TextRenderer.renderText(
          "双击编辑标题",
          Renderer.transformWorld2View(bodyRectangle.leftBottom.add(Vector.same(Renderer.NODE_PADDING))),
          Renderer.FONT_SIZE_DETAILS * Camera.currentScale,
          StageStyleManager.currentStyle.DetailsDebugTextColor,
        );
      } else if (pathRectangle.isPointIn(mouseLocation)) {
        // 鼠标在路径区域
        // 绘制矩形
        ShapeRenderer.renderRect(
          pathRectangle.transformWorld2View(),
          StageStyleManager.currentStyle.CollideBoxPreSelectedColor,
          StageStyleManager.currentStyle.CollideBoxSelectedColor,
          2 * Camera.currentScale,
          Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
        );
        // 绘制悬浮提示文字
        TextRenderer.renderText(
          "双击编辑相对路径",
          Renderer.transformWorld2View(bodyRectangle.leftBottom.add(Vector.same(Renderer.NODE_PADDING))),
          Renderer.FONT_SIZE_DETAILS * Camera.currentScale,
          StageStyleManager.currentStyle.DetailsDebugTextColor,
        );
      } else {
        // 鼠标在节点区域
        // 绘制矩形
        TextRenderer.renderTextFromCenter(
          "双击传送",
          Renderer.transformWorld2View(portalNode.rectangle.center),
          Renderer.FONT_SIZE * Camera.currentScale,
          StageStyleManager.currentStyle.CollideBoxPreSelectedColor.toSolid(),
        );
      }
    }
  }

  export function renderBackground(portalNode: PortalNode) {
    // 绘制背景
    ShapeRenderer.renderRect(
      portalNode.rectangle.transformWorld2View(),
      StageStyleManager.currentStyle.BackgroundColor,
      Color.Transparent,
      0,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
  }

  // /**
  //  * 渲染子舞台
  //  * @param portalNode
  //  */
  // function renderChildStage(portalNode: PortalNode) {
  //   // 拿到绝对路径
  //   // 根据绝对路径拿到缓存 pathString: 序列化对象
  //   //  // 直接把序列化对象进行渲染？
  //   //  // 好像太麻烦了，尤其是连线的渲染还要各种计算。
  //   //  // 不如直接在这个函数中临时改摄像机位置然后渲染完毕再恢复。
  //   // 偷梁换柱法，先记录摄像机位置，然后改StageManager里面的数据。
  // }
}
