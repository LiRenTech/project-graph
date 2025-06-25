import { Project, service } from "../../../Project";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { LineEdge } from "../../../stage/stageObject/association/LineEdge";
import { Section } from "../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { RectangleLittleNoteEffect } from "../../feedbackService/effectEngine/concrete/RectangleLittleNoteEffect";
import { TextRaiseEffectLocated } from "../../feedbackService/effectEngine/concrete/TextRaiseEffectLocated";
import { AutoComputeUtils } from "./AutoComputeUtils";
import { CompareFunctions } from "./functions/compareLogic";
import { MathFunctions } from "./functions/mathLogic";
import { NodeLogic } from "./functions/nodeLogic";
import { ProgramFunctions } from "./functions/programLogic";
import { StringFunctions } from "./functions/stringLogic";
import { LogicNodeNameEnum, LogicNodeSimpleOperatorEnum } from "./logicNodeNameEnum";

type MathFunctionType = (args: number[]) => number[];
type StringFunctionType = (args: string[]) => string[];
type OtherFunctionType = (fatherNodes: ConnectableEntity[], childNodes: ConnectableEntity[]) => string[];
type StringFunctionMap = Record<string, StringFunctionType>;
type OtherFunctionMap = Record<string, OtherFunctionType>;

@service("autoCompute")
export class AutoCompute {
  /**
   *
   * 简单符号与函数的映射
   */
  static MapOperationNameFunction: StringFunctionMap = {
    [LogicNodeSimpleOperatorEnum.ADD]: AutoCompute.funcTypeTrans(MathFunctions.add),
    [LogicNodeSimpleOperatorEnum.SUBTRACT]: AutoCompute.funcTypeTrans(MathFunctions.subtract),
    [LogicNodeSimpleOperatorEnum.MULTIPLY]: AutoCompute.funcTypeTrans(MathFunctions.multiply),
    [LogicNodeSimpleOperatorEnum.DIVIDE]: AutoCompute.funcTypeTrans(MathFunctions.divide),
    [LogicNodeSimpleOperatorEnum.MODULO]: AutoCompute.funcTypeTrans(MathFunctions.modulo),
    [LogicNodeSimpleOperatorEnum.POWER]: AutoCompute.funcTypeTrans(MathFunctions.power),
    // 比较
    [LogicNodeSimpleOperatorEnum.LT]: AutoCompute.funcTypeTrans(CompareFunctions.lessThan),
    [LogicNodeSimpleOperatorEnum.GT]: AutoCompute.funcTypeTrans(CompareFunctions.greaterThan),
    [LogicNodeSimpleOperatorEnum.LTE]: AutoCompute.funcTypeTrans(CompareFunctions.isIncreasing),
    [LogicNodeSimpleOperatorEnum.GTE]: AutoCompute.funcTypeTrans(CompareFunctions.isDecreasing),
    [LogicNodeSimpleOperatorEnum.EQ]: AutoCompute.funcTypeTrans(CompareFunctions.isSame),
    [LogicNodeSimpleOperatorEnum.NEQ]: AutoCompute.funcTypeTrans(CompareFunctions.isDistinct),
    // 逻辑门
    [LogicNodeSimpleOperatorEnum.AND]: AutoCompute.funcTypeTrans(MathFunctions.and),
    [LogicNodeSimpleOperatorEnum.OR]: AutoCompute.funcTypeTrans(MathFunctions.or),
    [LogicNodeSimpleOperatorEnum.NOT]: AutoCompute.funcTypeTrans(MathFunctions.not),
    [LogicNodeSimpleOperatorEnum.XOR]: AutoCompute.funcTypeTrans(MathFunctions.xor),
  };

  /**
   * 双井号格式的名字与函数的映射
   */
  static MapNameFunction: StringFunctionMap = {
    // 数学一元运算
    [LogicNodeNameEnum.ABS]: AutoCompute.funcTypeTrans(MathFunctions.abs),
    [LogicNodeNameEnum.FLOOR]: AutoCompute.funcTypeTrans(MathFunctions.floor),
    [LogicNodeNameEnum.CEIL]: AutoCompute.funcTypeTrans(MathFunctions.ceil),
    [LogicNodeNameEnum.ROUND]: AutoCompute.funcTypeTrans(MathFunctions.round),
    [LogicNodeNameEnum.SQRT]: AutoCompute.funcTypeTrans(MathFunctions.sqrt),
    // 数学二元运算
    [LogicNodeNameEnum.ADD]: AutoCompute.funcTypeTrans(MathFunctions.add),
    [LogicNodeNameEnum.SUBTRACT]: AutoCompute.funcTypeTrans(MathFunctions.subtract),
    [LogicNodeNameEnum.MULTIPLY]: AutoCompute.funcTypeTrans(MathFunctions.multiply),
    [LogicNodeNameEnum.DIVIDE]: AutoCompute.funcTypeTrans(MathFunctions.divide),
    [LogicNodeNameEnum.MODULO]: AutoCompute.funcTypeTrans(MathFunctions.modulo),
    [LogicNodeNameEnum.MAX]: AutoCompute.funcTypeTrans(MathFunctions.max),
    [LogicNodeNameEnum.MIN]: AutoCompute.funcTypeTrans(MathFunctions.min),
    [LogicNodeNameEnum.POWER]: AutoCompute.funcTypeTrans(MathFunctions.power),
    [LogicNodeNameEnum.LOG]: AutoCompute.funcTypeTrans(MathFunctions.log),
    // 数学一元函数
    [LogicNodeNameEnum.SIN]: AutoCompute.funcTypeTrans(MathFunctions.sin),
    [LogicNodeNameEnum.COS]: AutoCompute.funcTypeTrans(MathFunctions.cos),
    [LogicNodeNameEnum.TAN]: AutoCompute.funcTypeTrans(MathFunctions.tan),
    [LogicNodeNameEnum.ASIN]: AutoCompute.funcTypeTrans(MathFunctions.asin),
    [LogicNodeNameEnum.ACOS]: AutoCompute.funcTypeTrans(MathFunctions.acos),
    [LogicNodeNameEnum.ATAN]: AutoCompute.funcTypeTrans(MathFunctions.atan),
    [LogicNodeNameEnum.EXP]: AutoCompute.funcTypeTrans(MathFunctions.exp),
    [LogicNodeNameEnum.LN]: AutoCompute.funcTypeTrans(MathFunctions.ln),
    // 比较
    [LogicNodeNameEnum.LT]: AutoCompute.funcTypeTrans(CompareFunctions.lessThan),
    [LogicNodeNameEnum.GT]: AutoCompute.funcTypeTrans(CompareFunctions.greaterThan),
    [LogicNodeNameEnum.LTE]: AutoCompute.funcTypeTrans(CompareFunctions.isIncreasing),
    [LogicNodeNameEnum.GTE]: AutoCompute.funcTypeTrans(CompareFunctions.isDecreasing),
    [LogicNodeNameEnum.EQ]: AutoCompute.funcTypeTrans(CompareFunctions.isSame),
    [LogicNodeNameEnum.NEQ]: AutoCompute.funcTypeTrans(CompareFunctions.isDistinct),
    // 概率论与统计
    [LogicNodeNameEnum.COUNT]: AutoCompute.funcTypeTrans(MathFunctions.count),
    [LogicNodeNameEnum.AVE]: AutoCompute.funcTypeTrans(MathFunctions.average),
    [LogicNodeNameEnum.MEDIAN]: AutoCompute.funcTypeTrans(MathFunctions.median),
    [LogicNodeNameEnum.MODE]: AutoCompute.funcTypeTrans(MathFunctions.mode),
    [LogicNodeNameEnum.VARIANCE]: AutoCompute.funcTypeTrans(MathFunctions.variance),
    [LogicNodeNameEnum.STANDARD_DEVIATION]: AutoCompute.funcTypeTrans(MathFunctions.standardDeviation),
    [LogicNodeNameEnum.RANDOM]: AutoCompute.funcTypeTrans(MathFunctions.random),
    [LogicNodeNameEnum.RANDOM_INT]: AutoCompute.funcTypeTrans(MathFunctions.randomInt),
    [LogicNodeNameEnum.RANDOM_FLOAT]: AutoCompute.funcTypeTrans(MathFunctions.randomFloat),
    [LogicNodeNameEnum.RANDOM_POISSON]: AutoCompute.funcTypeTrans(MathFunctions.randomPoisson),
    // 逻辑门
    [LogicNodeNameEnum.AND]: AutoCompute.funcTypeTrans(MathFunctions.and),
    [LogicNodeNameEnum.OR]: AutoCompute.funcTypeTrans(MathFunctions.or),
    [LogicNodeNameEnum.NOT]: AutoCompute.funcTypeTrans(MathFunctions.not),
    [LogicNodeNameEnum.XOR]: AutoCompute.funcTypeTrans(MathFunctions.xor),
    // 字符串类计算
    [LogicNodeNameEnum.UPPER]: StringFunctions.upper,
    [LogicNodeNameEnum.LOWER]: StringFunctions.lower,
    [LogicNodeNameEnum.LEN]: StringFunctions.len,
    [LogicNodeNameEnum.COPY]: StringFunctions.copy,
    [LogicNodeNameEnum.SPLIT]: StringFunctions.split,
    [LogicNodeNameEnum.REPLACE]: StringFunctions.replace,
    [LogicNodeNameEnum.CONNECT]: StringFunctions.connect,
    [LogicNodeNameEnum.CHECK_REGEX_MATCH]: StringFunctions.checkRegexMatch,
    // 编程类功能
    [LogicNodeNameEnum.SET_VAR]: ProgramFunctions.setVar,
    [LogicNodeNameEnum.GET_VAR]: ProgramFunctions.getVar,
  };

  /**
   * 其他特殊功能的函数
   */
  static MapOtherFunction: OtherFunctionMap = {
    [LogicNodeNameEnum.RGB]: NodeLogic.setColorByRGB,
    [LogicNodeNameEnum.RGBA]: NodeLogic.setColorByRGBA,
    [LogicNodeNameEnum.GET_LOCATION]: NodeLogic.getLocation,
    [LogicNodeNameEnum.SET_LOCATION]: NodeLogic.setLocation,
    [LogicNodeNameEnum.SET_LOCATION_BY_UUID]: NodeLogic.setLocationByUUID,
    [LogicNodeNameEnum.GET_LOCATION_BY_UUID]: NodeLogic.getLocationByUUID,
    [LogicNodeNameEnum.GET_SIZE]: NodeLogic.getSize,
    [LogicNodeNameEnum.GET_MOUSE_LOCATION]: NodeLogic.getMouseLocation,
    [LogicNodeNameEnum.GET_MOUSE_WORLD_LOCATION]: NodeLogic.getMouseWorldLocation,
    [LogicNodeNameEnum.GET_CAMERA_LOCATION]: NodeLogic.getCameraLocation,
    [LogicNodeNameEnum.SET_CAMERA_LOCATION]: NodeLogic.setCameraLocation,
    [LogicNodeNameEnum.GET_CAMERA_SCALE]: NodeLogic.getCameraScale,
    [LogicNodeNameEnum.SET_CAMERA_SCALE]: NodeLogic.setCameraScale,
    [LogicNodeNameEnum.IS_COLLISION]: NodeLogic.isCollision,
    [LogicNodeNameEnum.GET_TIME]: NodeLogic.getTime,
    [LogicNodeNameEnum.GET_DATE_TIME]: NodeLogic.getDateTime,
    [LogicNodeNameEnum.ADD_DATE_TIME]: NodeLogic.addDateTime,
    [LogicNodeNameEnum.PLAY_SOUND]: NodeLogic.playSound,
    [LogicNodeNameEnum.FPS]: NodeLogic.getFps,
    [LogicNodeNameEnum.GET_NODE_RGBA]: NodeLogic.getNodeRGBA,
    [LogicNodeNameEnum.GET_NODE_UUID]: NodeLogic.getNodeUUID,
    [LogicNodeNameEnum.COLLECT_NODE_DETAILS_BY_RGBA]: NodeLogic.collectNodeDetailsByRGBA,
    [LogicNodeNameEnum.COLLECT_NODE_NAME_BY_RGBA]: NodeLogic.collectNodeNameByRGBA,
    [LogicNodeNameEnum.CREATE_TEXT_NODE_ON_LOCATION]: NodeLogic.createTextNodeOnLocation,
    [LogicNodeNameEnum.IS_HAVE_ENTITY_ON_LOCATION]: NodeLogic.isHaveEntityOnLocation,
    [LogicNodeNameEnum.REPLACE_GLOBAL_CONTENT]: NodeLogic.replaceGlobalContent,
    [LogicNodeNameEnum.SEARCH_CONTENT]: NodeLogic.searchContent,
    [LogicNodeNameEnum.DELETE_PEN_STROKE_BY_COLOR]: NodeLogic.deletePenStrokeByColor,
    [LogicNodeNameEnum.DELAY_COPY]: NodeLogic.delayCopy,
  };

  constructor(private readonly project: Project) {}

  private tickNumber = 0;

  /**
   *
   * @param tickNumber 帧号
   * @returns
   */
  tick() {
    // debug 只有在按下x键才会触发
    if (!this.project.controller.pressingKeySet.has("x")) {
      return;
    }
    if (this.project.controller.pressingKeySet.has("shift")) {
      if (this.tickNumber % 60 !== 0) {
        return;
      }
    }

    // 用于显示逻辑节点执行顺序标号
    let i = 0;

    let nodes = StageManager.getTextNodes().filter((node) => this.isTextNodeLogic(node));
    nodes = this.sortEntityByLocation(nodes) as TextNode[];

    // 自动计算引擎功能

    for (const node of nodes) {
      this.computeTextNode(node);
      this.project.effects.addEffect(TextRaiseEffectLocated.fromDebugLogicNode(i, node.geometryCenter));
      i++;
    }
    // region 计算section
    let sections = StageManager.getSections().filter(
      (section) => this.isSectionLogic(section) && section.text.length > 0,
    );
    sections = this.sortEntityByLocation(sections) as Section[];

    for (const section of sections) {
      this.computeSection(section);
    }
    // region 根据Edge计算
    for (const edge of StageManager.getLineEdges().sort(
      (a, b) => a.source.collisionBox.getRectangle().location.x - b.source.collisionBox.getRectangle().location.x,
    )) {
      this.computeEdge(edge);
    }
    NodeLogic.step++;
    // 逻辑引擎执行一步，计数器+1
  }

  /**
   * 将 MathFunctionType 转换为 StringFunctionType
   * @param mF
   * @returns
   */
  static funcTypeTrans(mF: MathFunctionType): StringFunctionType {
    return (args: string[]): string[] => {
      const numbers = args.map((arg) => AutoComputeUtils.stringToNumber(arg));
      const result = mF(numbers);
      return result.map((num) => String(num));
    };
  }

  isTextNodeLogic(node: TextNode): boolean {
    for (const name of Object.keys(AutoCompute.MapNameFunction)) {
      if (node.text === name) {
        return true;
      }
    }
    for (const name of Object.keys(AutoCompute.MapOtherFunction)) {
      if (node.text === name) {
        return true;
      }
    }
    return false;
  }

  private isSectionLogic(section: Section): boolean {
    for (const name of Object.keys(AutoCompute.MapNameFunction)) {
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
  private sortEntityByLocation(entities: ConnectableEntity[]): ConnectableEntity[] {
    // 按照y坐标排序
    // 太草了，2025.1.18 周六晚上littlefean发现y轴排序不能只传递一个对象，要传递两个对象然后相互减
    // 否则就拍了个寂寞……
    return entities.sort((a, b) => {
      const yDiff = a.collisionBox.getRectangle().location.y - b.collisionBox.getRectangle().location.y;
      if (yDiff === 0) {
        return a.collisionBox.getRectangle().location.x - b.collisionBox.getRectangle().location.x;
      }
      return yDiff;
    });
  }

  /**
   * 运行一个节点的计算
   * @param node
   */
  private computeTextNode(node: TextNode) {
    for (const name of Object.keys(AutoCompute.MapNameFunction)) {
      if (node.text === name) {
        // 发现了一个逻辑节点
        this.project.effects.addEffect(RectangleLittleNoteEffect.fromUtilsLittleNote(node));

        const result = AutoCompute.MapNameFunction[name](AutoComputeUtils.getParentTextNodes(node).map((p) => p.text));
        AutoComputeUtils.generateMultiResult(node, result);
      }
    }
    // 特殊类型计算
    for (const name of Object.keys(AutoCompute.MapOtherFunction)) {
      if (node.text === name) {
        // 发现了一个特殊节点
        if (name === LogicNodeNameEnum.DELAY_COPY) {
          // 延迟复制要传逻辑节点本身的uuid
          const result = AutoCompute.MapOtherFunction[name](
            [...AutoComputeUtils.getParentEntities(node), node],
            AutoComputeUtils.getChildTextNodes(node),
          );
          AutoComputeUtils.generateMultiResult(node, result);
          continue;
        }
        const result = AutoCompute.MapOtherFunction[name](
          AutoComputeUtils.getParentEntities(node),
          AutoComputeUtils.getChildTextNodes(node),
        );
        AutoComputeUtils.generateMultiResult(node, result);
      }
    }
  }

  private computeSection(section: Section) {
    for (const name of Object.keys(AutoCompute.MapNameFunction)) {
      if (section.text === name) {
        // 发现了一个逻辑Section
        const inputStringList: string[] = [];
        for (const child of section.children.sort(
          (a, b) => a.collisionBox.getRectangle().location.x - b.collisionBox.getRectangle().location.x,
        )) {
          if (child instanceof TextNode) {
            inputStringList.push(child.text);
          }
        }
        const result = AutoCompute.MapNameFunction[name](inputStringList);
        AutoComputeUtils.getSectionMultiResult(section, result);
      }
    }
  }

  private computeEdge(edge: LineEdge) {
    for (const name of Object.keys(AutoCompute.MapOperationNameFunction)) {
      if (edge.text === name) {
        // 发现了一个逻辑Edge
        const source = edge.source;
        const target = edge.target;
        if (source instanceof TextNode && target instanceof TextNode) {
          const inputStringList: string[] = [source.text, target.text];

          const result = AutoCompute.MapOperationNameFunction[name](inputStringList);
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
            const result = AutoCompute.MapOperationNameFunction[name](inputStringList);
            target.rename(result[0]);
          }
        }
      }
    }
  }
}
