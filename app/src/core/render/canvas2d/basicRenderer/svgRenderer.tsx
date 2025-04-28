import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";

export namespace SvgRenderer {
  const svgCache: { [key: string]: HTMLImageElement } = {};

  export function renderSvgFromLeftTop(svg: string, location: Vector, width: number, height: number): void {
    if (svg in svgCache) {
      Canvas.ctx.drawImage(svgCache[svg], location.x, location.y, width, height);
    } else {
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svg);
      img.onload = () => {
        svgCache[svg] = img;
      };
    }
  }

  export function renderSvgFromCenter(svg: string, centerLocation: Vector, width: number, height: number): void {
    if (svg in svgCache) {
      Canvas.ctx.drawImage(svgCache[svg], centerLocation.x - width / 2, centerLocation.y - height / 2, width, height);
    } else {
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svg);
      img.onload = () => {
        svgCache[svg] = img;
      };
    }
  }

  export function renderSvgFromLeftTopWithoutSize(svg: string, location: Vector, scaleNumber = 1): void {
    if (svg in svgCache) {
      const img = svgCache[svg];
      Canvas.ctx.drawImage(
        svgCache[svg],
        location.x,
        location.y,
        img.naturalWidth * Camera.currentScale * scaleNumber,
        img.naturalHeight * Camera.currentScale * scaleNumber,
      );
    } else {
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svg);
      img.onload = () => {
        svgCache[svg] = img;
      };
    }
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
    if (svg in svgCache) {
      const img = svgCache[svg];
      Canvas.ctx.drawImage(
        svgCache[svg],
        centerLocation.x - (img.naturalWidth / 2) * Camera.currentScale,
        centerLocation.y - (img.naturalHeight / 2) * Camera.currentScale,
        img.naturalWidth * Camera.currentScale,
        img.naturalHeight * Camera.currentScale,
      );
    } else {
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svg);
      img.onload = () => {
        svgCache[svg] = img;
      };
    }
  }
}
