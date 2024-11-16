import { StringDict } from "../../dataStruct/StringDict";
import { Vector } from "../../dataStruct/Vector";
import { Camera } from "../../stage/Camera";
import { Canvas } from "../../stage/Canvas";

/**
 * 图片渲染器
 */
export namespace ImageRenderer {
  // 有待改成长字符串缓存字典，并测试性能对比
  const imageBase64Cache: StringDict<HTMLImageElement> = StringDict.create();

  export function getImageSizeByBase64(imageBase64: string): Vector {
    if (imageBase64Cache.hasId(imageBase64)) {
      const imageElement = imageBase64Cache.getById(imageBase64);
      if (imageElement) {
        return new Vector(imageElement.width, imageElement.height);
      }
    }
    return new Vector(0, 0);
  }

  /**
   * 根据base64编码字符串来渲染出图片
   * @param imageBase64 base64编码的图片字符串，不包含前缀data:image/png;base64,
   * @param location
   */
  export function renderPngBase64FromLeftTop(
    imageBase64: string,
    location: Vector,
  ) {
    if (imageBase64Cache.hasId(imageBase64)) {
      const imageElement = imageBase64Cache.getById(imageBase64);
      if (imageElement) {
        Canvas.ctx.drawImage(
          imageElement,
          location.x,
          location.y,
          imageElement.width * Camera.currentScale,
          imageElement.height * Camera.currentScale,
        );
      }
    } else {
      // 字典中没有，则创建，并缓存
      const imageElement = new Image();
      imageElement.src = `data:image/png;base64,${imageBase64}`;
      imageElement.onload = () => {
        imageBase64Cache.setById(imageBase64, imageElement);
        // 调整碰撞箱大小
      };
    }
  }

  export function renderImageElement(
    imageElement: HTMLImageElement,
    location: Vector,
  ) {
    Canvas.ctx.drawImage(
      imageElement,
      location.x,
      location.y,
      imageElement.width * Camera.currentScale,
      imageElement.height * Camera.currentScale,
    );
  }
}
