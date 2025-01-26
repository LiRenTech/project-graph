import { writeTextFile } from "../../../../utils/fs";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { Entity } from "../../../stage/stageObject/StageObject";

/**
 * 专注于导出各种格式内容的引擎
 * （除了svg）
 */
export class StageExportEngine {
  /**
   *
   * @param path
   * @param string 已经转换好了的Svg字符串
   */
  public async saveSvgHandle(path: string, string: string) {
    await writeTextFile(path, string);
  }

  /**
   * 前置条件已经保证了树形结构
   * @param path
   * @param successCallback
   * @param errorCallback
   */
  public async saveMarkdownHandle(path: string, textNode: TextNode) {
    const content = this.getMarkdownStringByTextNode(textNode);
    await writeTextFile(path, content);
  }
  /**
   * 格式：
   * 节点A
   * 节点B
   * 节点C
   *
   * A -> B
   * A -> C
   * B -> C
   *
   * @param nodes
   * @returns
   */
  public getPlainTextByEntities(nodes: Entity[]) {
    let nodesContent = "";
    let linksContent = "";
    for (const node of nodes) {
      if (!(node instanceof TextNode)) {
        continue;
      }
      nodesContent += node.text + "\n";
      if (node.details.trim()) {
        nodesContent += "\t" + node.details + "\n";
      }
      StageManager.nodeChildrenArray(node)
        .filter((node) => node instanceof TextNode)
        .filter((node) => nodes.includes(node))
        .forEach((child) => {
          linksContent += `${node.text} -> ${child.text}\n`;
        });
    }
    return nodesContent + "\n" + linksContent;
  }

  public getMarkdownStringByTextNode(textNode: TextNode) {
    return this.getTreeTypeString(textNode, this.getNodeMarkdown);
  }

  public getTabStringByTextNode(textNode: TextNode) {
    return this.getTreeTypeString(textNode, this.getTabText);
  }

  getTreeTypeString(
    textNode: TextNode,
    nodeToStringFunc: (node: TextNode, level: number) => string,
  ) {
    let content = "";
    const visitedUUID = new Set<string>();

    const dfs = (node: TextNode, level: number) => {
      if (visitedUUID.has(node.uuid)) {
        return;
      }
      visitedUUID.add(node.uuid);
      content += nodeToStringFunc(node, level);
      const children = StageManager.nodeChildrenArray(node).filter(
        (v) => v instanceof TextNode,
      );
      for (const child of children) {
        dfs(child, level + 1);
      }
    };

    dfs(textNode, 1);
    return content;
  }

  private getNodeMarkdown(node: TextNode, level: number): string {
    let stringResult = "";
    if (level < 6) {
      stringResult += `${"#".repeat(level)} ${node.text}\n\n`;
    } else {
      stringResult += `**${node.text}**\n\n`;
    }
    if (node.details.trim()) {
      stringResult += `${node.details}\n\n`;
    }
    return stringResult;
  }

  private getTabText(node: TextNode, level: number): string {
    let stringResult = "";
    stringResult += `${"\t".repeat(Math.max(level - 1, 0))}${node.text}\n`;
    if (node.details.trim()) {
      stringResult += `${"\t".repeat(level)}${node.details}\n`;
    }
    return stringResult;
  }
}
