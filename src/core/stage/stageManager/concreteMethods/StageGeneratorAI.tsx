import { fetch } from "@tauri-apps/plugin-http";
import { v4 as uuidv4 } from "uuid";
import { ApiKeyManager } from "../../../ai/ApiKeyManager";
import { ArrayFunctions } from "../../../algorithm/arrayFunctions";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { Stage } from "../../Stage";
import { StageManager } from "../StageManager";

export namespace StageGeneratorAI {
  export let fetchUrl =
    "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  export let model = "ep-20240826150107-wkr2r";

  /**
   * 扩展所有选中的节点
   */
  export async function generateNewTextNodeBySelected() {
    const selectedTextNodes = StageManager.getSelectedEntities().filter(
      (entity) => entity instanceof TextNode,
    );
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

  // function virtualGenerateTextList() {
  //   // 使用 Promise 来实现延迟
  //   return new Promise<string[]>((resolve) => {
  //     setTimeout(
  //       () => {
  //         const expandArrayList: string[] = [];
  //         for (let i = 0; i < Random.randomInt(3, 10); i++) {
  //           expandArrayList.push(
  //             "expand" + "_".repeat(Random.randomInt(3, 20)),
  //           );
  //         }
  //         resolve(expandArrayList); // 1秒后返回数组
  //       },
  //       Random.randomInt(500, 4000),
  //     );
  //   });
  // }

  async function realGenerateTextList(selectedTextNode: TextNode) {
    try {
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ApiKeyManager.getKey(),
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                "你是一个具有发散式思维的人，我给你一个词之后，你会扩展出5~10个新的词。你需要以每行一个词的形式回答我，每个词之间用换行符分隔，不要有任何其他多余文字",
            },
            {
              role: "user",
              content: `我的词是：${selectedTextNode.text}，你会扩展出5~10个新的词。每个词之间用换行符分隔`,
            },
          ],
        }),
      });
      const data = await response.json();
      const responseContent: string = data.choices[0].message.content;
      let expandArrayList: string[] = [];
      if (responseContent.includes("\n")) {
        // 多行
        expandArrayList = responseContent
          .split("\n")
          .map((line) => line.trim());
      } else {
        // 按照顿号分割
        expandArrayList = responseContent
          .split("、")
          .map((line) => line.trim());
      }

      return expandArrayList; // 返回扩展的字符串数组
    } catch (error) {
      return ["error"];
    }
  }

  function generateChildNodes(parent: TextNode, childTextList: string[]) {
    if (childTextList.length === 0) {
      return;
    }

    // 计算旋转角度
    const diffRotateDegrees =
      childTextList.length === 1 ? 0 : 90 / (childTextList.length - 1);
    let startRotateDegrees = -(90 / 2);

    const toParentDegrees: number[] = [];
    for (const edge of StageManager.getEdges()) {
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
        location: [
          parent.collisionBox.getRectangle().location.x,
          parent.collisionBox.getRectangle().location.y,
        ],
        size: [100, 100],
      });
      // moveAroundNode(newNode, parent);
      // 先让新节点和父节点中心点对齐
      newNode.moveTo(
        parent.collisionBox
          .getRectangle()
          .center.subtract(
            new Vector(
              newNode.collisionBox.getRectangle().size.x / 2,
              newNode.collisionBox.getRectangle().size.y / 2,
            ),
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
      Stage.effects.push(...EdgeRenderer.getConnectedEffects(parent, newNode));
    }
  }

  function isNodeOverlapWithOther(node: TextNode): boolean {
    const rect = node.collisionBox.getRectangle();
    for (const otherNode of StageManager.getTextNodes()) {
      if (node.uuid === otherNode.uuid) {
        continue;
      }
      if (otherNode.collisionBox.isRectangleInCollisionBox(rect)) {
        return true;
      }
    }
    return false;
  }
}
