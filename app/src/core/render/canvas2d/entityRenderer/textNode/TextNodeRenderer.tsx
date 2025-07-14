import { Color, colorInvert, Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { Random } from "../../../../algorithm/random";
import { Project, service } from "../../../../Project";
import {
  getLogicNodeRenderName,
  LogicNodeNameEnum,
  LogicNodeNameToRenderNameMap,
} from "../../../../service/dataGenerateService/autoComputeEngine/logicNodeNameEnum";
import { Settings } from "../../../../service/Settings";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { Renderer } from "../../renderer";

@service("textNodeRenderer")
export class TextNodeRenderer {
  private showTextNodeBorder = true;

  // 初始化时监听设置变化
  constructor(private readonly project: Project) {
    Settings.watch("showTextNodeBorder", (value) => {
      this.showTextNodeBorder = value;
    });
  }

  renderTextNode(node: TextNode) {
    // 节点身体矩形
    let fillColor = node.color;
    if (
      this.project.camera.currentScale < this.project.renderer.ignoreTextNodeTextRenderLessThanCameraScale &&
      fillColor.a === 0
    ) {
      const color = this.project.stageStyleManager.currentStyle.StageObjectBorder.clone();
      color.a = 0.2;
      fillColor = color;
    }
    const borderColor = this.showTextNodeBorder
      ? this.project.stageStyleManager.currentStyle.StageObjectBorder
      : Color.Transparent;
    this.project.shapeRenderer.renderRect(
      new Rectangle(
        this.project.renderer.transformWorld2View(node.rectangle.location),
        node.rectangle.size.multiply(this.project.camera.currentScale),
      ),
      fillColor,
      borderColor,
      2 * this.project.camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
    );

    // 视野缩放过小就不渲染内部文字
    if (this.project.camera.currentScale > this.project.renderer.ignoreTextNodeTextRenderLessThanCameraScale) {
      this.renderTextNodeTextLayer(node);
    }

    if (node.isSelected) {
      // 在外面增加一个框
      this.project.collisionBoxRenderer.render(
        node.collisionBox,
        this.project.stageStyleManager.currentStyle.CollideBoxSelected,
      );
      // 改变大小的拖拽
      if (node.sizeAdjust === "manual") {
        this.project.shapeRenderer.renderRect(
          this.project.renderer.transformWorld2View(node.getResizeHandleRect()),
          this.project.stageStyleManager.currentStyle.CollideBoxSelected,
          this.project.stageStyleManager.currentStyle.StageObjectBorder,
          2 * this.project.camera.currentScale,
          8 * this.project.camera.currentScale,
        );
      }
    }
    if (node.isAiGenerating) {
      const borderColor = this.project.stageStyleManager.currentStyle.CollideBoxSelected.clone();
      borderColor.a = Random.randomFloat(0.2, 1);
      // 在外面增加一个框
      this.project.shapeRenderer.renderRect(
        new Rectangle(
          this.project.renderer.transformWorld2View(node.rectangle.location),
          node.rectangle.size.multiply(this.project.camera.currentScale),
        ),
        node.color,
        borderColor,
        Random.randomFloat(1, 10) * this.project.camera.currentScale,
        Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
      );
    }
    // 用户不建议放大标签，所以这里注释掉了，但又有用户觉得这个也挺好，所以加个设置项
    if (this.project.renderer.enableTagTextNodesBigDisplay) {
      if (this.project.stageManager.TagOptions.getTagUUIDs().includes(node.uuid)) {
        if (this.project.camera.currentScale < 0.25) {
          const scaleRate = 5;
          const rect = node.collisionBox.getRectangle();

          const rectBgc =
            node.color.a === 0 ? this.project.stageStyleManager.currentStyle.Background.clone() : node.color.clone();
          rectBgc.a = 0.5;

          this.project.shapeRenderer.renderRectFromCenter(
            this.project.renderer.transformWorld2View(rect.center),
            rect.width * scaleRate * this.project.camera.currentScale,
            rect.height * scaleRate * this.project.camera.currentScale,
            rectBgc,
            this.project.stageStyleManager.currentStyle.StageObjectBorder,
            2 * this.project.camera.currentScale,
            Renderer.NODE_ROUNDED_RADIUS * scaleRate * this.project.camera.currentScale,
          );
          this.project.textRenderer.renderTextFromCenter(
            node.text,
            this.project.renderer.transformWorld2View(rect.center),
            Renderer.FONT_SIZE * scaleRate * this.project.camera.currentScale,
            this.project.stageStyleManager.currentStyle.StageObjectBorder,
          );
        }
      }
    }
    if (this.project.camera.currentScale > this.project.renderer.ignoreTextNodeTextRenderLessThanCameraScale) {
      this.project.entityRenderer.renderEntityDetails(node);
    }
  }

  /**
   * 画节点文字层信息
   * @param node
   */
  private renderTextNodeTextLayer(node: TextNode) {
    // 编辑状态
    if (node.isEditing) {
      // 编辑状态下，显示一些提示信息
      // this.project.textRenderer.renderText(
      //   "Esc 或 Ctrl+Enter 退出编辑状态",
      //   Renderer.transformWorld2View(
      //     node.rectangle.location.add(new Vector(0, -25)),
      //   ),
      //   20 * Camera.currentScale,
      //   this.project.stageStyleManager.currentStyle.GridHeavyColor,
      // );
      return;
    }

    if (node.text === undefined) {
      this.project.textRenderer.renderTextFromCenter(
        "undefined",
        this.project.renderer.transformWorld2View(node.rectangle.center),
        Renderer.FONT_SIZE * this.project.camera.currentScale,
        node.color.a === 1
          ? colorInvert(node.color)
          : colorInvert(this.project.stageStyleManager.currentStyle.Background),
      );
    } else if (this.project.autoComputeUtils.isNameIsLogicNode(node.text)) {
      // 检查下是不是逻辑节点
      let isFindLogicName = false;
      for (const key of Object.keys(LogicNodeNameToRenderNameMap)) {
        if (node.text === key) {
          isFindLogicName = true;
          const logicNodeName = key as LogicNodeNameEnum;
          this.project.textRenderer.renderTextFromCenter(
            getLogicNodeRenderName(logicNodeName),
            this.project.renderer.transformWorld2View(node.rectangle.center),
            Renderer.FONT_SIZE * this.project.camera.currentScale,
            node.color.a === 1
              ? colorInvert(node.color)
              : colorInvert(this.project.stageStyleManager.currentStyle.Background),
          );
        }
      }
      if (!isFindLogicName) {
        // 未知的逻辑节点，可能是版本过低
        this.project.textRenderer.renderTextFromCenter(
          node.text,
          this.project.renderer.transformWorld2View(node.rectangle.center),
          Renderer.FONT_SIZE * this.project.camera.currentScale,
          node.color.a === 1
            ? colorInvert(node.color)
            : colorInvert(this.project.stageStyleManager.currentStyle.Background),
        );
        this.project.shapeRenderer.renderRect(
          new Rectangle(
            this.project.renderer.transformWorld2View(
              node.rectangle.location.add(new Vector(Random.randomInt(-5, 5), Random.randomInt(-5, 5))),
            ),
            node.rectangle.size.multiply(this.project.camera.currentScale),
          ),
          node.color,
          new Color(255, 0, 0, 0.5),
          Random.randomFloat(1, 10) * this.project.camera.currentScale,
          Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
        );
      }
    } else {
      this.project.textRenderer.renderMultiLineText(
        node.text,
        this.project.renderer.transformWorld2View(
          node.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)).add(new Vector(0, Renderer.FONT_SIZE / 4)),
        ),
        Renderer.FONT_SIZE * this.project.camera.currentScale,
        // Infinity,
        node.sizeAdjust === "manual"
          ? (node.rectangle.size.x - Renderer.NODE_PADDING * 2) * this.project.camera.currentScale
          : Infinity,
        node.color.a === 1
          ? colorInvert(node.color)
          : colorInvert(this.project.stageStyleManager.currentStyle.Background),
        1.5,
      );
    }
  }
}
