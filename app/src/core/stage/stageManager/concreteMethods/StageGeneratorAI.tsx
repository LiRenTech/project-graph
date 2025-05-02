import { fetch } from "@tauri-apps/plugin-http";
import { v4 as uuidv4 } from "uuid";
import { Dialog } from "../../../../components/dialog";
import { ArrayFunctions } from "../../../algorithm/arrayFunctions";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { FeatureFlags } from "../../../service/FeatureFlags";
import { Settings } from "../../../service/Settings";
import { Stage } from "../../Stage";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../StageManager";

export namespace StageGeneratorAI {
  /**
   * 扩展所有选中的节点
   * 工具栏按钮的触发函数
   */
  export async function generateNewTextNodeBySelected() {
    const selectedTextNodes = StageManager.getSelectedEntities().filter((entity) => entity instanceof TextNode);
    if (selectedTextNodes.length === 0) {
      return;
    }

    // 遍历所有选中节点
    for (const selectedTextNode of selectedTextNodes) {
      selectedTextNode.isAiGenerating = true;
      const expandArrayList = await realGenerateTextList(selectedTextNode);
      selectedTextNode.isAiGenerating = false;
      generateChildNodes(selectedTextNode, expandArrayList);
    }
  }

  async function realGenerateTextList(selectedTextNode: TextNode) {
    if (!FeatureFlags.AI) {
      Dialog.show({
        type: "error",
        title: "当前版本不支持AI功能",
        content: "请使用官方版本，或在构建时添加API_BASE_URL环境变量",
      });
      return [];
    }
    try {
      const treeParents: string[] = [];
      let currentNode = selectedTextNode;
      while (true) {
        const parents = StageManager.getLineEdges().filter((edge) => edge.target === currentNode);
        // 遇到了=>-的结构，或者没有父节点了
        if (parents.length !== 1) {
          break;
        }
        // 父节点不是文本节点
        if (!(parents[0].source instanceof TextNode)) {
          break;
        }
        treeParents.push(parents[0].source.text);
        currentNode = parents[0].source;
      }
      treeParents.reverse();
      const { words } = await (
        await fetch(import.meta.env.LR_API_BASE_URL! + "/ai/extend-word", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            word: selectedTextNode.text,
            language: await Settings.get("language"),
            parents: treeParents,
          }),
        })
      ).json();
      return words;
    } catch (e) {
      console.error(e);
      return ["error"];
    }
  }

  function generateChildNodes(parent: TextNode, childTextList: string[]) {
    if (childTextList.length === 0) {
      return;
    }

    // 计算旋转角度
    const diffRotateDegrees = childTextList.length === 1 ? 0 : 90 / (childTextList.length - 1);
    let startRotateDegrees = -(90 / 2);

    const toParentDegrees: number[] = [];
    for (const edge of StageManager.getLineEdges()) {
      if (edge.target === parent) {
        toParentDegrees.push(
          edge.target.collisionBox
            .getRectangle()
            .center.subtract(edge.source.collisionBox.getRectangle().center)
            .toDegrees(),
        );
      }
    }

    if (toParentDegrees.length === 1) {
      startRotateDegrees += toParentDegrees[0];
    } else if (toParentDegrees.length > 1) {
      // 求平均值
      const avgToParentDegrees = ArrayFunctions.average(toParentDegrees);

      startRotateDegrees += avgToParentDegrees;
    }

    // 遍历扩展
    for (let i = 0; i < childTextList.length; i++) {
      const newText = childTextList[i];
      const newUUID = uuidv4();
      const newNode = new TextNode({
        uuid: newUUID,
        text: newText,
        details: "",
        location: [parent.collisionBox.getRectangle().location.x, parent.collisionBox.getRectangle().location.y],
        size: [100, 100],
      });
      // moveAroundNode(newNode, parent);
      // 先让新节点和父节点中心点对齐
      newNode.moveTo(
        parent.collisionBox
          .getRectangle()
          .center.subtract(
            new Vector(newNode.collisionBox.getRectangle().size.x / 2, newNode.collisionBox.getRectangle().size.y / 2),
          ),
      );

      // 再旋转
      newNode.move(
        Vector.fromDegrees(startRotateDegrees)
          .rotateDegrees(diffRotateDegrees * i)
          .multiply(500),
      );
      while (isNodeOverlapWithOther(newNode)) {
        newNode.move(
          Vector.fromDegrees(startRotateDegrees)
            .rotateDegrees(diffRotateDegrees * i)
            .multiply(100),
        );
      }

      StageManager.addTextNode(newNode);
      // 连线
      StageManager.connectEntity(parent, newNode);
      // 特效
      Stage.effectMachine.addEffects(EdgeRenderer.getConnectedEffects(parent, newNode));
    }
  }

  function isNodeOverlapWithOther(node: TextNode): boolean {
    const rect = node.collisionBox.getRectangle();
    for (const otherNode of StageManager.getTextNodes()) {
      if (node.uuid === otherNode.uuid) {
        continue;
      }
      if (otherNode.collisionBox.isIntersectsWithRectangle(rect)) {
        return true;
      }
    }
    return false;
  }
}
