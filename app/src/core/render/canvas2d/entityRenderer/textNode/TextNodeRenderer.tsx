import { Random } from "../../../../algorithm/random";
import { Color, colorInvert } from "../../../../dataStruct/Color";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { AutoComputeUtils } from "../../../../service/dataGenerateService/autoComputeEngine/AutoComputeUtils";
import { Settings } from "../../../../service/Settings";
import {
  getLogicNodeRenderName,
  LogicNodeNameEnum,
  LogicNodeNameToRenderNameMap,
} from "../../../../service/dataGenerateService/autoComputeEngine/logicNodeNameEnum";
import { StageStyleManager } from "../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../stage/Camera";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../basicRenderer/textRenderer";
import { Renderer } from "../../renderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { EntityRenderer } from "../EntityRenderer";

export namespace TextNodeRenderer {
  let showTextNodeBorder = true;

  // 初始化时监听设置变化
  export function init() {
    Settings.watch("showTextNodeBorder", (value) => {
      showTextNodeBorder = value;
    });
  }

  export function renderTextNode(node: TextNode) {
    // 节点身体矩形
    let fillColor = node.color;
    if (Camera.currentScale < Renderer.ignoreTextNodeTextRenderLessThanCameraScale && fillColor.a === 0) {
      const color = StageStyleManager.currentStyle.StageObjectBorder.clone();
      color.a = 0.2;
      fillColor = color;
    }
    const borderColor = showTextNodeBorder ? StageStyleManager.currentStyle.StageObjectBorder : Color.Transparent;
    ShapeRenderer.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(node.rectangle.location),
        node.rectangle.size.multiply(Camera.currentScale),
      ),
      fillColor,
      borderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );

    // 视野缩放过小就不渲染内部文字
    if (Camera.currentScale > Renderer.ignoreTextNodeTextRenderLessThanCameraScale) {
      renderTextNodeTextLayer(node);
    }

    if (node.isSelected) {
      // 在外面增加一个框
      CollisionBoxRenderer.render(node.collisionBox, StageStyleManager.currentStyle.CollideBoxSelected);
      // 改变大小的拖拽
      if (node.sizeAdjust === "manual") {
        ShapeRenderer.renderRect(
          node.getResizeHandleRect().transformWorld2View(),
          StageStyleManager.currentStyle.CollideBoxSelected,
          StageStyleManager.currentStyle.StageObjectBorder,
          2 * Camera.currentScale,
          8 * Camera.currentScale,
        );
      }
    }
    if (node.isAiGenerating) {
      const borderColor = StageStyleManager.currentStyle.CollideBoxSelected.clone();
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
    // 用户不建议放大标签，所以这里注释掉了，但又有用户觉得这个也挺好，所以加个设置项
    if (Renderer.enableTagTextNodesBigDisplay) {
      if (StageManager.TagOptions.getTagUUIDs().includes(node.uuid)) {
        if (Camera.currentScale < 0.25) {
          const scaleRate = 5;
          const rect = node.collisionBox.getRectangle();

          const rectBgc = node.color.a === 0 ? StageStyleManager.currentStyle.Background.clone() : node.color.clone();
          rectBgc.a = 0.5;

          ShapeRenderer.renderRectFromCenter(
            Renderer.transformWorld2View(rect.center),
            rect.width * scaleRate * Camera.currentScale,
            rect.height * scaleRate * Camera.currentScale,
            rectBgc,
            StageStyleManager.currentStyle.StageObjectBorder,
            2 * Camera.currentScale,
            Renderer.NODE_ROUNDED_RADIUS * scaleRate * Camera.currentScale,
          );
          TextRenderer.renderTextFromCenter(
            node.text,
            Renderer.transformWorld2View(rect.center),
            Renderer.FONT_SIZE * scaleRate * Camera.currentScale,
            StageStyleManager.currentStyle.StageObjectBorder,
          );
        }
      }
    }
    if (Camera.currentScale > Renderer.ignoreTextNodeTextRenderLessThanCameraScale) {
      EntityRenderer.renderEntityDetails(node);
    }
  }

  /**
   * 画节点文字层信息
   * @param node
   */
  function renderTextNodeTextLayer(node: TextNode) {
    // 编辑状态
    if (node.isEditing) {
      // 编辑状态下，显示一些提示信息
      // TextRenderer.renderText(
      //   "Esc 或 Ctrl+Enter 退出编辑状态",
      //   Renderer.transformWorld2View(
      //     node.rectangle.location.add(new Vector(0, -25)),
      //   ),
      //   20 * Camera.currentScale,
      //   StageStyleManager.currentStyle.GridHeavyColor,
      // );
      return;
    }

    if (node.text === undefined) {
      TextRenderer.renderTextFromCenter(
        "undefined",
        Renderer.transformWorld2View(node.rectangle.center),
        Renderer.FONT_SIZE * Camera.currentScale,
        node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.Background),
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
            node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.Background),
          );
        }
      }
      if (!isFindLogicName) {
        // 未知的逻辑节点，可能是版本过低
        TextRenderer.renderTextFromCenter(
          node.text,
          Renderer.transformWorld2View(node.rectangle.center),
          Renderer.FONT_SIZE * Camera.currentScale,
          node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.Background),
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
        node.text,
        Renderer.transformWorld2View(
          node.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)).add(new Vector(0, Renderer.FONT_SIZE / 4)),
        ),
        Renderer.FONT_SIZE * Camera.currentScale,
        // Infinity,
        node.sizeAdjust === "manual"
          ? (node.rectangle.size.x - Renderer.NODE_PADDING * 2) * Camera.currentScale
          : Infinity,
        node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.Background),
        1.5,
      );
    }
  }
}
