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
        x1={start.x.toFixed(1)}
        y1={start.y.toFixed(1)}
        x2={end.x.toFixed(1)}
        y2={end.y.toFixed(1)}
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
        x={(location.x + Renderer.NODE_PADDING).toFixed(1)}
        y={(location.y + textSize.y / 2 + Renderer.NODE_PADDING).toFixed(1)}
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
        x={rectangle.location.x.toFixed(1)}
        y={rectangle.location.y.toFixed(1)}
        width={rectangle.size.x.toFixed(1)}
        height={rectangle.size.y.toFixed(1)}
        rx={Renderer.NODE_ROUNDED_RADIUS}
        ry={Renderer.NODE_ROUNDED_RADIUS}
        fill={fillColor.toString()}
        stroke={strokeColor.toString()}
        strokeWidth={strokeWidth}
      />
    );
  }
}
