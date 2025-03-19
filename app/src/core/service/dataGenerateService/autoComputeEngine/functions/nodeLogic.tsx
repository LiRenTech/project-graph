import { v4 } from "uuid";
import { Color } from "../../../../dataStruct/Color";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../../stage/stageObject/abstract/ConnectableEntity";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { MouseLocation } from "../../../controlService/MouseLocation";
import { SoundService } from "../../../feedbackService/SoundService";
import { AutoComputeUtils } from "../AutoComputeUtils";
import { PenStroke } from "../../../../stage/stageObject/entity/PenStroke";

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
  export function setColorByRGB(fatherNodes: ConnectableEntity[], childNodes: ConnectableEntity[]): string[] {
    if (fatherNodes.length !== 3) {
      return [];
    }
    const fatherNode1 = fatherNodes[0];
    const fatherNode2 = fatherNodes[1];
    const fatherNode3 = fatherNodes[2];
    if (fatherNode1 instanceof TextNode && fatherNode2 instanceof TextNode && fatherNode3 instanceof TextNode) {
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

  export function setColorByRGBA(fatherNodes: ConnectableEntity[], childNodes: ConnectableEntity[]): string[] {
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

  export function setLocation(fatherNodes: ConnectableEntity[], childNodes: ConnectableEntity[]): string[] {
    if (fatherNodes.length < 2) {
      return [];
    }
    const fatherNode1 = fatherNodes[0];
    const fatherNode2 = fatherNodes[1];
    if (fatherNode1 instanceof TextNode && fatherNode2 instanceof TextNode && childNodes.length > 0) {
      const x = parseFloat(fatherNode1.text);
      const y = parseFloat(fatherNode2.text);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        childNodes.forEach((node) => {
          if (node instanceof TextNode) {
            node.moveTo(new Vector(x, y));
          }
        });
      }
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

  export function getMouseWorldLocation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    const mouseLocation = MouseLocation.vector();
    const worldLocation = Renderer.transformView2World(mouseLocation);
    return [worldLocation.x.toString(), worldLocation.y.toString()];
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

  export function isCollision(fatherNodes: ConnectableEntity[], childNodes: ConnectableEntity[]): string[] {
    if (fatherNodes.length < 1) {
      return ["0"];
    }
    const fatherNode = fatherNodes[0];
    const isCollision = childNodes.some((node) => {
      return node.collisionBox.isIntersectsWithRectangle(fatherNode.collisionBox.getRectangle());
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

  export function getDateTime(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    const date = new Date();
    const result = [
      date.getFullYear(),
      date.getMonth() + 1, // 月份从0开始，需+1转为1-12[1,3](@ref)
      date.getDate(), // 直接获取日期（1-31）
      date.getDay() || 7, // 将周日（0）转为7，其他保持1-6[4,5](@ref)
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ];
    return result.map((value) => {
      return value.toString();
    });
  }

  export function addDateTime(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 8) {
      return ["Error: input node contains less than 7 nodes"];
    } else {
      if (
        fatherNodes[0] instanceof TextNode &&
        fatherNodes[1] instanceof TextNode &&
        fatherNodes[2] instanceof TextNode &&
        fatherNodes[3] instanceof TextNode &&
        fatherNodes[4] instanceof TextNode &&
        fatherNodes[5] instanceof TextNode &&
        fatherNodes[6] instanceof TextNode &&
        fatherNodes[7] instanceof TextNode
      ) {
        const year = parseInt(fatherNodes[0].text);
        const month = parseInt(fatherNodes[1].text);
        const day = parseInt(fatherNodes[2].text);
        // const _dayOfWeek = parseInt(fatherNodes[3].text);
        const hours = parseInt(fatherNodes[4].text);
        const minutes = parseInt(fatherNodes[5].text);
        const seconds = parseInt(fatherNodes[6].text);
        const timestamp = parseInt(fatherNodes[7].text);

        // 1. 将前7个参数转换为Date对象（注意月份需-1）
        const originalDate = new Date(year, month - 1, day, hours, minutes, seconds);

        // 2. 添加时间戳增量（假设timestamp单位为毫秒）
        const newTimestamp = originalDate.getTime() + timestamp;
        const newDate = new Date(newTimestamp);

        // 3. 返回新的日期时间数组
        const result = [
          newDate.getFullYear(),
          newDate.getMonth() + 1, // 修正月份为1-12
          newDate.getDate(),
          newDate.getDay() || 7, // 转换周日0为7
          newDate.getHours(),
          newDate.getMinutes(),
          newDate.getSeconds(),
        ];
        return result.map((value) => {
          return value.toString();
        });
      } else {
        return ["输入节点的类型中含有非TextNode节点"];
      }
    }
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
  export function getFps(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    return [Renderer.fps.toString()];
  }

  export function collectNodeNameByRGBA(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 4) {
      return ["Error: input node contains less than 4 nodes"];
    }
    if (
      fatherNodes[0] instanceof TextNode &&
      fatherNodes[1] instanceof TextNode &&
      fatherNodes[2] instanceof TextNode &&
      fatherNodes[3] instanceof TextNode
    ) {
      const r = parseInt(fatherNodes[0].text);
      const g = parseInt(fatherNodes[1].text);
      const b = parseInt(fatherNodes[2].text);
      const a = parseFloat(fatherNodes[3].text);
      const matchColor = new Color(r, g, b, a);
      const matchNodes: TextNode[] = [];
      for (const node of StageManager.getTextNodes()) {
        // 避开与逻辑节点相连的节点
        if (AutoComputeUtils.isNodeConnectedWithLogicNode(node)) {
          continue;
        }
        if (node.text.trim() === "") {
          continue;
        }
        // 匹配颜色
        if (node.color.equals(matchColor)) {
          matchNodes.push(node);
        }
      }
      // 将这些节点的名字拿出来
      return matchNodes.map((node) => {
        return `${node.text}`;
      });
    }
    return ["Error: input node is not valid"];
  }

  /**
   * 通过RGBA四个数字来收集颜色匹配的节点
   * @param fatherNodes
   * @param childNodes
   */
  export function collectNodeDetailsByRGBA(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 4) {
      return ["Error: input node contains less than 4 nodes"];
    }
    if (
      fatherNodes[0] instanceof TextNode &&
      fatherNodes[1] instanceof TextNode &&
      fatherNodes[2] instanceof TextNode &&
      fatherNodes[3] instanceof TextNode
    ) {
      const r = parseInt(fatherNodes[0].text);
      const g = parseInt(fatherNodes[1].text);
      const b = parseInt(fatherNodes[2].text);
      const a = parseFloat(fatherNodes[3].text);
      const matchColor = new Color(r, g, b, a);
      const matchNodes: TextNode[] = [];
      for (const node of StageManager.getTextNodes()) {
        // 避开与逻辑节点相连的节点
        if (AutoComputeUtils.isNodeConnectedWithLogicNode(node)) {
          continue;
        }
        if (node.details.trim() === "") {
          continue;
        }
        // 匹配颜色
        if (node.color.equals(matchColor)) {
          matchNodes.push(node);
        }
      }
      // 将这些节点的详细信息拿出来
      return matchNodes.map((node) => {
        return `${node.details}`;
      });
    }
    return ["Error: input node is not valid"];
  }

  export function getNodeRGBA(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 1) {
      return ["Error: input node contains less than 1 nodes"];
    }
    if (fatherNodes[0] instanceof TextNode) {
      const fatherNode = fatherNodes[0];
      const color = fatherNode.color;
      return [`${color.r}`, `${color.g}`, `${color.b}`, `${color.a}`];
    }
    return ["Error: input node is not valid"];
  }

  /**
   * 在固定的某点创建一个文本节点，输入的位置是左上角坐标位置
   * @param fatherNodes
   * @param _childNodes
   * @returns
   */
  export function createTextNodeOnLocation(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 4) {
      return ["Error: input node contains less than 4 nodes"];
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
      const b = parseInt(fatherNode4.text);
      if (b === 1) {
        const x = parseFloat(fatherNode1.text);
        const y = parseFloat(fatherNode2.text);
        const textNode = new TextNode({
          uuid: v4(),
          details: "",
          location: [x, y],
          size: [100, 100],
          color: [0, 0, 0, 0],
          text: fatherNode3.text,
        });
        StageManager.addTextNode(textNode);
        return [textNode.uuid];
      } else {
        return ["暂停创建节点"];
      }
    } else {
      return ["输入的节点格式必须都是TextNode"];
    }
  }

  /**
   * 检测某点是否含有实体
   * @param fatherNodes
   * @param _childNodes
   */
  export function isHaveEntityOnLocation(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 2) {
      return ["Error: input node contains less than 2 nodes"];
    }
    const fatherNode1 = fatherNodes[0];
    const fatherNode2 = fatherNodes[1];
    if (fatherNode1 instanceof TextNode && fatherNode2 instanceof TextNode) {
      const x = parseFloat(fatherNode1.text);
      const y = parseFloat(fatherNode2.text);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        const entity = StageManager.isEntityOnLocation(new Vector(x, y));
        if (entity) {
          return ["1"];
        } else {
          return ["0"];
        }
      } else {
        return ["输入的坐标格式不正确"];
      }
    } else {
      return ["输入的节点格式必须都是TextNode"];
    }
  }

  export function replaceGlobalContent(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length !== 2) {
      return ["输入数量不正确"];
    }
    let replacedCount = 0;
    if (fatherNodes[0] instanceof TextNode && fatherNodes[0].text.trim() !== "" && fatherNodes[1] instanceof TextNode) {
      const content = fatherNodes[0].text;
      const newString = fatherNodes[1].text;
      for (const node of StageManager.getTextNodes()) {
        // 避开与逻辑节点相连的节点
        if (AutoComputeUtils.isNodeConnectedWithLogicNode(node)) {
          continue;
        }
        if (node.text.trim() !== "" && node.text.includes(content)) {
          node.rename(node.text.replace(content, newString));
          replacedCount++;
        }
      }
    }
    return [`替换了${replacedCount}处内容`];
  }

  export function deletePenStrokeByColor(
    fatherNodes: ConnectableEntity[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _childNodes: ConnectableEntity[],
  ): string[] {
    if (fatherNodes.length < 4) {
      return ["Error: input node contains less than 3 nodes"];
    }
    if (
      fatherNodes[0] instanceof TextNode &&
      fatherNodes[1] instanceof TextNode &&
      fatherNodes[2] instanceof TextNode &&
      fatherNodes[3] instanceof TextNode
    ) {
      const r = parseInt(fatherNodes[0].text);
      const g = parseInt(fatherNodes[1].text);
      const b = parseInt(fatherNodes[2].text);
      const a = parseFloat(fatherNodes[3].text);
      const collectPenStrokes: PenStroke[] = [];
      for (const penStroke of StageManager.getPenStrokes()) {
        if (penStroke.getColor().equals(new Color(r, g, b, a))) {
          collectPenStrokes.push(penStroke);
        }
      }
      for (const penStroke of collectPenStrokes) {
        StageManager.deleteOnePenStroke(penStroke);
      }
    }
    return [];
  }
}
