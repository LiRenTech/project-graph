import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { MouseLocation } from "../../../MouseLocation";
import { SoundService } from "../../../SoundService";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { ConnectableEntity } from "../../../stageObject/StageObject";
import { Camera } from "../../Camera";

/**
 * 直接获取输入节点和下游输出节点
 * 然后直接通过函数来进行更改
 *
 * 这些函数需要普遍遵守签名：
 * fatherNodes: 父节点数组
 * childNodes: 子节点数组
 * 返回值：额外生成的节点数组，如果当前子节点数量不够则自主创建
 */
export namespace NodeLogic {
  /**
   * 输入三个数字节点，并将所有的孩子节点更改为相应的颜色
   * @param fatherNodes
   * @param childNodes
   * @returns
   */
  export function rgb(
    fatherNodes: ConnectableEntity[],
    childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length !== 3) {
      return [];
    }
    const fatherNode1 = fatherNodes[0];
    const fatherNode2 = fatherNodes[1];
    const fatherNode3 = fatherNodes[2];
    if (
      fatherNode1 instanceof TextNode &&
      fatherNode2 instanceof TextNode &&
      fatherNode3 instanceof TextNode
    ) {
      const r = parseInt(fatherNode1.text);
      const g = parseInt(fatherNode2.text);
      const b = parseInt(fatherNode3.text);
      childNodes.forEach((node) => {
        if (node instanceof TextNode) {
          node.color = new Color(r, g, b);
        }
      });
    }
    return [];
  }

  export function rgba(
    fatherNodes: ConnectableEntity[],
    childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length !== 4) {
      return [];
    }
    const fatherNode1 = fatherNodes[0];
    const fatherNode2 = fatherNodes[1];
    const fatherNode3 = fatherNodes[2];
    const fatherNode4 = fatherNodes[3];
    if (
      fatherNode1 instanceof TextNode &&
      fatherNode2 instanceof TextNode &&
      fatherNode3 instanceof TextNode &&
      fatherNode4 instanceof TextNode
    ) {
      const r = parseInt(fatherNode1.text);
      const g = parseInt(fatherNode2.text);
      const b = parseInt(fatherNode3.text);
      const a = parseFloat(fatherNode4.text);
      childNodes.forEach((node) => {
        if (node instanceof TextNode) {
          node.color = new Color(r, g, b, a);
        }
      });
    }
    return [];
  }

  export function getLocation(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    // 只获取第一个父节点元素
    if (fatherNodes.length < 1) {
      return [];
    }
    const fatherNode = fatherNodes[0];
    const location = fatherNode.collisionBox.getRectangle().location;
    return [location.x.toString(), location.y.toString()];
  }

  export function setLocation(
    fatherNodes: ConnectableEntity[],
    childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 2) {
      return [];
    }
    const fatherNode1 = fatherNodes[0];
    const fatherNode2 = fatherNodes[1];
    if (
      fatherNode1 instanceof TextNode &&
      fatherNode2 instanceof TextNode &&
      childNodes.length > 0
    ) {
      const x = parseFloat(fatherNode1.text);
      const y = parseFloat(fatherNode2.text);
      childNodes.forEach((node) => {
        if (node instanceof TextNode) {
          node.moveTo(new Vector(x, y));
        }
      });
    }
    return [];
  }

  export function getSize(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    // 只获取第一个父节点元素
    if (fatherNodes.length < 1) {
      return [];
    }
    const fatherNode = fatherNodes[0];
    const size = fatherNode.collisionBox.getRectangle().size;
    return [size.x.toString(), size.y.toString()];
  }

  export function getMouseLocation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    const mouseLocation = MouseLocation.vector();
    return [mouseLocation.x.toString(), mouseLocation.y.toString()];
  }

  export function getCameraLocation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    const cameraLocation = Camera.location;
    return [cameraLocation.x.toString(), cameraLocation.y.toString()];
  }

  export function setCameraLocation(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 2) {
      return [];
    }
    const fatherNode1 = fatherNodes[0];
    const fatherNode2 = fatherNodes[1];
    if (fatherNode1 instanceof TextNode && fatherNode2 instanceof TextNode) {
      const x = parseFloat(fatherNode1.text);
      const y = parseFloat(fatherNode2.text);
      Camera.location = new Vector(x, y);
    }
    return [];
  }

  export function getCameraScale(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    const cameraScale = Camera.currentScale;
    return [cameraScale.toString()];
  }

  export function setCameraScale(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 1) {
      return [];
    }
    const fatherNode = fatherNodes[0];
    if (fatherNode instanceof TextNode) {
      const scale = parseFloat(fatherNode.text);
      Camera.targetScale = scale;
    }
    return [];
  }

  export function isCollision(
    fatherNodes: ConnectableEntity[],
    childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 1) {
      return ["0"];
    }
    const fatherNode = fatherNodes[0];
    const isCollision = childNodes.some((node) => {
      return node.collisionBox.isIntersectsWithRectangle(
        fatherNode.collisionBox.getRectangle(),
      );
    });
    return [isCollision ? "1" : "0"];
  }

  export function getTime(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    const time = new Date().getTime();
    return [time.toString()];
  }

  /**
   * 播放音效
   * 接收一个路径文件，以及一个布尔值数字，如果为1则播放一下。否则不播放
   * @param fatherNodes
   * @param _childNodes
   */
  export function playSound(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 1) {
      return [];
    }
    const fatherNode = fatherNodes[0];
    const fatherNode1 = fatherNodes[1];
    if (fatherNode instanceof TextNode && fatherNode1 instanceof TextNode) {
      const path = fatherNode.text;
      const isPlay = parseInt(fatherNode1.text);
      if (isPlay === 1) {
        SoundService.playSoundByFilePath(path);
      }
    }
    return [];
  }
}
