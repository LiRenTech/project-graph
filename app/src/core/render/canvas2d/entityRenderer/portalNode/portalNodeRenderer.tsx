import { Color } from "../../../../dataStruct/Color";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Project, service } from "../../../../Project";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { PortalNode } from "../../../../stage/stageObject/entity/PortalNode";
import { Renderer } from "../../renderer";

@service("portalNodeRenderer")
export class PortalNodeRenderer {
  constructor(private readonly project: Project) {}

  /**
   * 主渲染
   * @param portalNode
   */
  render(portalNode: PortalNode) {
    const leftTopLocation = portalNode.location;
    const rightTopLocation = portalNode.collisionBox.getRectangle().rightTop;
    // 绘制矩形
    this.project.shapeRenderer.renderRect(
      this.project.renderer.transformWorld2View(new Rectangle(leftTopLocation, portalNode.size)),
      portalNode.color,
      StageStyleManager.currentStyle.StageObjectBorder,
      2 * this.project.camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
    );
    // 虚线 1
    this.project.curveRenderer.renderDashedLine(
      this.project.renderer.transformWorld2View(leftTopLocation.add(new Vector(0, PortalNode.TITLE_LINE_Y))),
      this.project.renderer.transformWorld2View(rightTopLocation.add(new Vector(0, PortalNode.TITLE_LINE_Y))),
      StageStyleManager.currentStyle.StageObjectBorder,
      1 * this.project.camera.currentScale,
      10 * this.project.camera.currentScale,
    );
    // 绘制标题，和节点文字大小保持一致
    this.project.textRenderer.renderOneLineText(
      portalNode.title,
      this.project.renderer.transformWorld2View(leftTopLocation.add(Vector.same(Renderer.NODE_PADDING))),
      Renderer.FONT_SIZE * this.project.camera.currentScale,
      StageStyleManager.currentStyle.StageObjectBorder,
    );
    // 虚线 2
    this.project.curveRenderer.renderDashedLine(
      this.project.renderer.transformWorld2View(leftTopLocation.add(new Vector(0, PortalNode.PATH_LINE_Y))),
      this.project.renderer.transformWorld2View(rightTopLocation.add(new Vector(0, PortalNode.PATH_LINE_Y))),
      StageStyleManager.currentStyle.StageObjectBorder,
      1 * this.project.camera.currentScale,
      5 * this.project.camera.currentScale,
    );
    // 绘制文件路径文字
    this.project.textRenderer.renderOneLineText(
      `path: "${portalNode.portalFilePath}"`,
      this.project.renderer.transformWorld2View(
        leftTopLocation.add(new Vector(0, PortalNode.TITLE_LINE_Y)).add(Vector.same(Renderer.NODE_PADDING)),
      ),
      Renderer.FONT_SIZE_DETAILS * this.project.camera.currentScale,
      StageStyleManager.currentStyle.StageObjectBorder,
    );

    // 选中状态
    if (portalNode.isSelected) {
      // 在外面增加一个框
      this.project.collisionBoxRenderer.render(
        portalNode.collisionBox,
        StageStyleManager.currentStyle.CollideBoxSelected,
      );
    }
    // 绘制实体详情
    this.project.entityRenderer.renderEntityDetails(portalNode);

    // 绘制debug信息
    if (this.project.renderer.isShowDebug) {
      this.project.textRenderer.renderMultiLineText(
        `${portalNode.title}, [${portalNode.portalFilePath}]\n${portalNode.targetLocation.toString()}`,
        this.project.renderer.transformWorld2View(portalNode.location),
        10 * this.project.camera.currentScale,
        1000 * this.project.camera.currentScale,
        StageStyleManager.currentStyle.DetailsDebugText,
      );
    }

    this.renderHoverState(portalNode);
  }

  private renderHoverState(portalNode: PortalNode) {
    const mouseLocation = this.project.renderer.transformView2World(this.project.mouseLocation.vector());
    const bodyRectangle = portalNode.collisionBox.getRectangle();
    if (bodyRectangle.isPointIn(mouseLocation)) {
      const titleRectangle = portalNode.titleRectangleArea();
      const pathRectangle = portalNode.pathRectangleArea();
      if (titleRectangle.isPointIn(mouseLocation)) {
        // 鼠标在标题区域
        // 绘制矩形
        this.project.shapeRenderer.renderRect(
          this.project.renderer.transformWorld2View(titleRectangle),
          StageStyleManager.currentStyle.CollideBoxPreSelected,
          StageStyleManager.currentStyle.CollideBoxSelected,
          2 * this.project.camera.currentScale,
          Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
        );
        // 绘制悬浮提示文字
        this.project.textRenderer.renderOneLineText(
          "双击编辑标题",
          this.project.renderer.transformWorld2View(bodyRectangle.leftBottom.add(Vector.same(Renderer.NODE_PADDING))),
          Renderer.FONT_SIZE_DETAILS * this.project.camera.currentScale,
          StageStyleManager.currentStyle.DetailsDebugText,
        );
      } else if (pathRectangle.isPointIn(mouseLocation)) {
        // 鼠标在路径区域
        // 绘制矩形
        this.project.shapeRenderer.renderRect(
          this.project.renderer.transformWorld2View(pathRectangle),
          StageStyleManager.currentStyle.CollideBoxPreSelected,
          StageStyleManager.currentStyle.CollideBoxSelected,
          2 * this.project.camera.currentScale,
          Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
        );
        // 绘制悬浮提示文字
        this.project.textRenderer.renderOneLineText(
          "双击编辑相对路径",
          this.project.renderer.transformWorld2View(bodyRectangle.leftBottom.add(Vector.same(Renderer.NODE_PADDING))),
          Renderer.FONT_SIZE_DETAILS * this.project.camera.currentScale,
          StageStyleManager.currentStyle.DetailsDebugText,
        );
      } else {
        // 鼠标在节点区域
        // 绘制矩形
        this.project.textRenderer.renderTextFromCenter(
          "双击传送",
          this.project.renderer.transformWorld2View(portalNode.rectangle.center),
          Renderer.FONT_SIZE * this.project.camera.currentScale,
          StageStyleManager.currentStyle.CollideBoxPreSelected.toSolid(),
        );
      }
    }
  }

  renderBackground(portalNode: PortalNode) {
    // 绘制背景
    this.project.shapeRenderer.renderRect(
      this.project.renderer.transformWorld2View(portalNode.rectangle),
      StageStyleManager.currentStyle.Background,
      Color.Transparent,
      0,
      Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
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
