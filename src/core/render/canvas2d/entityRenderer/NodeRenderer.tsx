import { Color } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { TextNode } from "../../../stageObject/TextNode";
import { Camera } from "../../../stage/Camera";
import { Renderer } from "../renderer";
import { RenderUtils } from "../RenderUtils";

/**
 * 处理节点相关的绘制
 */
export namespace NodeRenderer {
  export function renderNode(node: TextNode) {
    // 节点身体矩形
    RenderUtils.renderRect(
      new Rectangle(
        Renderer.transformWorld2View(node.rectangle.location),
        node.rectangle.size.multiply(Camera.currentScale),
      ),
      node.color,
      new Color(204, 204, 204, 1),
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );

    if (!node.isEditing) {
      RenderUtils.renderText(
        node.text,
        Renderer.transformWorld2View(
          node.rectangle.location.add(Vector.same(Renderer.NODE_PADDING)),
        ),
        Renderer.FONT_SIZE * Camera.currentScale,
        colorInvert(node.color),
      );
    }

    if (node.isSelected) {
      // 在外面增加一个框
      RenderUtils.renderRect(
        new Rectangle(
          Renderer.transformWorld2View(
            node.rectangle.location.subtract(Vector.same(7.5)),
          ),
          node.rectangle.size
            .add(Vector.same(15))
            .multiply(Camera.currentScale),
        ),
        new Color(0, 0, 0, 0),
        new Color(255, 255, 255, 0.5),
        2 * Camera.currentScale,
        16 * Camera.currentScale,
      );
    }

    if (node.details && !node.isEditingDetails) {
      RenderUtils.renderMultiLineText(
        node.details,
        Renderer.transformWorld2View(
          node.rectangle.location.add(new Vector(0, node.rectangle.size.y)),
        ),
        Renderer.FONT_SIZE_DETAILS * Camera.currentScale,
        Renderer.NODE_DETAILS_WIDTH * Camera.currentScale,
      );
    }
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
}
