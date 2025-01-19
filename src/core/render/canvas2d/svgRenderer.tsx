import { Vector } from "../../dataStruct/Vector";
import { Canvas } from "../../stage/Canvas";

export namespace SvgRenderer {
  export function renderSvgFromLeftTop(
    svg: string,
    location: Vector,
    width: number,
    height: number,
  ): void {
    const data = svg;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    Canvas.ctx.drawImage(img, location.x, location.y, width, height);
  }

  export function renderSvgFromCenter(
    svg: string,
    centerLocation: Vector,
    width: number,
    height: number,
  ): void {
    const data = svg;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    Canvas.ctx.drawImage(
      img,
      centerLocation.x - width / 2,
      centerLocation.y - height / 2,
      width,
      height,
    );
  }
}
