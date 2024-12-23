import { Color } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { v4 } from "uuid";
import { Renderer } from "../canvas2d/renderer";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { getTextSize } from "../../../utils/font";

/**
 * 专门存放生成svg的东西
 */
export namespace SvgUtils {
  export function line(
    start: Vector,
    end: Vector,
    strokeColor: Color,
    strokeWidth: number,
  ): React.ReactNode {
    return (
      <line
        key={v4()}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={strokeColor.toString()}
        strokeWidth={strokeWidth}
      />
    );
  }

  export function textFromCenter(
    text: string,
    location: Vector,
    fontSize: number,
    color: Color,
  ) {
    return (
      // 这里居中实际上还没完全居中，垂直方向有点问题
      <text
        x={location.x}
        y={location.y + Renderer.NODE_PADDING}
        key={v4()}
        fill={color.toString()}
        fontSize={fontSize}
        textAnchor="middle"
        fontFamily="MiSans"
      >
        {text}
      </text>
    );
  }

  export function textFromLeftTop(
    text: string,
    location: Vector,
    fontSize: number,
    color: Color,
  ) {
    const textSize = getTextSize(text, fontSize);
    return (
      <text
        x={location.x + Renderer.NODE_PADDING}
        y={location.y + textSize.y / 2 + Renderer.NODE_PADDING}
        key={v4()}
        fill={color.toString()}
        fontSize={fontSize}
        textAnchor="start"
        fontFamily="MiSans"
      >
        {text}
      </text>
    );
  }

  export function rectangle(
    rectangle: Rectangle,
    fillColor: Color,
    strokeColor: Color,
    strokeWidth: number,
  ) {
    return (
      <rect
        key={v4()}
        x={rectangle.location.x}
        y={rectangle.location.y}
        width={rectangle.size.x}
        height={rectangle.size.y}
        rx={Renderer.NODE_ROUNDED_RADIUS}
        ry={Renderer.NODE_ROUNDED_RADIUS}
        fill={fillColor.toString()}
        stroke={strokeColor.toString()}
        strokeWidth={strokeWidth}
      />
    );
  }
}
