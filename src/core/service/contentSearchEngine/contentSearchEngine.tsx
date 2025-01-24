import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Camera } from "../../stage/Camera";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { TextNode } from "../../stage/stageObject/entity/TextNode";
import { RectangleNoteEffect } from "../effectEngine/concrete/RectangleNoteEffect";

export class ContentSearchEngine {
  /**
   * 搜索结果
   */
  public searchResultNodes: TextNode[] = [];
  /**
   * 搜索结果的索引
   */
  public currentSearchResultIndex = 0;

  public startSearch(searchString: string): boolean {
    // 开始搜索
    this.searchResultNodes = [];
    for (const node of StageManager.getTextNodes()) {
      if (node.text.includes(searchString)) {
        this.searchResultNodes.push(node);
      }
    }
    this.currentSearchResultIndex = 0;
    if (this.searchResultNodes.length > 0) {
      // 选择第一个搜索结果节点
      const currentNode = this.searchResultNodes[this.currentSearchResultIndex];
      // currentNode.isSelected = true;
      Stage.effectMachine.addEffect(
        new RectangleNoteEffect(
          new ProgressNumber(0, 50),
          currentNode.rectangle,
          Color.Green,
        ),
      );
      // 摄像机对准现在的节点
      Camera.location = currentNode.rectangle.center.clone();
      return true;
    }
    return false;
  }

  /**
   * 切换下一个
   */
  public nextSearchResult() {
    if (this.currentSearchResultIndex < this.searchResultNodes.length - 1) {
      this.currentSearchResultIndex++;
    }
    // 取消选择所有节点
    for (const node of StageManager.getTextNodes()) {
      node.isSelected = false;
    }
    // 选择当前搜索结果节点
    const currentNode = this.searchResultNodes[this.currentSearchResultIndex];
    Stage.effectMachine.addEffect(
      new RectangleNoteEffect(
        new ProgressNumber(0, 50),
        currentNode.rectangle,
        Color.Green,
      ),
    );
    // 摄像机对准现在的节点
    Camera.location = currentNode.rectangle.center.clone();
  }

  /**
   * 切换上一个
   */
  public previousSearchResult() {
    if (this.currentSearchResultIndex > 0) {
      this.currentSearchResultIndex--;
    }
    // 取消选择所有节点
    for (const node of StageManager.getTextNodes()) {
      node.isSelected = false;
    }
    // 选择当前搜索结果节点
    const currentNode = this.searchResultNodes[this.currentSearchResultIndex];
    Stage.effectMachine.addEffect(
      new RectangleNoteEffect(
        new ProgressNumber(0, 50),
        currentNode.rectangle,
        Color.Green,
      ),
    );
    // 摄像机对准现在的节点
    Camera.location = currentNode.rectangle.center.clone();
  }
}
