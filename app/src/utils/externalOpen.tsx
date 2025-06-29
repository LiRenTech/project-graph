import { open } from "@tauri-apps/plugin-shell";
import { Stage } from "../core/stage/Stage";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { Entity } from "../core/stage/stageObject/abstract/StageEntity";
import { ImageNode } from "../core/stage/stageObject/entity/ImageNode";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { PathString } from "./pathString";

/**
 * 工具栏中的地球仪图标
 */
export async function openBrowserOrFile() {
  for (const node of StageManager.getSelectedEntities()) {
    if (node instanceof TextNode) {
      openOneTextNode(node);
    } else {
      openOneEntity(node);
    }
  }
}

function openOneEntity(node: Entity) {
  let targetUrl = node.details;
  if (node.details.trim() !== "") {
    const firstLine = node.details.trim().split("\n")[0].trim();
    targetUrl = firstLine;
  }
  targetUrl = splitDoubleQuote(targetUrl);
  myOpen(targetUrl);
}

/**
 * 打开一个文本节点url
 * 先看看详细信息的第一行是不是内容，如果符合，就根据它打开
 * 如果不符合，就根据内容打开
 * @param node
 */
function openOneTextNode(node: TextNode) {
  let targetUrl = node.text;
  if (node.details.trim() !== "") {
    const firstLine = node.details.trim().split("\n")[0].trim();
    targetUrl = firstLine;
  }
  targetUrl = splitDoubleQuote(targetUrl);
  myOpen(targetUrl);
  // 2025年1月4日——有自动备份功能了，好像不需要再加验证了

  // if (PathString.isValidURL(nodeText)) {
  //   // 是网址
  //   myOpen(nodeText);
  // } else {
  //   const isExists = await exists(nodeText);
  //   if (isExists) {
  //     // 是文件
  //     myOpen(nodeText);
  //   } else {
  //     // 不是网址也不是文件，不做处理
  //     this.project.effects.addEffect(new TextRiseEffect("非法文件路径: " + nodeText));
  //   }
  // }
}

/**
 * 去除字符串两端的引号
 * @param str
 */
function splitDoubleQuote(str: string) {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  return str;
}

export function openSelectedImageNode() {
  for (const entity of StageManager.getSelectedEntities()) {
    if (entity instanceof ImageNode && entity.isSelected) {
      myOpen(PathString.dirPath(Stage.path.getFilePath()) + PathString.getSep() + entity.path);
    }
  }
}
/**
 * 调用tauri框架的open方法
 * @param url
 */
export function myOpen(url: string) {
  open(url)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((_) => {})
    .catch((e) => {
      // 依然会导致程序崩溃，具体原因未知
      // 2025年2月17日，好像不会再崩溃了，只是可能会弹窗说找不到文件
      console.error(e);
    });
}
