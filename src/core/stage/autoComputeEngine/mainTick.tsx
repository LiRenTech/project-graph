import { Controller } from "../../controller/Controller";
import { RectangleLittleNoteEffect } from "../../effect/concrete/RectangleLittleNoteEffect";
import { TextRaiseEffectLocated } from "../../effect/concrete/TextRaiseEffectLocated";
import { LineEdge } from "../../stageObject/association/LineEdge";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { ConnectableEntity } from "../../stageObject/StageObject";
import { Stage } from "../Stage";
import { StageManager } from "../stageManager/StageManager";
import { AutoComputeUtils } from "./AutoComputeUtils";
import { CompareFunctions } from "./functions/compareLogic";
import { MathFunctions } from "./functions/mathLogic";
import { NodeLogic } from "./functions/nodeLogic";
import { StringFunctions } from "./functions/stringLogic";
import {
  LogicNodeNameEnum,
  LogicNodeSimpleOperatorEnum,
} from "./logicNodeNameEnum";

type MathFunctionType = (args: number[]) => number[];
type StringFunctionType = (args: string[]) => string[];
type OtherFunctionType = (
  fatherNodes: ConnectableEntity[],
  childNodes: ConnectableEntity[],
) => string[];
type StringFunctionMap = Record<string, StringFunctionType>;
type OtherFunctionMap = Record<string, OtherFunctionType>;
/**
 * 将 MathFunctionType 转换为 StringFunctionType
 * @param mF
 * @returns
 */
function funcTypeTrans(mF: MathFunctionType): StringFunctionType {
  return (args: string[]): string[] => {
    const numbers = args.map((arg) => AutoComputeUtils.stringToNumber(arg));
    const result = mF(numbers);
    return result.map((num) => String(num));
  };
}

/**
 *
 * 简单符号与函数的映射
 */
const MapOperationNameFunction: StringFunctionMap = {
  [LogicNodeSimpleOperatorEnum.ADD]: funcTypeTrans(MathFunctions.add),
  [LogicNodeSimpleOperatorEnum.SUBTRACT]: funcTypeTrans(MathFunctions.subtract),
  [LogicNodeSimpleOperatorEnum.MULTIPLY]: funcTypeTrans(MathFunctions.multiply),
  [LogicNodeSimpleOperatorEnum.DIVIDE]: funcTypeTrans(MathFunctions.divide),
  [LogicNodeSimpleOperatorEnum.MODULO]: funcTypeTrans(MathFunctions.modulo),
  [LogicNodeSimpleOperatorEnum.POWER]: funcTypeTrans(MathFunctions.power),
  // 比较
  [LogicNodeSimpleOperatorEnum.LT]: funcTypeTrans(CompareFunctions.lessThan),
  [LogicNodeSimpleOperatorEnum.GT]: funcTypeTrans(CompareFunctions.greaterThan),
  [LogicNodeSimpleOperatorEnum.LTE]: funcTypeTrans(
    CompareFunctions.isIncreasing,
  ),
  [LogicNodeSimpleOperatorEnum.GTE]: funcTypeTrans(
    CompareFunctions.isDecreasing,
  ),
  [LogicNodeSimpleOperatorEnum.EQ]: funcTypeTrans(CompareFunctions.isSame),
  [LogicNodeSimpleOperatorEnum.NEQ]: funcTypeTrans(CompareFunctions.isDistinct),
  // 逻辑门
  [LogicNodeSimpleOperatorEnum.AND]: funcTypeTrans(MathFunctions.and),
  [LogicNodeSimpleOperatorEnum.OR]: funcTypeTrans(MathFunctions.or),
  [LogicNodeSimpleOperatorEnum.NOT]: funcTypeTrans(MathFunctions.not),
  [LogicNodeSimpleOperatorEnum.XOR]: funcTypeTrans(MathFunctions.xor),
};

/**
 * 双井号格式的名字与函数的映射
 */
const MapNameFunction: StringFunctionMap = {
  // 数学计算
  [LogicNodeNameEnum.ADD]: funcTypeTrans(MathFunctions.add),
  [LogicNodeNameEnum.SUBTRACT]: funcTypeTrans(MathFunctions.subtract),
  [LogicNodeNameEnum.MULTIPLY]: funcTypeTrans(MathFunctions.multiply),
  [LogicNodeNameEnum.DIVIDE]: funcTypeTrans(MathFunctions.divide),
  [LogicNodeNameEnum.MODULO]: funcTypeTrans(MathFunctions.modulo),
  [LogicNodeNameEnum.ABS]: funcTypeTrans(MathFunctions.abs),
  [LogicNodeNameEnum.MAX]: funcTypeTrans(MathFunctions.max),
  [LogicNodeNameEnum.MIN]: funcTypeTrans(MathFunctions.min),
  [LogicNodeNameEnum.FLOOR]: funcTypeTrans(MathFunctions.floor),
  [LogicNodeNameEnum.CEIL]: funcTypeTrans(MathFunctions.ceil),
  [LogicNodeNameEnum.ROUND]: funcTypeTrans(MathFunctions.round),
  [LogicNodeNameEnum.SQRT]: funcTypeTrans(MathFunctions.sqrt),
  [LogicNodeNameEnum.POWER]: funcTypeTrans(MathFunctions.power),
  [LogicNodeNameEnum.SIN]: funcTypeTrans(MathFunctions.sin),
  [LogicNodeNameEnum.COS]: funcTypeTrans(MathFunctions.cos),
  [LogicNodeNameEnum.TAN]: funcTypeTrans(MathFunctions.tan),
  // 比较
  [LogicNodeNameEnum.LT]: funcTypeTrans(CompareFunctions.lessThan),
  [LogicNodeNameEnum.GT]: funcTypeTrans(CompareFunctions.greaterThan),
  [LogicNodeNameEnum.LTE]: funcTypeTrans(CompareFunctions.isIncreasing),
  [LogicNodeNameEnum.GTE]: funcTypeTrans(CompareFunctions.isDecreasing),
  [LogicNodeNameEnum.EQ]: funcTypeTrans(CompareFunctions.isSame),
  [LogicNodeNameEnum.NEQ]: funcTypeTrans(CompareFunctions.isDistinct),
  // 概率论
  [LogicNodeNameEnum.RANDOM]: funcTypeTrans(MathFunctions.random),
  // 逻辑门
  [LogicNodeNameEnum.AND]: funcTypeTrans(MathFunctions.and),
  [LogicNodeNameEnum.OR]: funcTypeTrans(MathFunctions.or),
  [LogicNodeNameEnum.NOT]: funcTypeTrans(MathFunctions.not),
  [LogicNodeNameEnum.XOR]: funcTypeTrans(MathFunctions.xor),
  // 字符串类计算
  [LogicNodeNameEnum.UPPER]: StringFunctions.upper,
  [LogicNodeNameEnum.LOWER]: StringFunctions.lower,
  [LogicNodeNameEnum.LEN]: StringFunctions.len,
  [LogicNodeNameEnum.COPY]: StringFunctions.copy,
  [LogicNodeNameEnum.SPLIT]: StringFunctions.split,
  [LogicNodeNameEnum.REPLACE]: StringFunctions.replace,
  [LogicNodeNameEnum.CONNECT]: StringFunctions.connect,
  [LogicNodeNameEnum.CHECK_REGEX_MATCH]: StringFunctions.checkRegexMatch,
  // 集合计算
  [LogicNodeNameEnum.COUNT]: funcTypeTrans(MathFunctions.count),
};

/**
 * 其他特殊功能的函数
 */
const MapOtherFunction: OtherFunctionMap = {
  [LogicNodeNameEnum.RGB]: NodeLogic.rgb,
  [LogicNodeNameEnum.RGBA]: NodeLogic.rgba,
  [LogicNodeNameEnum.GET_LOCATION]: NodeLogic.getLocation,
  [LogicNodeNameEnum.SET_LOCATION]: NodeLogic.setLocation,
  [LogicNodeNameEnum.GET_SIZE]: NodeLogic.getSize,
  [LogicNodeNameEnum.GET_MOUSE_LOCATION]: NodeLogic.getMouseLocation,
  [LogicNodeNameEnum.GET_CAMERA_LOCATION]: NodeLogic.getCameraLocation,
  [LogicNodeNameEnum.SET_CAMERA_LOCATION]: NodeLogic.setCameraLocation,
  [LogicNodeNameEnum.GET_CAMERA_SCALE]: NodeLogic.getCameraScale,
  [LogicNodeNameEnum.SET_CAMERA_SCALE]: NodeLogic.setCameraScale,
  [LogicNodeNameEnum.IS_COLLISION]: NodeLogic.isCollision,
  [LogicNodeNameEnum.GET_TIME]: NodeLogic.getTime,
  [LogicNodeNameEnum.PLAY_SOUND]: NodeLogic.playSound,
  [LogicNodeNameEnum.FPS]: NodeLogic.getFps,
  [LogicNodeNameEnum.GET_NODE_RGBA]: NodeLogic.getNodeRGBA,
  [LogicNodeNameEnum.COLLECT_NODE_DETAILS_BY_RGBA]:
    NodeLogic.collectNodeDetailsByRGBA,
  [LogicNodeNameEnum.COLLECT_NODE_NAME_BY_RGBA]:
    NodeLogic.collectNodeNameByRGBA,
};

/**
 *
 * @param tickNumber 帧号
 * @returns
 */
export function autoComputeEngineTick(tickNumber: number) {
  // debug 只有在按下x键才会触发
  if (!Controller.pressingKeySet.has("x")) {
    return;
  }
  if (Controller.pressingKeySet.has("shift")) {
    if (tickNumber % 60 !== 0) {
      return;
    }
  }
  let i = 0;

  let nodes = StageManager.getTextNodes().filter(
    (node) => isTextNodeLogic(node) && node.text.length > 0,
  );
  nodes = sortEntityByLocation(nodes) as TextNode[];

  // 自动计算引擎功能

  for (const node of nodes) {
    computeTextNode(node);
    Stage.effects.push(
      TextRaiseEffectLocated.fromDebugLogicNode(i, node.geometryCenter),
    );
    i++;
  }
  // region 计算section
  let sections = StageManager.getSections().filter(
    (section) => isSectionLogic(section) && section.text.length > 0,
  );
  sections = sortEntityByLocation(sections) as Section[];

  for (const section of sections) {
    computeSection(section);
  }
  // region 根据Edge计算
  for (const edge of StageManager.getLineEdges().sort(
    (a, b) =>
      a.source.collisionBox.getRectangle().location.x -
      b.source.collisionBox.getRectangle().location.x,
  )) {
    computeEdge(edge);
  }
}

function isTextNodeLogic(node: TextNode): boolean {
  for (const name of Object.keys(MapNameFunction)) {
    if (node.text === name) {
      return true;
    }
  }
  for (const name of Object.keys(MapOtherFunction)) {
    if (node.text === name) {
      return true;
    }
  }
  return false;
}

function isSectionLogic(section: Section): boolean {
  for (const name of Object.keys(MapNameFunction)) {
    if (section.text === name) {
      return true;
    }
  }
  return false;
}

/**
 * 按y轴从上到下排序，如果y轴相同，则按照x轴从左到右排序
 * @param entities
 * @returns
 */
function sortEntityByLocation(
  entities: ConnectableEntity[],
): ConnectableEntity[] {
  // 按照y坐标排序
  // 太草了，2025.1.18 周六晚上littlefean发现y轴排序不能只传递一个对象，要传递两个对象然后相互减
  // 否则就拍了个寂寞……
  return entities.sort((a, b) => {
    const yDiff =
      a.collisionBox.getRectangle().location.y -
      b.collisionBox.getRectangle().location.y;
    if (yDiff === 0) {
      return (
        a.collisionBox.getRectangle().location.x -
        b.collisionBox.getRectangle().location.x
      );
    }
    return yDiff;
  });
}

/**
 * 运行一个节点的计算
 * @param node
 */
function computeTextNode(node: TextNode) {
  for (const name of Object.keys(MapNameFunction)) {
    if (node.text === name) {
      // 发现了一个逻辑节点
      Stage.effects.push(RectangleLittleNoteEffect.fromUtilsLittleNote(node));

      const result = MapNameFunction[name](
        AutoComputeUtils.getParentTextNodes(node).map((p) => p.text),
      );
      AutoComputeUtils.getMultiResult(node, result);
    }
  }
  // 特殊类型计算
  for (const name of Object.keys(MapOtherFunction)) {
    if (node.text === name) {
      // 发现了一个特殊节点
      const result = MapOtherFunction[name](
        AutoComputeUtils.getParentTextNodes(node),
        AutoComputeUtils.getChildTextNodes(node),
      );
      AutoComputeUtils.getMultiResult(node, result);
    }
  }
}

function computeSection(section: Section) {
  for (const name of Object.keys(MapNameFunction)) {
    if (section.text === name) {
      // 发现了一个逻辑Section
      const inputStringList: string[] = [];
      for (const child of section.children.sort(
        (a, b) =>
          a.collisionBox.getRectangle().location.x -
          b.collisionBox.getRectangle().location.x,
      )) {
        if (child instanceof TextNode) {
          inputStringList.push(child.text);
        }
      }
      const result = MapNameFunction[name](inputStringList);
      AutoComputeUtils.getSectionMultiResult(section, result);
    }
  }
}

function computeEdge(edge: LineEdge) {
  for (const name of Object.keys(MapOperationNameFunction)) {
    if (edge.text === name) {
      // 发现了一个逻辑Edge
      const source = edge.source;
      const target = edge.target;
      if (source instanceof TextNode && target instanceof TextNode) {
        const inputStringList: string[] = [source.text, target.text];

        const result = MapOperationNameFunction[name](inputStringList);
        AutoComputeUtils.getNodeOneResult(target, result[0]);
      }
    }
    // 更加简化的Edge计算
    if (edge.text.includes(name)) {
      // 检测 '+5' '/2' 这样的情况，提取后面的数字
      const num = Number(edge.text.replace(name, ""));
      if (num) {
        const source = edge.source;
        const target = edge.target;
        if (source instanceof TextNode && target instanceof TextNode) {
          const inputStringList: string[] = [source.text, num.toString()];
          const result = MapOperationNameFunction[name](inputStringList);
          target.rename(result[0]);
        }
      }
    }
  }
}
