import { Controller } from "../../controller/Controller";
import { Color } from "../../dataStruct/Color";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../stageManager/StageManager";
import { AutoComputeUtils } from "./autoComputeUtils";

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
    // region 数字类计算
    if (node.text === "#ADD#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      let sumResult = 0;
      for (const parent of parents) {
        sumResult += AutoComputeUtils.stringToNumber(parent.text);
      }
      const resultText = String(sumResult);
      AutoComputeUtils.getNodeOneResult(node, resultText);
    } else if (node.text === "#MUL#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      let productResult = 1;
      for (const parent of parents) {
        productResult *= AutoComputeUtils.stringToNumber(parent.text);
      }
      const resultText = String(productResult);
      AutoComputeUtils.getNodeOneResult(node, resultText);
    } else if (node.text === "#AND#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      let result = 1;
      for (const parent of parents) {
        result = result && AutoComputeUtils.stringToNumber(parent.text);
      }
      const resultText = String(result);
      AutoComputeUtils.getNodeOneResult(node, resultText);
    } else if (node.text === "#OR#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      let result = 0;
      for (const parent of parents) {
        result = result || AutoComputeUtils.stringToNumber(parent.text);
      }
      const resultText = String(result);
      AutoComputeUtils.getNodeOneResult(node, resultText);
    } else if (node.text === "#NOT#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = String(
          AutoComputeUtils.stringToNumber(parent.text) === 0 ? 1 : 0,
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#RANDOM#") {
      const randomNumber = Math.random();
      const resultText = String(randomNumber);
      AutoComputeUtils.getNodeOneResult(node, resultText);
    } else if (node.text === "#FLOOR#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = String(
          Math.floor(AutoComputeUtils.stringToNumber(parent.text)),
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#CEIL#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = String(
          Math.ceil(AutoComputeUtils.stringToNumber(parent.text)),
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#MOD#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 2) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const resultText = String(
          AutoComputeUtils.stringToNumber(parent1.text) %
            AutoComputeUtils.stringToNumber(parent2.text),
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#SUB#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 2) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const resultText = String(
          AutoComputeUtils.stringToNumber(parent1.text) -
            AutoComputeUtils.stringToNumber(parent2.text),
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#DIV#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 2) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const resultText = String(
          AutoComputeUtils.stringToNumber(parent1.text) /
            AutoComputeUtils.stringToNumber(parent2.text),
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#ABS#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = String(
          Math.abs(AutoComputeUtils.stringToNumber(parent.text)),
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#COPY#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = parent.text;
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#LEN#") {
      // region 字符串类计算
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = String(parent.text.length);
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#UPPER#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = parent.text.toUpperCase();
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#LOWER#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 1) {
        const parent = parents[0];
        const resultText = parent.text.toLowerCase();
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#SPLIT#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 2) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const resultTextList = parent1.text.split(parent2.text);
        AutoComputeUtils.getMultiResult(node, resultTextList);
      }
    } else if (node.text === "#REPLACE#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 3) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const parent3 = parents[2];
        const resultText = parent1.text.replace(parent2.text, parent3.text);
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#CONNECT#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      let result = "";
      for (const parent of parents) {
        result += parent.text;
      }
      AutoComputeUtils.getNodeOneResult(node, result);
    } else if (node.text === "#REPEAT#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      if (parents.length === 2) {
        const parent1 = parents[0];
        const parent2 = parents[1];
        const resultText = parent1.text.repeat(
          AutoComputeUtils.stringToNumber(parent2.text),
        );
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#MAX#") {
      // region 集合类计算
      const parents = AutoComputeUtils.getParentTextNodes(node);
      let maxResult = -Infinity;
      for (const parent of parents) {
        const parentNumber = AutoComputeUtils.stringToNumber(parent.text);
        if (parentNumber > maxResult) {
          maxResult = parentNumber;
        }
      }
      const resultText = String(maxResult);
      AutoComputeUtils.getNodeOneResult(node, resultText);
    } else if (node.text === "#MIN#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      let minResult = Infinity;
      for (const parent of parents) {
        const parentNumber = AutoComputeUtils.stringToNumber(parent.text);
        if (parentNumber < minResult) {
          minResult = parentNumber;
        }
        const resultText = String(minResult);
        AutoComputeUtils.getNodeOneResult(node, resultText);
      }
    } else if (node.text === "#COUNT#") {
      const parents = AutoComputeUtils.getParentTextNodes(node);
      const resultText = String(parents.length);
      AutoComputeUtils.getNodeOneResult(node, resultText);
    } else if (node.text === "#RGB#") {
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
    }
  }
  // region 计算section
  for (const section of StageManager.getSections()) {
    if (section.text === "#ADD#") {
      let result = 0;
      for (const child of section.children) {
        if (child instanceof TextNode) {
          result += AutoComputeUtils.stringToNumber(child.text);
        }
      }
      const resultText = String(result);
      AutoComputeUtils.getSectionOneResult(section, resultText);
    } else if (section.text === "COUNT") {
      let result = 0;
      for (const child of section.children) {
        if (child instanceof TextNode) {
          result++;
        }
      }
      const resultText = String(result);
      AutoComputeUtils.getSectionOneResult(section, resultText);
    }
  }
}
