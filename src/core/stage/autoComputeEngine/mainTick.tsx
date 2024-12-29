import { Controller } from "../../controller/Controller";
import { Color } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../stageManager/StageManager";
import { AutoComputeUtils } from "./AutoComputeUtils";
import { MathFunctions } from "./functions/mathLogic";
import { StringFunctions } from "./functions/stringLogic";
import { LogicNodeNameEnum } from "./logicNodeNameEnum";

type MathFunctionType = (args: number[]) => number[];
type StringFunctionType = (args: string[]) => string[];
type StringFunctionMap = Record<string, StringFunctionType>;

/**
 * 将 MathFunctionType 转换为 StringFunctionType
 * @param mF
 * @returns
 */
function mf2sf(mF: MathFunctionType): StringFunctionType {
  return (args: string[]): string[] => {
    const numbers = args.map((arg) => AutoComputeUtils.stringToNumber(arg));
    const result = mF(numbers);
    return result.map((num) => String(num));
  };
}

const MapNameFunction: StringFunctionMap = {
  // 数学计算
  [LogicNodeNameEnum.ADD]: mf2sf(MathFunctions.add),
  [LogicNodeNameEnum.SUBTRACT]: mf2sf(MathFunctions.subtract),
  [LogicNodeNameEnum.MULTIPLY]: mf2sf(MathFunctions.multiply),
  [LogicNodeNameEnum.DIVIDE]: mf2sf(MathFunctions.divide),
  [LogicNodeNameEnum.MODULO]: mf2sf(MathFunctions.modulo),
  [LogicNodeNameEnum.ABS]: mf2sf(MathFunctions.abs),
  [LogicNodeNameEnum.MAX]: mf2sf(MathFunctions.max),
  [LogicNodeNameEnum.MIN]: mf2sf(MathFunctions.min),
  [LogicNodeNameEnum.FLOOR]: mf2sf(MathFunctions.floor),
  [LogicNodeNameEnum.CEIL]: mf2sf(MathFunctions.ceil),
  [LogicNodeNameEnum.ROUND]: mf2sf(MathFunctions.round),
  [LogicNodeNameEnum.SQRT]: mf2sf(MathFunctions.sqrt),
  // 概率论
  [LogicNodeNameEnum.RANDOM]: mf2sf(MathFunctions.random),
  // 逻辑门
  [LogicNodeNameEnum.AND]: mf2sf(MathFunctions.and),
  [LogicNodeNameEnum.OR]: mf2sf(MathFunctions.or),
  [LogicNodeNameEnum.NOT]: mf2sf(MathFunctions.not),
  [LogicNodeNameEnum.XOR]: mf2sf(MathFunctions.xor),
  // 字符串类计算
  [LogicNodeNameEnum.UPPER]: StringFunctions.upper,
  [LogicNodeNameEnum.LOWER]: StringFunctions.lower,
  [LogicNodeNameEnum.LEN]: StringFunctions.len,
  [LogicNodeNameEnum.COPY]: StringFunctions.copy,
  [LogicNodeNameEnum.SPLIT]: StringFunctions.split,
  [LogicNodeNameEnum.REPLACE]: StringFunctions.replace,
  [LogicNodeNameEnum.CONNECT]: StringFunctions.connect,
  // 集合计算
  [LogicNodeNameEnum.COUNT]: mf2sf(MathFunctions.count),
};

export function autoComputeEngineTick() {
  // debug 只有在按下x键才会触发
  if (!Controller.pressingKeySet.has("x")) {
    return;
  }
  // 自动计算引擎功能
  for (const node of StageManager.getTextNodes()) {
    if (node.text === "#TEST#") {
      node.rename("Hello World!!");
    }

    for (const name of Object.keys(MapNameFunction)) {
      if (node.text === name) {
        const result = MapNameFunction[name](
          AutoComputeUtils.getParentTextNodes(node)
            .sort(
              (a, b) =>
                a.collisionBox.getRectangle().location.x -
                b.collisionBox.getRectangle().location.x,
            )
            .map((p) => p.text),
        );
        AutoComputeUtils.getMultiResult(node, result);
      }
    }
    // 特殊类型计算
    if (node.text === "#RGB#") {
      // region 颜色类计算
      // 获取三个节点的颜色，并将子节点颜色更改为这个颜色
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 3) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const parent3 = parents[2];
        const r = AutoComputeUtils.stringToNumber(parent1.text);
        const g = AutoComputeUtils.stringToNumber(parent2.text);
        const b = AutoComputeUtils.stringToNumber(parent3.text);
        const childrenList = StageManager.nodeChildrenArray(node).filter(
          (node) => node instanceof TextNode,
        );
        for (const child of childrenList) {
          child.color = new Color(r, g, b);
        }
      }
    } else if (node.text === "#RGBA#") {
      // 获取四个节点的颜色，并将子节点颜色更改为这个颜色
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 4) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const parent3 = parents[2];
        const parent4 = parents[3];
        const r = AutoComputeUtils.stringToNumber(parent1.text);
        const g = AutoComputeUtils.stringToNumber(parent2.text);
        const b = AutoComputeUtils.stringToNumber(parent3.text);
        const a = AutoComputeUtils.stringToNumber(parent4.text);
        const childrenList = StageManager.nodeChildrenArray(node).filter(
          (node) => node instanceof TextNode,
        );
        for (const child of childrenList) {
          child.color = new Color(r, g, b, a);
        }
      }
    } else if (node.text === "#GET_LOCATION#") {
      // 获取节点的位置
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        AutoComputeUtils.getMultiResult(node, [
          parent.collisionBox.getRectangle().location.x.toString(),
          parent.collisionBox.getRectangle().location.y.toString(),
        ]);
      }
    } else if (node.text === "#SET_LOCATION#") {
      // 设置节点的位置
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 2) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const x = AutoComputeUtils.stringToNumber(parent1.text);
        const y = AutoComputeUtils.stringToNumber(parent2.text);
        if (x && y) {
          // 获取唯一子节点
          const child = StageManager.nodeChildrenArray(node).find(
            (node) => node instanceof TextNode,
          );
          if (child) {
            child.moveTo(new Vector(x, y));
          }
        }
      }
    }
  }
  // region 计算section
  for (const section of StageManager.getSections()) {
    for (const name of Object.keys(MapNameFunction)) {
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
