import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";

export namespace SvgRenderer {
  export function renderSvgFromLeftTop(svg: string, location: Vector, width: number, height: number): void {
    const data = svg;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    Canvas.ctx.drawImage(img, location.x, location.y, width, height);
  }

  export function renderSvgFromCenter(svg: string, centerLocation: Vector, width: number, height: number): void {
    const data = svg;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    Canvas.ctx.drawImage(img, centerLocation.x - width / 2, centerLocation.y - height / 2, width, height);
  }

  export function renderSvgFromLeftTopWithoutSize(svg: string, location: Vector, scaleNumber = 1): void {
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svg);
    Canvas.ctx.drawImage(
      img,
      location.x,
      location.y,
      img.naturalWidth * Camera.currentScale * scaleNumber,
      img.naturalHeight * Camera.currentScale * scaleNumber,
    );
  }

  export async function getSvgOriginalSize(svg: string): Promise<Vector> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(new Vector(img.naturalWidth, img.naturalHeight));
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = "data:image/svg+xml;base64," + btoa(svg);
    });
  }

  export function renderSvgFromCenterWithoutSize(svg: string, centerLocation: Vector): void {
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svg);
    Canvas.ctx.drawImage(
      img,
      centerLocation.x - (img.naturalWidth / 2) * Camera.currentScale,
      centerLocation.y - (img.naturalHeight / 2) * Camera.currentScale,
      img.naturalWidth * Camera.currentScale,
      img.naturalHeight * Camera.currentScale,
    );
  }
}
