import { v4 as uuidv4 } from "uuid";
import { AiFetcherOneShotCloudFlare } from "../../../ai/AiFetcher";
import { ApiKeyManager } from "../../../ai/ApiKeyManager";
import { PromptManager } from "../../../ai/PromptManager";
import { ArrayFunctions } from "../../../algorithm/arrayFunctions";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { Stage } from "../../Stage";
import { StageManager } from "../StageManager";

export namespace StageGeneratorAI {
  const systemPrompt =
    "你是一个具有发散式思维的人，我给你一个词之后，你会扩展出5~10个新的词。你需要以每行一个词的形式回答我，每个词之间用换行符分隔，不要有任何其他多余文字";

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
    let userContent = await PromptManager.getCurrentUserPrompt();
    userContent = userContent.replaceAll("{{nodeText}}", selectedTextNode.text);

    try {
      const responseContent: string = await AiFetcherOneShotCloudFlare.create()
        .setPrompt({
          system: systemPrompt,
          user: userContent,
        })
        .setApiKey(ApiKeyManager.getKeyCF())
        .fetch();
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
      console.log("AiFetcherOneShotCloudFlare error", error);
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
