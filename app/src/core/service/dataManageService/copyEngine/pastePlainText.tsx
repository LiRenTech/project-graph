import { PathString } from "../../../../utils/pathString";
import { Vector } from "../../../dataStruct/Vector";
import { Stage } from "../../../stage/Stage";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../stage/stageObject/entity/UrlNode";
import { RectanglePushInEffect } from "../../feedbackService/effectEngine/concrete/RectanglePushInEffect";
import { v4 as uuidv4 } from "uuid";

export async function copyEnginePastePlainText(item: ClipboardItem, mouseLocation: Vector) {
  const blob = await item.getType("text/plain"); // 获取文本内容
  // const text = await blob.text();
  const clipboardText = await blobToText(blob); // 将 Blob 转换为文本
  if (PathString.isValidURL(clipboardText)) {
    // 是URL类型
    const urlNode = new UrlNode({
      title: "链接",
      uuid: uuidv4(),
      url: clipboardText,
      location: [mouseLocation.x, mouseLocation.y],
    });
    StageManager.addUrlNode(urlNode);

    // 添加到section
    const mouseSections = SectionMethods.getSectionsByInnerLocation(mouseLocation);
    if (mouseSections.length > 0) {
      StageManager.goInSection([urlNode], mouseSections[0]);
      Stage.effectMachine.addEffect(
        RectanglePushInEffect.sectionGoInGoOut(
          urlNode.collisionBox.getRectangle(),
          mouseSections[0].collisionBox.getRectangle(),
        ),
      );
    }
  } else {
    const { valid, text, url } = PathString.isMarkdownUrl(clipboardText);
    if (valid) {
      // 是Markdown链接类型
      const urlNode = new UrlNode({
        title: text,
        uuid: uuidv4(),
        url: url,
        location: [mouseLocation.x, mouseLocation.y],
      });
      StageManager.addUrlNode(urlNode);

      // 添加到section
      const mouseSections = SectionMethods.getSectionsByInnerLocation(mouseLocation);
      if (mouseSections.length > 0) {
        StageManager.goInSection([urlNode], mouseSections[0]);
        Stage.effectMachine.addEffect(
          RectanglePushInEffect.sectionGoInGoOut(
            urlNode.collisionBox.getRectangle(),
            mouseSections[0].collisionBox.getRectangle(),
          ),
        );
      }
    } else {
      // 只是普通的文本
      const textNode = new TextNode({
        uuid: uuidv4(),
        text: clipboardText,
        location: [mouseLocation.x, mouseLocation.y],
        size: [100, 100],
        color: [0, 0, 0, 0],
      });
      textNode.move(new Vector(-textNode.rectangle.size.x / 2, -textNode.rectangle.size.y / 2));
      StageManager.addTextNode(textNode);

      // 添加到section
      const mouseSections = SectionMethods.getSectionsByInnerLocation(mouseLocation);
      if (mouseSections.length > 0) {
        StageManager.goInSection([textNode], mouseSections[0]);
        Stage.effectMachine.addEffect(
          RectanglePushInEffect.sectionGoInGoOut(
            textNode.collisionBox.getRectangle(),
            mouseSections[0].collisionBox.getRectangle(),
          ),
        );
      }
    }
  }
}

function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string); // 读取完成时返回结果
    reader.onerror = () => reject(reader.error); // 读取出错时返回错误
    reader.readAsText(blob); // 读取 Blob 对象作为文本
  });
}
